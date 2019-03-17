//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 11.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

//go:generate go run --tags=dev assets_generate.go

package reef

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
	log "github.com/sirupsen/logrus"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		if strings.HasPrefix(r.RemoteAddr, "127.0.0.1") {
			return true
		}
		return false
	},
}

type WebSocket struct {
	db *Database
}

type Request struct {
	Id           string `json:"id"`
	Type         string `json:"type"`
	Action       string `json:"action"`
	ActionParams map[string]string
}

type request Request

func (req *Request) UnmarshalJSON(bs []byte) (err error) {
	r := request{}
	if err = json.Unmarshal(bs, &r); err != nil {
		return
	}

	*req = Request(r)
	m := make(map[string]string)

	if err = json.Unmarshal(bs, &m); err != nil {
		return
	}

	delete(m, "id")
	delete(m, "type")
	delete(m, "action")
	req.ActionParams = m
	return nil
}

type ActionResponse struct {
	Id      string `json:"id"`
	Type    string `json:"type"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

type BackendMessage struct {
	Type string            `json:"type"`
	Data map[string]string `json:"data"`
}

func writeErrorResponse(conn *websocket.Conn, msgId string, err error) error {
	resp := ActionResponse{msgId, "ACTION_EXECUTED", "ERROR", err.Error()}
	data, err := json.Marshal(resp)
	if err != nil {
		return err
	}
	return conn.WriteMessage(websocket.TextMessage, data)
}

func (handler WebSocket) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Error("Unable to upgrade: ", err)
		return
	}

	for {
		messageType, data, err := conn.ReadMessage()
		if err != nil {
			return
		}

		if messageType != websocket.TextMessage {
			continue
		}

		var request Request
		err = json.Unmarshal(data, &request)
		if err != nil {
			log.Error("Unable to unmarshal request: ", err)
			continue
		}

		err = writeErrorResponse(conn, request.Id, fmt.Errorf("Unsupported action: %s", request.Type))
		if err != nil {
			log.Error("Unable to write to a websocket: ", err)
			return
		}
	}
}

func RunWebServer(opts *ReefOpts) {
	ui := http.FileServer(Assets)
	var webSocket WebSocket
	var err error
	webSocket.db, err = NewDatabase(opts.Backend.DatabaseDirectory)
	if err != nil {
		log.Fatal("Unable to initialize the database: ", err)
	}
	http.Handle("/", ui)
	http.Handle("/ws", webSocket)

	var wg sync.WaitGroup
	wg.Add(len(opts.Web.BindAddresses))

	for _, addr := range opts.Web.BindAddresses {
		go func() {
			protocol := "http"
			if addr.IsHttps {
				protocol = "https"
			}
			log.Infof("Listening on %s://%s:%d", protocol, addr.Host, addr.Port)
			addressString := fmt.Sprintf("%s:%d", addr.Host, addr.Port)
			if addr.IsHttps {
				log.Fatal("Server failure: ",
					http.ListenAndServeTLS(addressString, opts.Web.Https.Cert, opts.Web.Https.Key, nil))
			} else {
				log.Fatal("Server failure: ", http.ListenAndServe(addressString, nil))
			}
			wg.Done()
		}()
	}

	wg.Wait()
}
