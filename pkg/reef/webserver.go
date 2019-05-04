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
	"net/url"
	"strings"
	"sync"
	"unicode/utf8"

	"github.com/foomo/htpasswd"
	"github.com/gorilla/websocket"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

// equalASCIIFold returns true if s is equal to t with ASCII case folding as
// defined in RFC 4790 - this comes from "github.com/gorilla/websocket"
func equalASCIIFold(s, t string) bool {
	for s != "" && t != "" {
		sr, size := utf8.DecodeRuneInString(s)
		s = s[size:]
		tr, size := utf8.DecodeRuneInString(t)
		t = t[size:]
		if sr == tr {
			continue
		}
		if 'A' <= sr && sr <= 'Z' {
			sr = sr + 'a' - 'A'
		}
		if 'A' <= tr && tr <= 'Z' {
			tr = tr + 'a' - 'A'
		}
		if sr != tr {
			return false
		}
	}
	return s == t
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header["Origin"]
		if len(origin) == 0 {
			return true
		}

		u, err := url.Parse(origin[0])
		if err != nil {
			return false
		}

		if strings.HasPrefix(u.Host, "localhost") {
			return true
		}

		return equalASCIIFold(u.Host, r.Host)
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

type BasicAuthHandler struct {
	userMap        map[string]string
	wrappedHandler http.Handler
}

func (handler BasicAuthHandler) writeUnauthorized(w http.ResponseWriter) {
	w.Header().Set("WWW-Authenticate", `Basic realm="Reef"`)
	w.WriteHeader(401)
	w.Write([]byte("Unauthorised.\n"))
}

func (handler BasicAuthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	user, pass, ok := r.BasicAuth()
	if !ok {
		handler.writeUnauthorized(w)
		return
	}

	knownPass, ok := handler.userMap[user]
	if !ok {
		handler.writeUnauthorized(w)
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(knownPass), []byte(pass))
	if err != nil {
		handler.writeUnauthorized(w)
		return
	}

	handler.wrappedHandler.ServeHTTP(w, r)
}

func NewBasicAuthHandler(userMap map[string]string, handler http.Handler) BasicAuthHandler {
	var h BasicAuthHandler
	h.wrappedHandler = handler
	h.userMap = userMap
	return h
}

func RunWebServer(opts *ReefOpts) {
	ui := http.FileServer(Assets)
	webSocketHandler, err := NewWebSocketHandler(opts.Backend)
	if err != nil {
		log.Fatal("Unable to initialize the web socket handler: ", err)
	}

	if opts.Web.EnableAuth {
		authFile := opts.Web.HtpasswdFile
		passwords, err := htpasswd.ParseHtpasswdFile(authFile)
		if err != nil {
			log.Fatal(`Authentication enabled but cannot open htpassword file "%s": %s`,
				authFile, err)
		}

		log.Infof("Loaded authentication data from: %s", authFile)

		http.Handle("/", NewBasicAuthHandler(passwords, ui))
		http.Handle("/ws", NewBasicAuthHandler(passwords, webSocketHandler))

	} else {
		http.Handle("/", ui)
		http.Handle("/ws", webSocketHandler)
	}

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
