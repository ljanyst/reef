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
	"time"

	_ "github.com/mattn/go-sqlite3"
	log "github.com/sirupsen/logrus"
)

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
	Description string `json:"description"`
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

type Database struct {
	db        *sql.DB
	mutex     sync.Mutex
	listeners map[DatabaseEventListener]bool
}

type DatabaseEventListener interface {
	OnTagUpdate(tag Tag)
	OnTagDelete(id uint64)
	OnTagList(tags []Tag)
	OnTagEdit(id uint64, newName, newColor string)
	OnSummaryUpdate(summary Summary)
	OnSummaryList(summaries []Summary)
	OnProjectDelete(id uint64)
	OnProjectUpdate(project Project)
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
				"timestamp DATETIME NOT NULL, " +
				"duration INTEGER NOT NULL," +
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

func (db *Database) getProjectsByTag(tagId uint64) ([]uint64, error) {
	projectIds := []uint64{}
	query := "SELECT projectId FROM projectTags WHERE tagId = ?;"
	rows, err := db.db.Query(query, tagId)
	if err != nil {
		return []uint64{}, fmt.Errorf("Cannot query project ids: %s", err.Error())
	}
	for rows.Next() {
		var projectId uint64
		err := rows.Scan(&projectId)
		if err != nil {
			return []uint64{}, fmt.Errorf("Cannot scan project ids: %s", err.Error())
		}
		projectIds = append(projectIds, projectId)
	}
	if err := rows.Err(); err != nil {
		return []uint64{}, fmt.Errorf("Cannot process project ids: %s", err.Error())
	}
	return projectIds, nil
}

func (db *Database) getTagById(id uint64) (Tag, error) {
	query := "SELECT id, name, color FROM tags WHERE id = ?;"
	var tag Tag
	err := db.db.QueryRow(query, id).Scan(&tag.Id, &tag.Name, &tag.Color)
	if err != nil {
		return Tag{}, fmt.Errorf("Cannot query tag: %s", err.Error())
	}

	var projectIds []uint64
	if projectIds, err = db.getProjectsByTag(id); err != nil {
		return Tag{}, err
	}

	tag.NumberOfProjects = uint32(len(projectIds))

	for _, projectId := range projectIds {
		var sInfo SessionsInfo
		if sInfo, err = db.getProjectSessions(projectId); err != nil {
			return Tag{}, err
		}
		tag.DurationTotal += sInfo.DurationTotal
		tag.DurationMonth += sInfo.DurationMonth
		tag.DurationWeek += sInfo.DurationWeek
	}

	return tag, nil
}

func (db *Database) getSummaryById(id uint64) (Summary, error) {
	query := "SELECT id, title FROM projects WHERE id = ?;"
	var summary Summary
	row := db.db.QueryRow(query, id)
	if err := row.Scan(&summary.Id, &summary.Title); err != nil {
		return Summary{}, err
	}

	var err error
	if summary.Tags, err = db.getTagIds(id); err != nil {
		return Summary{}, err
	}

	if summary.Completeness, err = db.getCompleteness(id); err != nil {
		return Summary{}, err
	}

	return summary, nil
}

func (db *Database) getTagList() ([]Tag, error) {
	var tags []Tag
	tagIds, err := db.getAllTagIds()
	if err != nil {
		return []Tag{}, err
	}

	for _, id := range tagIds {
		if tag, err := db.getTagById(id); err != nil {
			return []Tag{}, err
		} else {
			tags = append(tags, tag)
		}
	}

	return tags, nil
}

func (db *Database) getTagIds(id uint64) ([]uint64, error) {
	tagIds := []uint64{}
	query := "SELECT tagId FROM projectTags WHERE projectId = ?;"
	rows, err := db.db.Query(query, id)
	if err != nil {
		return []uint64{}, err
	}
	for rows.Next() {
		var tagId uint64
		err := rows.Scan(&tagId)
		if err != nil {
			return []uint64{}, err
		}
		tagIds = append(tagIds, tagId)
	}
	if err := rows.Err(); err != nil {
		return []uint64{}, err
	}
	return tagIds, nil
}

func (db *Database) getAllTagIds() ([]uint64, error) {
	tagIds := []uint64{}
	rows, err := db.db.Query("SELECT id FROM tags;")
	if err != nil {
		return []uint64{}, err
	}
	for rows.Next() {
		var tagId uint64
		err := rows.Scan(&tagId)
		if err != nil {
			return []uint64{}, err
		}
		tagIds = append(tagIds, tagId)
	}
	if err := rows.Err(); err != nil {
		return []uint64{}, err
	}
	return tagIds, nil
}

func (db *Database) getTasks(id uint64) ([]Task, error) {
	tasks := []Task{}
	query := "SELECT id, done, description FROM tasks WHERE projectId = ?;"
	rows, err := db.db.Query(query, id)
	if err != nil {
		return []Task{}, err
	}
	for rows.Next() {
		var task Task
		err := rows.Scan(&task.Id, &task.Done, &task.Description)
		if err != nil {
			return []Task{}, err
		}
		task.ProjectId = id
		tasks = append(tasks, task)
	}
	if err := rows.Err(); err != nil {
		return []Task{}, err
	}
	return tasks, nil
}

func (db *Database) getCompleteness(id uint64) (float32, error) {
	query := "SELECT COUNT(*) FROM tasks WHERE projectId = ?"
	var all uint64
	if err := db.db.QueryRow(query, id).Scan(&all); err != nil {
		return 0, err
	}

	query = "SELECT COUNT(*) FROM tasks WHERE projectId = ? AND done = TRUE"
	var done uint64
	if err := db.db.QueryRow(query, id).Scan(&done); err != nil {
		return 0, err
	}

	if all == 0 {
		return 1, nil
	}
	return float32(done) / float32(all), nil
}

type SessionsInfo struct {
	DurationTotal uint64
	DurationMonth uint64
	DurationWeek  uint64
	Sessions      []Session
}

func (db *Database) getProjectSessions(projectId uint64) (SessionsInfo, error) {
	var sInfo SessionsInfo
	sInfo.Sessions = []Session{}
	monthAgo := time.Now().AddDate(0, -1, 0)
	weekAgo := time.Now().AddDate(0, 0, -7)
	query := "SELECT id, timestamp, duration FROM sessions WHERE projectId = ?"
	rows, err := db.db.Query(query, projectId)
	if err != nil {
		return SessionsInfo{}, fmt.Errorf("Can't get project sessions: %s", err.Error())
	}
	for rows.Next() {
		var session Session
		var dt time.Time
		err := rows.Scan(&session.Id, &dt, &session.Duration)
		if err != nil {
			return SessionsInfo{},
				fmt.Errorf("Can't parse project sessions: %s", err.Error())
		}
		session.Date = uint64(dt.Unix())
		sInfo.Sessions = append(sInfo.Sessions, session)

		sInfo.DurationTotal += session.Duration

		if dt.After(monthAgo) {
			sInfo.DurationMonth += session.Duration
		}

		if dt.After(weekAgo) {
			sInfo.DurationWeek += session.Duration
		}
	}
	if err := rows.Err(); err != nil {
		return SessionsInfo{},
			fmt.Errorf("Can't process project sessions: %s", err.Error())
	}
	return sInfo, nil
}

func (db *Database) getProjectById(id uint64) (Project, error) {
	query := "SELECT id, title, description FROM projects WHERE id = ?;"
	var project Project
	err := db.db.QueryRow(query, id).Scan(&project.Id, &project.Title, &project.Description)
	if err != nil {
		return Project{}, err
	}

	if project.Tags, err = db.getTagIds(id); err != nil {
		return Project{}, err
	}

	if project.Tasks, err = db.getTasks(id); err != nil {
		return Project{}, err
	}

	if project.Completeness, err = db.getCompleteness(id); err != nil {
		return Project{}, err
	}

	var sInfo SessionsInfo
	if sInfo, err = db.getProjectSessions(id); err != nil {
		return Project{}, err
	}
	project.Sessions = sInfo.Sessions
	project.DurationTotal = sInfo.DurationTotal
	project.DurationMonth = sInfo.DurationMonth
	project.DurationWeek = sInfo.DurationWeek

	return project, nil
}

func (db *Database) getSummaryList() ([]Summary, error) {
	summaries := []Summary{}
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
		summary.Tags, err = db.getTagIds(summary.Id)
		if err != nil {
			return []Summary{}, err
		}
		summary.Completeness, err = db.getCompleteness(summary.Id)
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

	var id uint64
	row := db.db.QueryRow("SELECT id FROM tags WHERE name = ?;", name)
	if err := row.Scan(&id); err != nil {
		return err
	}

	tag, err := db.getTagById(id)
	if err != nil {
		return fmt.Errorf("Unable to query new tag \"%s\": %s", name, err)
	}
	db.notifyListeners(func(listener DatabaseEventListener) {
		listener.OnTagUpdate(tag)
	})
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

	query := "SELECT id FROM projects WHERE title = ?"
	var id uint64
	err = db.db.QueryRow(query, title).Scan(&id)
	if err != nil {
		return fmt.Errorf("Unable to query new project id: %s", err)
	}

	summary, err := db.getSummaryById(id)
	if err != nil {
		return fmt.Errorf("Unable to query new project \"%s\": %s", title, err)
	}
	db.notifyListeners(func(listener DatabaseEventListener) {
		listener.OnSummaryUpdate(summary)
	})
	return nil
}

func (db *Database) GetProject(id uint64, callback func(project Project)) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	project, err := db.getProjectById(id)
	if err != nil {
		return err
	}

	callback(project)
	return nil
}

func (db *Database) DeleteProject(id uint64) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	_, err := db.db.Exec("DELETE FROM projects WHERE id=?;", id)
	if err != nil {
		return fmt.Errorf("Unable to delete project: %s", err.Error())
	}

	db.notifyListeners(func(listener DatabaseEventListener) { listener.OnProjectDelete(id) })
	return nil
}

func inList(element uint64, lst []uint64) bool {
	for _, elem := range lst {
		if element == elem {
			return true
		}
	}
	return false
}

func getListDifference(old, new []uint64) (added, deleted []uint64) {
	added = []uint64{}
	deleted = []uint64{}
	for _, elem := range old {
		if !inList(elem, new) {
			deleted = append(deleted, elem)
		}
	}

	for _, elem := range new {
		if !inList(elem, old) {
			added = append(added, elem)
		}
	}
	return
}

func (db *Database) notifyProject(id uint64) error {
	summary, err := db.getSummaryById(id)
	if err != nil {
		return err
	}

	project, err := db.getProjectById(id)
	if err != nil {
		return err
	}

	db.notifyListeners(func(listener DatabaseEventListener) {
		listener.OnSummaryUpdate(summary)
		listener.OnProjectUpdate(project)
	})

	return nil
}

func (db *Database) notifyTags(tags []uint64) error {
	tagInfos := []Tag{}

	for _, tagId := range tags {
		if tagInfo, err := db.getTagById(tagId); err != nil {
			return err
		} else {
			tagInfos = append(tagInfos, tagInfo)
		}
	}

	db.notifyListeners(func(listener DatabaseEventListener) {
		for _, tagInfo := range tagInfos {
			listener.OnTagUpdate(tagInfo)
		}
	})

	return nil
}

func (db *Database) notifyProjectAndTags(projectId uint64) error {
	var tagIds []uint64
	var err error
	if tagIds, err = db.getTagIds(projectId); err != nil {
		return err
	}

	if err := db.notifyProject(projectId); err != nil {
		return err
	}
	return db.notifyTags(tagIds)
}

func (db *Database) EditProject(
	id uint64,
	title, description string,
	tags []uint64) error {

	db.mutex.Lock()
	defer db.mutex.Unlock()

	// Update the title and description
	query := "UPDATE projects SET title=?, description=? WHERE id=?;"
	_, err := db.db.Exec(query, title, description, id)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			return fmt.Errorf("Unable to rename project: %s already exists", title)
		}
		return fmt.Errorf("Unable to rename project: %s", err.Error())
	}

	// Get the difference of the tag lists
	currentTags, err := db.getTagIds(id)
	if err != nil {
		return fmt.Errorf("Unable to get tag list: %s", err.Error())
	}

	newTags, removedTags := getListDifference(currentTags, tags)

	// Associate new tags
	query = "INSERT OR IGNORE INTO projectTags (projectId, tagId) VALUES (?, ?);"
	for _, tagId := range newTags {
		_, err := db.db.Exec(query, id, tagId)
		if err != nil {
			return fmt.Errorf("Unable to associate tag with project: (%d %d)",
				id, tagId, err.Error())
		}
	}

	// Remove the association of old tags
	query = "DELETE FROM projectTags WHERE projectId = ? AND tagId = ?;"
	for _, tagId := range removedTags {
		_, err := db.db.Exec(query, id, tagId)
		if err != nil {
			return fmt.Errorf("Unable to disassociate tag from project: (%d %d)",
				id, tagId, err.Error())
		}
	}

	if err = db.notifyProject(id); err != nil {
		return err
	}

	modifiedTags := append(removedTags, newTags...)
	return db.notifyTags(modifiedTags)
}

func (db *Database) AddTask(projectId uint64, taskDescription string) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	query := "INSERT INTO tasks (projectId, done, description)" +
		"VALUES (?, 0, ?);"
	_, err := db.db.Exec(query, projectId, taskDescription)
	if err != nil {
		return fmt.Errorf("Unable add new task: %s", err.Error())
	}

	return db.notifyProject(projectId)
}

func (db *Database) DeleteTask(id uint64) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	query := "SELECT projectId FROM tasks WHERE id = ?"
	var projectId uint64
	if err := db.db.QueryRow(query, id).Scan(&projectId); err != nil {
		return err
	}

	query = "DELETE FROM tasks WHERE id = ?"
	if _, err := db.db.Exec(query, id); err != nil {
		return fmt.Errorf("Unable to delete task: %s", err.Error())
	}

	return db.notifyProject(projectId)
}

func (db *Database) ToggleTask(id uint64) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	query := "SELECT projectId FROM tasks WHERE id = ?"
	var projectId uint64
	if err := db.db.QueryRow(query, id).Scan(&projectId); err != nil {
		return fmt.Errorf("Unable to get project id for task %s", err.Error())
	}

	query = "SELECT done FROM tasks WHERE id = ?"
	var status bool
	err := db.db.QueryRow(query, id).Scan(&status)
	if err != nil {
		return fmt.Errorf("Unable get task status: %s", err.Error())
	}

	query = "UPDATE tasks SET done=? WHERE id=?"
	_, err = db.db.Exec(query, !status, id)
	if err != nil {
		return fmt.Errorf("Unable toggle task: %s", err.Error())
	}

	return db.notifyProject(projectId)
}

func (db *Database) EditTask(id uint64, description string) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	query := "SELECT projectId FROM tasks WHERE id = ?"
	var projectId uint64
	if err := db.db.QueryRow(query, id).Scan(&projectId); err != nil {
		return fmt.Errorf("Unable get projectId for task: %s", err.Error())
	}

	query = "UPDATE tasks SET description=? WHERE id=?"
	_, err := db.db.Exec(query, description, id)
	if err != nil {
		return fmt.Errorf("Unable set task description: %s", err.Error())
	}

	return db.notifyProject(projectId)
}

func (db *Database) AddSession(projectId, duration, date uint64) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	query := "INSERT INTO sessions (projectId, timestamp, duration) VALUES (?, ?, ?)"
	_, err := db.db.Exec(query, projectId, date, duration)
	if err != nil {
		return fmt.Errorf("Unable to create project: %s", err.Error())
	}

	return db.notifyProjectAndTags(projectId)
}

func (db *Database) DeleteSession(id uint64) error {
	db.mutex.Lock()
	defer db.mutex.Unlock()

	query := "SELECT projectId FROM sessions WHERE id = ?"
	var projectId uint64
	if err := db.db.QueryRow(query, id).Scan(&projectId); err != nil {
		return fmt.Errorf("Unable to get project id for session %s", err.Error())
	}

	query = "DELETE FROM sessions WHERE id = ?"
	if _, err := db.db.Exec(query, id); err != nil {
		return fmt.Errorf("Unable to delete session: %s", err.Error())
	}

	return db.notifyProjectAndTags(projectId)
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
