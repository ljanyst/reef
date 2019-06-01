//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 27.05.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

package reef

type Request struct {
	Id                  string            `json:"id"`
	Type                string            `json:"type"`
	Action              string            `json:"action"`
	TagNewParams        TagNewParams      `json:"tagNewParams"`
	TagDeleteParams     uint64            `json:"tagDeleteParams"`
	TagEditParams       TagEditParams     `json:"tagEditParams"`
	ProjectNewParams    ProjectNewParams  `json:"projectNewParams"`
	ProjectGetParams    uint64            `json:"projectGetParams"`
	ProjectDeleteParams uint64            `json:"projectDeleteParams"`
	ProjectEditParams   ProjectEditParams `json:"projectEditParams"`
	TaskNewParams       TaskNewParams     `json:"taskNewParams"`
	TaskDeleteParams    uint64            `json:"taskDeleteParams"`
	TaskToggleParams    uint64            `json:"taskToggleParams"`
	TaskEditParams      TaskEditParams    `json:"taskEditParams"`
	SessionNewParams    SessionNewParams  `json:"sessionNewParams"`
	SessionDeleteParams uint64            `json:"sessionDeleteParams"`
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

type ProjectNewParams struct {
	Name        string   `json:"name"`
	Tags        []uint64 `json:"tags"`
	Description string   `json:"description"`
}

type ProjectEditParams struct {
	Id          uint64   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []uint64 `json:"tags"`
}

type TaskNewParams struct {
	ProjectId   uint64 `json:"projectId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    uint64 `json:"priority"`
}

type TaskEditParams struct {
	TaskId      uint64 `json:"taskId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    uint64 `json:"priority"`
}

type SessionNewParams struct {
	ProjectId uint64 `json:"projectId"`
	Duration  uint64 `json:"duration"`
	Date      uint64 `json:"date"`
}
