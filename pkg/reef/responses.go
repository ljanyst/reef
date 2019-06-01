//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 27.05.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

package reef

type Tag struct {
	Id               uint64 `json:"id"`
	Name             string `json:"name"`
	Color            string `json:"color"`
	DurationTotal    uint64 `json:"durationTotal"`
	DurationMonth    uint64 `json:"durationMonth"`
	DurationWeek     uint64 `json:"durationWeek"`
	NumberOfProjects uint32 `json:"numProjects"`
}

type Summary struct {
	Id           uint64   `json:"id"`
	Title        string   `json:"title"`
	Tags         []uint64 `json:"tags"`
	Completeness float32  `json:"completeness"`
}

type Task struct {
	Id          uint64 `json:"id"`
	ProjectId   uint64 `json:"projectId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    uint8  `json:"priority"`
	Done        bool   `json:"done"`
}

type Session struct {
	Id       uint64 `json:"id"`
	Duration uint64 `json:"duration"`
	Date     uint64 `json:"date"`
}

type Project struct {
	Id            uint64    `json:"id"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	Tags          []uint64  `json:"tags"`
	DurationTotal uint64    `json:"durationTotal"`
	DurationMonth uint64    `json:"durationMonth"`
	DurationWeek  uint64    `json:"durationWeek"`
	Completeness  float32   `json:"completeness"`
	Tasks         []Task    `json:"tasks"`
	Sessions      []Session `json:"sessions"`
}

type Response struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
	Id      string      `json:"id"`
	Status  string      `json:"status"`
}
