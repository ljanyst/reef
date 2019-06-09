//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 19.04.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

package reef

import (
	"fmt"
	"sync/atomic"

	log "github.com/sirupsen/logrus"
)

const (
	addClient    = 0
	removeClient = 1
)

type ctrl struct {
	Action       uint
	Id           uint64
	ResponseChan chan<- Response
	Sync         chan bool
}

type requestWrapper struct {
	ClientId uint64
	Request  Request
}

type Controller struct {
	db           *Database
	lastLinkId   uint64
	broadcastMap map[uint64]chan<- Response
	requestChan  chan requestWrapper
	controlChan  chan ctrl
	callMap      map[string]func(*Controller, *Request) (interface{}, error)
}

func (c *Controller) notifyTags(tagIds []uint64) {
	for _, tagId := range tagIds {
		if tagInfo, err := c.db.GetTagById(tagId); err != nil {
			log.Errorf("Cannot find tag for id: %v. The database is inconsistent.", tagId)
			continue
		} else {
			c.broadcastMessage("TAG_UPDATE", tagInfo)
		}
	}
}

func (c *Controller) notifyProject(id uint64) {
	summary, err := c.db.GetSummaryById(id)
	if err != nil {
		log.Errorf("Cannot find project for id: %v. The database is inconsistent.", id)
	} else {
		c.broadcastMessage("SUMMARY_UPDATE", summary)
	}

	project, err := c.db.GetProjectById(id)
	if err != nil {
		log.Errorf("Cannot find project for id: %v. The database is inconsistent.", id)
	} else {
		c.broadcastMessage("PROJECT_UPDATE", project)
	}
}

func (c *Controller) notifyProjects(projectIds []uint64) {
	for _, projectId := range projectIds {
		c.notifyProject(projectId)
	}
}

func (c *Controller) notifyProjectAndTags(projectId uint64) {
	var tagIds []uint64
	var err error
	if tagIds, err = c.db.GetTagIdsByProjectId(projectId); err != nil {
		log.Errorf("Cannot find tags for project id: %v. The database is inconsistent.", projectId)
	} else {
		c.notifyTags(tagIds)
	}

	c.notifyProject(projectId)
}

func (c *Controller) createCallMap() {
	c.callMap = make(map[string]func(*Controller, *Request) (interface{}, error))

	c.callMap["TAG_NEW"] = func(c *Controller, req *Request) (interface{}, error) {
		p := req.TagNewParams
		id, err := c.db.CreateTag(p.Name, p.Color)
		if err != nil {
			return nil, err
		}

		tag, err := c.db.GetTagById(id)
		if err != nil {
			return nil, fmt.Errorf("Unable to query new tag \"%s\": %s", p.Name, err)
		}

		c.broadcastMessage("TAG_UPDATE", tag)
		return nil, nil
	}

	c.callMap["TAG_DELETE"] = func(c *Controller, req *Request) (interface{}, error) {
		id := req.TagDeleteParams
		projectIds, err := c.db.DeleteTag(id)
		if err != nil {
			return nil, err
		}
		c.notifyProjects(projectIds)
		c.broadcastMessage("TAG_DELETE", id)
		return nil, nil
	}

	c.callMap["TAG_EDIT"] = func(c *Controller, req *Request) (interface{}, error) {
		p := req.TagEditParams
		if err := c.db.EditTag(p.Id, p.NewName, p.NewColor); err != nil {
			return nil, err
		}
		payload := map[string]interface{}{
			"id":       p.Id,
			"newName":  p.NewName,
			"newColor": p.NewColor,
		}
		c.broadcastMessage("TAG_EDIT", payload)
		return nil, nil
	}

	c.callMap["PROJECT_NEW"] = func(c *Controller, req *Request) (interface{}, error) {
		p := req.ProjectNewParams
		id, err := c.db.CreateProject(p.Name, p.Description, p.Tags)
		if err != nil {
			return nil, err
		}

		summary, err := c.db.GetSummaryById(id)
		if err != nil {
			return nil, err
		}
		c.broadcastMessage("SUMMARY_UPDATE", summary)
		c.notifyTags(p.Tags)
		return nil, nil
	}

	c.callMap["PROJECT_GET"] = func(c *Controller, req *Request) (interface{}, error) {
		id := req.ProjectGetParams
		project, err := c.db.GetProjectById(id)
		if err != nil {
			return nil, err
		}
		return project, nil
	}

	c.callMap["PROJECT_DELETE"] = func(c *Controller, req *Request) (interface{}, error) {
		id := req.ProjectDeleteParams
		tags, err := c.db.DeleteProject(id)
		if err != nil {
			return nil, err
		}
		c.broadcastMessage("PROJECT_DELETE", id)
		c.notifyTags(tags)
		return nil, nil
	}

	c.callMap["PROJECT_EDIT"] = func(c *Controller, req *Request) (interface{}, error) {
		p := req.ProjectEditParams
		modifiedTags, err := c.db.EditProject(p.Id, p.Title, p.Description, p.Tags)
		if err != nil {
			return nil, err
		}
		c.notifyProject(p.Id)
		c.notifyTags(modifiedTags)
		return nil, nil
	}

	c.callMap["TASK_NEW"] = func(c *Controller, req *Request) (interface{}, error) {
		p := req.TaskNewParams
		err := c.db.AddTask(p.ProjectId, p.Title, p.Description, p.Priority)
		if err != nil {
			return nil, err
		}
		c.notifyProject(p.ProjectId)
		return nil, nil
	}

	c.callMap["TASK_DELETE"] = func(c *Controller, req *Request) (interface{}, error) {
		projectId, err := c.db.DeleteTask(req.TaskDeleteParams)
		if err != nil {
			return nil, err
		}
		c.notifyProject(projectId)
		return nil, nil
	}

	c.callMap["TASK_TOGGLE"] = func(c *Controller, req *Request) (interface{}, error) {
		projectId, err := c.db.ToggleTask(req.TaskToggleParams)
		if err != nil {
			return nil, err
		}
		c.notifyProject(projectId)
		return nil, nil
	}

	c.callMap["TASK_EDIT"] = func(c *Controller, req *Request) (interface{}, error) {
		p := req.TaskEditParams
		projectId, err := c.db.EditTask(p.TaskId, p.Title, p.Description, p.Priority)
		if err != nil {
			return nil, err
		}
		c.notifyProject(projectId)
		return nil, nil
	}

	c.callMap["SESSION_NEW"] = func(c *Controller, req *Request) (interface{}, error) {
		p := req.SessionNewParams
		if err := c.db.AddSession(p.ProjectId, p.Duration, p.Date); err != nil {
			return nil, err
		}
		c.notifyProjectAndTags(p.ProjectId)
		return nil, nil
	}

	c.callMap["SESSION_DELETE"] = func(c *Controller, req *Request) (interface{}, error) {
		id := req.SessionDeleteParams
		projectId, err := c.db.DeleteSession(id)
		if err != nil {
			return nil, err
		}
		c.notifyProjectAndTags(projectId)
		return nil, nil
	}
}

func (c *Controller) GetLink() *Link {
	link := NewLink()
	linkId := atomic.AddUint64(&c.lastLinkId, 1)
	sync := make(chan bool)
	c.controlChan <- ctrl{addClient, linkId, link.ResponseChan, sync}
	<-sync

	go func() {
		for {
			select {
			case <-link.CloseChan:
				c.controlChan <- ctrl{removeClient, linkId, nil, sync}
				<-sync
				return
			case req := <-link.RequestChan:
				c.requestChan <- requestWrapper{linkId, req}
			}
		}
	}()

	return link
}

func (c *Controller) writeErrorToClient(clientId uint64, msgId string, err error) {
	if channel, ok := c.broadcastMap[clientId]; ok {
		channel <- Response{"ACTION_EXECUTED", err.Error(), msgId, "ERROR"}
	}
}

func (c *Controller) writeResponseToClient(clientId uint64, msgId string, payload interface{}) {
	if channel, ok := c.broadcastMap[clientId]; ok {
		channel <- Response{"ACTION_EXECUTED", payload, msgId, "OK"}
	}
}

func (c *Controller) broadcastMessage(msgType string, payload interface{}) {
	for _, channel := range c.broadcastMap {
		channel <- Response{msgType, payload, "", ""}
	}
}

func (c *Controller) sendInitialData(channel chan<- Response) {
	if tags, err := c.db.GetTagList(); err != nil {
		log.Errorf("Unable to get the tag list: %s", err)
	} else {
		channel <- Response{"TAG_LIST", tags, "", ""}
	}

	if summaries, err := c.db.GetSummaryList(); err != nil {
		log.Errorf("Unable to get the summary list: %s", err)
	} else {
		channel <- Response{"SUMMARY_LIST", summaries, "", ""}
	}
}

func (c *Controller) handleRequests() {
	for {
		select {
		case req := <-c.requestChan:
			f, ok := c.callMap[req.Request.Action]
			if !ok {
				c.writeErrorToClient(req.ClientId, req.Request.Id,
					fmt.Errorf("Unsupported action: %s", req.Request.Action))
			}

			payload, err := f(c, &req.Request)
			if err != nil {
				c.writeErrorToClient(req.ClientId, req.Request.Id, err)
			}

			c.writeResponseToClient(req.ClientId, req.Request.Id, payload)
		case ctrl := <-c.controlChan:
			switch ctrl.Action {
			case addClient:
				c.broadcastMap[ctrl.Id] = ctrl.ResponseChan
				ctrl.Sync <- true
				c.sendInitialData(ctrl.ResponseChan)
			case removeClient:
				delete(c.broadcastMap, ctrl.Id)
				ctrl.Sync <- true
			}
		}
	}
}

func NewController(db *Database) *Controller {
	c := new(Controller)
	c.lastLinkId = 0
	c.db = db
	c.broadcastMap = make(map[uint64]chan<- Response, 250)
	c.requestChan = make(chan requestWrapper, 100)
	c.controlChan = make(chan ctrl)
	c.createCallMap()
	go c.handleRequests()
	return c
}
