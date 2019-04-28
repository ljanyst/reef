//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 11.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

//go:generate go run --tags=dev assets_generate.go

package reef

import (
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

type WebSocketHandler struct {
	db *Database
}

func (handler WebSocketHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Error("Unable to upgrade: ", err)
		return
	}

	controller := NewController(handler.db, conn)
	controller.HandleConnection()
}

func NewWebSocketHandler(opts BackendOpts) (WebSocketHandler, error) {
	var webSocketHandler WebSocketHandler
	var err error

	webSocketHandler.db, err = NewDatabase(opts.DatabaseDirectory)
	return webSocketHandler, err
}

func RunWebServer(opts *ReefOpts) {
	ui := http.FileServer(Assets)
	webSocketHandler, err := NewWebSocketHandler(opts.Backend)
	if err != nil {
		log.Fatal("Unable to initialize the database: ", err)
	}
	http.Handle("/", ui)
	http.Handle("/ws", webSocketHandler)

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