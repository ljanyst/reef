//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 19.04.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

package reef

import (
	"encoding/json"
	"fmt"

	"github.com/gorilla/websocket"
	log "github.com/sirupsen/logrus"
)

type Request struct {
	Id               string        `json:"id"`
	Type             string        `json:"type"`
	Action           string        `json:"action"`
	TagNewParams     TagNewParams  `json:"tagNewParams"`
	TagDeleteParams  uint64        `json:"tagDeleteParams"`
	TagEditParams    TagEditParams `json:"tagEditParams"`
	ProjectNewParams string        `json:"projectNewParams"`
	ProjectGetParams uint64        `json:"projectGetParams"`
}

type TagNewParams struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

type TagEditParams struct {
	Id       uint64 `json:"id"`
	NewName  string `json:"newName"`
	NewColor string `json:"newColor"`
}

type ActionResponse struct {
	Id      string      `json:"id"`
	Type    string      `json:"type"`
	Status  string      `json:"status"`
	Payload interface{} `json:"payload"`
}

type BackendMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type Controller struct {
	db      *Database
	conn    *websocket.Conn
	callMap map[string]func(*Database, *Request) (bool, error)
}

func (c *Controller) createCallMap() {
	c.callMap = make(map[string]func(*Database, *Request) (bool, error))

	c.callMap["TAG_NEW"] = func(db *Database, req *Request) (bool, error) {
		p := req.TagNewParams
		return true, db.CreateTag(p.Name, p.Color)
	}

	c.callMap["TAG_DELETE"] = func(db *Database, req *Request) (bool, error) {
		return true, db.DeleteTag(req.TagDeleteParams)
	}

	c.callMap["TAG_EDIT"] = func(db *Database, req *Request) (bool, error) {
		p := req.TagEditParams
		return true, db.EditTag(p.Id, p.NewName, p.NewColor)
	}

	c.callMap["PROJECT_NEW"] = func(db *Database, req *Request) (bool, error) {
		return true, db.CreateProject(req.ProjectNewParams)
	}

	c.callMap["PROJECT_GET"] = func(db *Database, req *Request) (bool, error) {
		return false, db.GetProject(req.ProjectGetParams, func(project Project) {
			if err := c.writeResponse(req.Id, project); err != nil {
				log.Error("Unable to send SUMMARY_LIST message:", err)
			}
		})
	}
}

func (c *Controller) writeErrorResponse(msgId string, err error) error {
	resp := ActionResponse{msgId, "ACTION_EXECUTED", "ERROR", err.Error()}
	data, err := json.Marshal(resp)
	if err != nil {
		return err
	}
	return c.conn.WriteMessage(websocket.TextMessage, data)
}

func (c *Controller) writeResponse(msgId string, payload interface{}) error {
	resp := ActionResponse{msgId, "ACTION_EXECUTED", "OK", payload}
	data, err := json.Marshal(resp)
	if err != nil {
		return err
	}
	return c.conn.WriteMessage(websocket.TextMessage, data)
}

func (c *Controller) writeBackendMessage(msgType string, payload interface{}) error {
	msg := BackendMessage{msgType, payload}
	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	return c.conn.WriteMessage(websocket.TextMessage, data)
}

func (c *Controller) OnTagNew(tag Tag) {
	if err := c.writeBackendMessage("TAG_NEW", tag); err != nil {
		log.Error("Unable to send TAG_NEW message:", err)
	}
}

func (c *Controller) OnTagDelete(id uint64) {
	if err := c.writeBackendMessage("TAG_DELETE", id); err != nil {
		log.Error("Unable to send TAG_DELETE message:", err)
	}
}

func (c *Controller) OnTagList(tags []Tag) {
	if err := c.writeBackendMessage("TAG_LIST", tags); err != nil {
		log.Error("Unable to send TAG_LIST message:", err)
	}
}

func (c *Controller) OnTagEdit(id uint64, newName, newColor string) {
	payload := map[string]interface{}{"id": id, "newName": newName, "newColor": newColor}
	if err := c.writeBackendMessage("TAG_EDIT", payload); err != nil {
		log.Error("Unable to send TAG_EDIT message:", err)
	}
}

func (c *Controller) OnSummaryNew(summary Summary) {
	if err := c.writeBackendMessage("SUMMARY_NEW", summary); err != nil {
		log.Error("Unable to send SUMMARY_NEW message:", err)
	}
}

func (c *Controller) OnSummaryList(summaries []Summary) {
	if err := c.writeBackendMessage("SUMMARY_LIST", summaries); err != nil {
		log.Error("Unable to send SUMMARY_LIST message:", err)
	}
}

func (c *Controller) HandleConnection() {
	c.db.AddEventListener(c)
	defer c.db.RemoveEventListener(c)

	for {
		messageType, data, err := c.conn.ReadMessage()
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

		f, ok := c.callMap[request.Action]
		if !ok {
			err = c.writeErrorResponse(request.Id, fmt.Errorf("Unsupported action: %s", request.Action))
			if err != nil {
				log.Error("Unable to write to a websocket: ", err)
				return
			}
		} else {
			ackSuccess, err := f(c.db, &request)
			var innerErr error
			innerErr = nil
			if err != nil {
				innerErr = c.writeErrorResponse(request.Id, err)
			} else if ackSuccess {
				innerErr = c.writeResponse(request.Id, nil)
			}
			if innerErr != nil {
				log.Error("Unable to write to a websocket: ", innerErr)
				return
			}
		}
	}
}

func NewController(db *Database, conn *websocket.Conn) *Controller {
	c := new(Controller)
	c.db = db
	c.conn = conn
	c.createCallMap()
	return c
}
