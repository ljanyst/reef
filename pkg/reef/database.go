//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 17.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

package reef

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"

	_ "github.com/mattn/go-sqlite3"
	log "github.com/sirupsen/logrus"
)

type Tag struct {
	Id               uint64 `json:"id"`
	Name             string `json:"name"`
	Color            string `json:"color"`
	MinutesTotal     uint32 `json:"minutesTotal"`
	MinutesYear      uint32 `json:"minutesYear"`
	MinutesMonth     uint32 `json:"minutesMonth"`
	NumberOfProjects uint32 `json:"numProjects"`
}

type Summary struct {
	Id           uint64   `json:"id"`
	Title        string   `json:"title"`
	Tags         []uint64 `json:"tags"`
	Completeness float32  `json:"completeness"`
}

type Task struct {
	Id    uint64 `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
}

type Session struct {
	Id       uint64 `json:"id"`
	Duration uint32 `json:"duration"`
	Date     string `json:"date"`
}

type Project struct {
	Id            uint64    `json:"id"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	Tags          []uint64  `json:"tags"`
	DurationTotal uint32    `json:"durationTotal"`
	DurationMonth uint32    `json:"durationMonth"`
	DurationWeek  uint32    `json:"durationWeek"`
	Completeness  float32   `json:"completeness"`
	Tasks         []Task    `json:"tasks"`
	Sessions      []Session `json:"sessions"`
}

type Database struct {
	db        *sql.DB
	mutex     sync.Mutex
	listeners map[DatabaseEventListener]bool
}

type DatabaseEventListener interface {
	OnTagNew(tag Tag)
	OnTagDelete(id uint64)
	OnTagList(tags []Tag)
	OnTagEdit(id uint64, newName, newColor string)
	OnSummaryNew(summary Summary)
	OnSummaryList(summaries []Summary)
}

func (db *Database) readMetadata() (md map[string]string, err error) {
	rows, err := db.db.Query("SELECT key, value FROM metadata")
	if err != nil {
		err = fmt.Errorf("Unable to read the database metadata: %s", err)
		return
	}

	md = make(map[string]string)

	for rows.Next() {
		var key string
		var val string
		rows.Scan(&key, &val)
		md[key] = val
	}

	if err = rows.Err(); err != nil {
		err = fmt.Errorf("Unable to read the database metadata: %s ", err)
		return
	}
	return
}

func (db *Database) initializeNew() error {
	initializationQueries := []struct {
		Query    string
		ErrorMsg string
	}{
		{
			"INSERT INTO metadata (key, value) VALUES (\"version\", \"1\");",
			"Unable to set the database version",
		},
		{
			"CREATE TABLE tags (" +
				"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
				"name STRING UNIQUE NOT NULL, " +
				"color STRING NOT NULL);",
			"Unable to create the tags table",
		},
		{
			"INSERT INTO tags (id, name, color) " +
				"VALUES (0, \"Archived\", \"#adadad\");",
			"Unable to create the archived tag",
		},
		{
			"CREATE TABLE projects (" +
				"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
				"title STRING UNIQUE NOT NULL, " +
				"description STRING NOT NULL);",
			"Unable to create the projects table",
		},
		{
			"CREATE TABLE projectTags (" +
				"projectId INTEGER NOT NULL, " +
				"tagId INTEGER NOT NULL, " +
				"CONSTRAINT PK_Pair PRIMARY KEY (projectId, tagId)" +
				"FOREIGN KEY(projectId) REFERENCES projects(id)," +
				"FOREIGN KEY(tagId) REFERENCES tags(id));",
			"Unable to create the project-tag table.",
		},
		{
			"CREATE TABLE tasks (" +
				"id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, " +
				"projectId INTEGER NOT NULL, " +
				"done BOOLEAN NOT NULL, " +
				"description STRING NOT NULL," +
				"FOREIGN KEY(projectId) REFERENCES projects(id));",
			"Unable to create the tasks table",
		},
		{
			"CREATE TABLE sessions (" +
				"id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, " +
				"projectId INTEGER NOT NULL, " +
				"date DATE NOT NULL, " +
				"length INTEGER NOT NULL," +
				"FOREIGN KEY(projectId) REFERENCES projects(id));",
			"Unable to create the sessions table",
		},
	}

	for _, command := range initializationQueries {
		_, err := db.db.Exec(command.Query)
		if err != nil {
			return fmt.Errorf("%s: %s", command.ErrorMsg, err)
		}
	}
	return nil
}

func (db *Database) initialize() (err error) {
	_, err = db.db.Exec("CREATE TABLE IF NOT EXISTS metadata (key STRING PRIMARY KEY, value STRING)")
	md, err := db.readMetadata()
	if err != nil {
		log.Error("Unable to read matadata from the database: ", err)
		return
	}

	var version string
	var ok bool
	if version, ok = md["version"]; !ok {
		log.Info("Creating a new database")
		err = db.initializeNew()
		return
	}

	log.Info("Database version: ", version)
	return
}

func (db *Database) AddEventListener(listener DatabaseEventListener) {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	db.listeners[listener] = true

	tags, err := db.getTagList()
	if err != nil {
		log.Fatal("Eunable to get tags:", err)
	}
	listener.OnTagList(tags)

	summaries, err := db.getSummaryList()
	if err != nil {
		log.Fatal("Eunable to get project summaries:", err)
	}
	listener.OnSummaryList(summaries)
}

func (db *Database) RemoveEventListener(listener DatabaseEventListener) {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	delete(db.listeners, listener)
}

func (db *Database) notifyListeners(action func(DatabaseEventListener)) {
	for listener, _ := range db.listeners {
		action(listener)
	}
}

func (db *Database) getTagByName(name string) (Tag, error) {
	query := "SELECT id, name, color FROM tags WHERE name = ?;"
	var tag Tag
	if err := db.db.QueryRow(query, name).Scan(&tag.Id, &tag.Name, &tag.Color); err != nil {
		return Tag{}, err
	}
	return tag, nil
}

func (db *Database) getSummaryByTitle(title string) (Summary, error) {
	query := "SELECT id, title FROM projects WHERE title = ?;"
	var summary Summary
	if err := db.db.QueryRow(query, title).Scan(&summary.Id, &summary.Title); err != nil {
		return Summary{}, err
	}
	summary.Tags = []uint64{}
	return summary, nil
}

func (db *Database) getTagList() ([]Tag, error) {
	var tags []Tag
	rows, err := db.db.Query("SELECT id, name, color FROM tags;")
	if err != nil {
		return []Tag{}, err
	}
	for rows.Next() {
		var tag Tag
		err := rows.Scan(&tag.Id, &tag.Name, &tag.Color)
		if err != nil {
			return []Tag{}, err
		}
		tags = append(tags, tag)
	}
	if err := rows.Err(); err != nil {
		return []Tag{}, err
	}
	return tags, nil
}

func (db *Database) getSummaryList() ([]Summary, error) {
	var summaries []Summary
	rows, err := db.db.Query("SELECT id, title FROM projects;")
	if err != nil {
		return []Summary{}, err
	}
	for rows.Next() {
		var summary Summary
		err := rows.Scan(&summary.Id, &summary.Title)
		if err != nil {
			return []Summary{}, err
		}
		summaries = append(summaries, summary)
	}
	if err := rows.Err(); err != nil {
		return []Summary{}, err
	}
	return summaries, nil
}

func (db *Database) CreateTag(name string, color string) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	_, err := db.db.Exec("INSERT INTO tags (name, color) VALUES (?, ?);", name, color)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			return fmt.Errorf("Unable to insert tag: %s already exists", name)
		}
		return fmt.Errorf("Unable to insert tag: %s", err.Error())
	}

	tag, err := db.getTagByName(name)
	if err != nil {
		return fmt.Errorf("Unable to query new tag \"%s\": %s", name, err)
	}
	db.notifyListeners(func(listener DatabaseEventListener) { listener.OnTagNew(tag) })
	return nil
}

func (db *Database) DeleteTag(id uint64) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	if id == 0 {
		return fmt.Errorf("Cannot delete 'Archived'")
	}

	_, err := db.db.Exec("DELETE FROM tags WHERE id=?;", id)
	if err != nil {
		return fmt.Errorf("Unable to delete tag: %s", err.Error())
	}

	db.notifyListeners(func(listener DatabaseEventListener) { listener.OnTagDelete(id) })
	return nil
}

func (db *Database) EditTag(id uint64, newName, newColor string) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	if id == 0 {
		return fmt.Errorf("Cannot edit 'Archived'")
	}

	_, err := db.db.Exec("UPDATE tags SET name=?, color=? WHERE id=?;", newName, newColor, id)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			return fmt.Errorf("Unable to rename tag: %s already exists", newName)
		}
		return fmt.Errorf("Unable to edit tag: %s", err.Error())
	}

	db.notifyListeners(func(listener DatabaseEventListener) {
		listener.OnTagEdit(id, newName, newColor)
	})
	return nil
}

func (db *Database) CreateProject(title string) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	_, err := db.db.Exec("INSERT INTO projects (title, description) VALUES (?, ?);", title, "")
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			return fmt.Errorf("Unable to create project: %s already exists", title)
		}
		return fmt.Errorf("Unable to create project: %s", err.Error())
	}

	summary, err := db.getSummaryByTitle(title)
	if err != nil {
		return fmt.Errorf("Unable to query new project \"%s\": %s", title, err)
	}
	db.notifyListeners(func(listener DatabaseEventListener) {
		listener.OnSummaryNew(summary)
	})
	return nil
}

func (db *Database) GetProject(id uint64, callback func(project Project)) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	query := "SELECT id, title, description FROM projects WHERE id = ?;"
	var project Project
	err := db.db.QueryRow(query, id).Scan(&project.Id, &project.Title, &project.Description)
	if err != nil {
		return err
	}

	callback(project)
	return nil
}

func NewDatabase(dbDir string) (*Database, error) {
	db := new(Database)
	err := os.MkdirAll(dbDir, os.ModePerm)
	if err != nil {
		return nil, err
	}

	dbFile := filepath.Join(dbDir, "reef.db")
	log.Infof("Using %s for database storage", dbFile)
	db.db, err = sql.Open("sqlite3", dbFile)
	if err != nil {
		return nil, err
	}

	err = db.initialize()
	if err != nil {
		return nil, err
	}

	db.listeners = make(map[DatabaseEventListener]bool)

	return db, nil
}
