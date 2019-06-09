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
	"io"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
	log "github.com/sirupsen/logrus"
)

type Database struct {
	db *sql.DB
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

type CommandEntry struct {
	Query    string
	ErrorMsg string
}

func (db *Database) initializeNew() error {
	initializationQueries := []CommandEntry{
		{
			`INSERT INTO metadata (key, value) VALUES ("version", "2");`,
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
			"INSERT INTO tags (name, color) " +
				`VALUES ("Archived", "#adadad");`,
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
				"priority INTEGER NOT NULL, " +
				"title STRING NOT NULL," +
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

	return executeQueries(db.db, initializationQueries)
}

func upgradeFrom1To2(db *sql.DB) error {
	log.Info("Upgrading database from version 1 to version 2")
	queries := []CommandEntry{
		{
			"ALTER TABLE tasks RENAME TO _tasks_old;",
			"Unable to rename tasks to _tasks_old",
		},
		{
			"CREATE TABLE tasks (" +
				"id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, " +
				"projectId INTEGER NOT NULL, " +
				"done BOOLEAN NOT NULL, " +
				"priority INTEGER NOT NULL, " +
				"title STRING NOT NULL," +
				"description STRING NOT NULL," +
				"FOREIGN KEY(projectId) REFERENCES projects(id));",
			"Unable to create the new tasks table",
		},
		{
			"INSERT INTO tasks (id, projectId, done, priority, title, description)" +
				`SELECT id, projectId, done, 1, description, ""` +
				"FROM _tasks_old;",
			"Unable to copy the rows to the new tasks table",
		},
		{
			"DROP TABLE _tasks_old;",
			"Unable to drop the old tasks table",
		},
	}

	return executeQueries(db, queries)
}

func executeQueries(db *sql.DB, queries []CommandEntry) error {
	for _, command := range queries {
		_, err := db.Exec(command.Query)
		if err != nil {
			return fmt.Errorf("%s: %s", command.ErrorMsg, err)
		}
	}
	return nil

}

func getUpgraders() map[uint64]func(db *sql.DB) error {
	upgraders := make(map[uint64]func(db *sql.DB) error)
	upgraders[1] = upgradeFrom1To2
	return upgraders
}

func copyFile(fromFn, toFn string) error {
	from, err := os.Open(fromFn)
	if err != nil {
		return err
	}
	defer from.Close()

	to, err := os.OpenFile(toFn, os.O_RDWR|os.O_CREATE, 0600)
	if err != nil {
		return err
	}
	defer to.Close()

	_, err = io.Copy(to, from)
	if err != nil {
		return err
	}

	return nil
}

func (db *Database) upgrade(dbDir string, fileVersion, currentVersion uint64) error {
	t := time.Now()
	backupFileName := fmt.Sprintf("reef.db-%s-version-%d", t.Format("2006-01-02T15:04:05.999999"), fileVersion)
	backupFileName = filepath.Join(dbDir, backupFileName)
	dbFile := filepath.Join(dbDir, "reef.db")

	err := copyFile(dbFile, backupFileName)
	if err != nil {
		log.Error("Unable to make a backup copy of reef.db: ", err)
		return err
	}

	db.db, err = sql.Open("sqlite3", dbFile)
	if err != nil {
		return err
	}

	upgraders := getUpgraders()
	for i := fileVersion; i < currentVersion; i++ {
		upgrader, ok := upgraders[i]
		if !ok {
			return fmt.Errorf("Cannot find database upgrader from version %d to version %d", i, i+1)
		}
		if err = upgrader(db.db); err != nil {
			return fmt.Errorf("Database upgrader from version %d to version %d failed: %s", i, i+1, err.Error())
		}
	}

	_, err = db.db.Exec(`UPDATE metadata SET value=? WHERE key="version";`, strconv.FormatUint(2, 10))
	if err != nil {
		return fmt.Errorf("Unable to update version number in the database metadata")
	}

	return nil
}

func (db *Database) initialize(dbDir string) (err error) {
	dbFile := filepath.Join(dbDir, "reef.db")
	log.Infof("Using %s for database storage", dbFile)
	db.db, err = sql.Open("sqlite3", dbFile)
	if err != nil {
		return
	}

	_, err = db.db.Exec("CREATE TABLE IF NOT EXISTS metadata (key STRING PRIMARY KEY, value STRING)")
	md, err := db.readMetadata()
	if err != nil {
		log.Error("Unable to read matadata from the database: ", err)
		return
	}

	var fileVersionStr string
	var fileVersion uint64
	var ok bool
	if fileVersionStr, ok = md["version"]; !ok {
		log.Info("Creating a new database")
		err = db.initializeNew()
		return
	}

	if fileVersion, err = strconv.ParseUint(fileVersionStr, 10, 64); err != nil {
		log.Errorf("Unable to parse the version string: %s", err.Error())
		return
	}

	log.Info("Database version: ", fileVersion)

	const currentVersion = 2
	if fileVersion != currentVersion {
		if err = db.db.Close(); err != nil {
			log.Error("Unable to close the database: ", err)
			return
		}

		if err = db.upgrade(dbDir, fileVersion, currentVersion); err != nil {
			log.Error("Unable to upgrade the database: ", err)
			return
		}
	}
	return
}

func (db *Database) GetProjectsByTag(tagId uint64) ([]uint64, error) {
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

func (db *Database) GetTagById(id uint64) (Tag, error) {
	query := "SELECT id, name, color FROM tags WHERE id = ?;"
	var tag Tag
	err := db.db.QueryRow(query, id).Scan(&tag.Id, &tag.Name, &tag.Color)
	if err != nil {
		return Tag{}, fmt.Errorf("Cannot query tag: %s", err.Error())
	}

	var projectIds []uint64
	if projectIds, err = db.GetProjectsByTag(id); err != nil {
		return Tag{}, err
	}

	tag.NumberOfProjects = uint32(len(projectIds))

	for _, projectId := range projectIds {
		var sInfo SessionsInfo
		if sInfo, err = db.GetProjectSessions(projectId); err != nil {
			return Tag{}, err
		}
		tag.DurationTotal += sInfo.DurationTotal
		tag.DurationMonth += sInfo.DurationMonth
		tag.DurationWeek += sInfo.DurationWeek
	}

	return tag, nil
}

func (db *Database) GetSummaryById(id uint64) (Summary, error) {
	query := "SELECT id, title FROM projects WHERE id = ?;"
	var summary Summary
	row := db.db.QueryRow(query, id)
	if err := row.Scan(&summary.Id, &summary.Title); err != nil {
		return Summary{}, err
	}

	var err error
	if summary.Tags, err = db.GetTagIdsByProjectId(id); err != nil {
		return Summary{}, err
	}

	if summary.Completeness, err = db.GetProjectCompleteness(id); err != nil {
		return Summary{}, err
	}

	return summary, nil
}

func (db *Database) GetTagList() ([]Tag, error) {
	var tags []Tag
	tagIds, err := db.GetAllTagIds()
	if err != nil {
		return []Tag{}, err
	}

	for _, id := range tagIds {
		if tag, err := db.GetTagById(id); err != nil {
			return []Tag{}, err
		} else {
			tags = append(tags, tag)
		}
	}

	return tags, nil
}

func (db *Database) getIdsById(query string, id uint64) ([]uint64, error) {
	ids := []uint64{}

	rows, err := db.db.Query(query, id)
	if err != nil {
		return []uint64{}, err
	}
	for rows.Next() {
		var readId uint64
		err := rows.Scan(&readId)
		if err != nil {
			return []uint64{}, err
		}
		ids = append(ids, readId)
	}
	if err := rows.Err(); err != nil {
		return []uint64{}, err
	}
	return ids, nil
}

func (db *Database) GetTagIdsByProjectId(id uint64) ([]uint64, error) {
	return db.getIdsById("SELECT tagId FROM projectTags WHERE projectId = ?;", id)
}

func (db *Database) GetProjectIdsByTagId(id uint64) ([]uint64, error) {
	return db.getIdsById("SELECT projectId FROM projectTags WHERE tagId = ?;", id)
}

func (db *Database) GetAllTagIds() ([]uint64, error) {
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

func (db *Database) GetProjectTasks(id uint64) ([]Task, error) {
	tasks := []Task{}
	query := "SELECT id, done, priority, title, description FROM tasks WHERE projectId = ?;"
	rows, err := db.db.Query(query, id)
	if err != nil {
		return []Task{}, err
	}
	for rows.Next() {
		var task Task
		err := rows.Scan(&task.Id, &task.Done, &task.Priority, &task.Title, &task.Description)
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

func (db *Database) GetProjectCompleteness(id uint64) (float32, error) {
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

func (db *Database) GetProjectSessions(projectId uint64) (SessionsInfo, error) {
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

func (db *Database) GetProjectById(id uint64) (Project, error) {
	query := "SELECT id, title, description FROM projects WHERE id = ?;"
	var project Project
	err := db.db.QueryRow(query, id).Scan(&project.Id, &project.Title, &project.Description)
	if err != nil {
		return Project{}, err
	}

	if project.Tags, err = db.GetTagIdsByProjectId(id); err != nil {
		return Project{}, err
	}

	if project.Tasks, err = db.GetProjectTasks(id); err != nil {
		return Project{}, err
	}

	if project.Completeness, err = db.GetProjectCompleteness(id); err != nil {
		return Project{}, err
	}

	var sInfo SessionsInfo
	if sInfo, err = db.GetProjectSessions(id); err != nil {
		return Project{}, err
	}
	project.Sessions = sInfo.Sessions
	project.DurationTotal = sInfo.DurationTotal
	project.DurationMonth = sInfo.DurationMonth
	project.DurationWeek = sInfo.DurationWeek

	return project, nil
}

func (db *Database) GetSummaryList() ([]Summary, error) {
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
		summary.Tags, err = db.GetTagIdsByProjectId(summary.Id)
		if err != nil {
			return []Summary{}, err
		}
		summary.Completeness, err = db.GetProjectCompleteness(summary.Id)
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

func (db *Database) CreateTag(name string, color string) (uint64, error) {
	_, err := db.db.Exec("INSERT INTO tags (name, color) VALUES (?, ?);", name, color)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			return 0, fmt.Errorf("Unable to insert tag: %s already exists", name)
		}
		return 0, fmt.Errorf("Unable to insert tag: %s", err.Error())
	}

	var id uint64
	row := db.db.QueryRow("SELECT id FROM tags WHERE name = ?;", name)
	if err := row.Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

func (db *Database) DeleteTag(id uint64) ([]uint64, error) {
	if id == 1 {
		return []uint64{}, fmt.Errorf("Cannot delete 'Archived'")
	}

	projIds, err := db.GetProjectIdsByTagId(id)
	if err != nil {
		return []uint64{}, fmt.Errorf("Unable to get projects associated with tag: %s", err)
	}

	_, err = db.db.Exec("DELETE FROM projectTags WHERE tagId = ?;", id)
	if err != nil {
		return []uint64{},
			fmt.Errorf("Unable to disassociate projects from tag %d: %s", id, err)
	}

	_, err = db.db.Exec("DELETE FROM tags WHERE id=?;", id)
	if err != nil {
		return []uint64{}, fmt.Errorf("Unable to delete tag: %s", err.Error())
	}

	return projIds, nil
}

func (db *Database) EditTag(id uint64, newName, newColor string) error {
	if id == 1 {
		return fmt.Errorf("Cannot edit 'Archived'")
	}

	_, err := db.db.Exec("UPDATE tags SET name=?, color=? WHERE id=?;", newName, newColor, id)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			return fmt.Errorf("Unable to rename tag: %s already exists", newName)
		}
		return fmt.Errorf("Unable to edit tag: %s", err.Error())
	}
	return nil
}

func (db *Database) CreateProject(title, description string, tags []uint64) (uint64, error) {
	query := "INSERT INTO projects (title, description) VALUES (?, ?)"
	_, err := db.db.Exec(query, title, description)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			return 0, fmt.Errorf("Unable to create project: %s already exists", title)
		}
		return 0, fmt.Errorf("Unable to create project: %s", err.Error())
	}

	query = "SELECT id FROM projects WHERE title = ?"
	var id uint64
	err = db.db.QueryRow(query, title).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("Unable to query new project id: %s", err)
	}

	// Associate new tags
	query = "INSERT OR IGNORE INTO projectTags (projectId, tagId) VALUES (?, ?);"
	for _, tagId := range tags {
		_, err := db.db.Exec(query, id, tagId)
		if err != nil {
			return 0, fmt.Errorf("Unable to associate tag with project: (%d %d): %s",
				id, tagId, err)
		}
	}
	return id, nil
}

func (db *Database) DeleteProject(id uint64) ([]uint64, error) {
	tags, err := db.GetTagIdsByProjectId(id)
	if err != nil {
		return []uint64{}, fmt.Errorf("Unable to get tag list: %s", err.Error())
	}

	_, err = db.db.Exec("DELETE FROM projects WHERE id=?;", id)
	if err != nil {
		return []uint64{}, fmt.Errorf("Unable to delete project: %s", err.Error())
	}

	return tags, nil
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

func (db *Database) EditProject(
	id uint64,
	title, description string,
	tags []uint64) ([]uint64, error) {

	// Update the title and description
	query := "UPDATE projects SET title=?, description=? WHERE id=?;"
	_, err := db.db.Exec(query, title, description, id)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			return []uint64{}, fmt.Errorf("Unable to rename project: %s already exists", title)
		}
		return []uint64{}, fmt.Errorf("Unable to rename project: %s", err.Error())
	}

	// Get the difference of the tag lists
	currentTags, err := db.GetTagIdsByProjectId(id)
	if err != nil {
		return []uint64{}, fmt.Errorf("Unable to get tag list: %s", err.Error())
	}

	newTags, removedTags := getListDifference(currentTags, tags)

	// Associate new tags
	query = "INSERT OR IGNORE INTO projectTags (projectId, tagId) VALUES (?, ?);"
	for _, tagId := range newTags {
		_, err := db.db.Exec(query, id, tagId)
		if err != nil {
			return []uint64{}, fmt.Errorf("Unable to associate tag with project: (%d %d): %s",
				id, tagId, err)
		}
	}

	// Remove the association of old tags
	query = "DELETE FROM projectTags WHERE projectId = ? AND tagId = ?;"
	for _, tagId := range removedTags {
		_, err := db.db.Exec(query, id, tagId)
		if err != nil {
			return []uint64{}, fmt.Errorf("Unable to disassociate tag from project: (%d %d): %s",
				id, tagId, err)
		}
	}

	return append(removedTags, newTags...), nil
}

func (db *Database) AddTask(projectId uint64, title, description string, priority uint64) error {
	query := "INSERT INTO tasks (projectId, done, priority, title, description)" +
		"VALUES (?, 0, ?, ?, ?);"
	_, err := db.db.Exec(query, projectId, priority, title, description)
	if err != nil {
		return fmt.Errorf("Unable add new task: %s", err.Error())
	}
	return nil
}

func (db *Database) DeleteTask(id uint64) (uint64, error) {
	query := "SELECT projectId FROM tasks WHERE id = ?"
	var projectId uint64
	if err := db.db.QueryRow(query, id).Scan(&projectId); err != nil {
		return 0, err
	}

	query = "DELETE FROM tasks WHERE id = ?"
	if _, err := db.db.Exec(query, id); err != nil {
		return 0, fmt.Errorf("Unable to delete task: %s", err.Error())
	}
	return projectId, nil
}

func (db *Database) ToggleTask(id uint64) (uint64, error) {
	query := "SELECT projectId FROM tasks WHERE id = ?"
	var projectId uint64
	if err := db.db.QueryRow(query, id).Scan(&projectId); err != nil {
		return 0, fmt.Errorf("Unable to get project id for task %s", err.Error())
	}

	query = "SELECT done FROM tasks WHERE id = ?"
	var status bool
	err := db.db.QueryRow(query, id).Scan(&status)
	if err != nil {
		return 0, fmt.Errorf("Unable get task status: %s", err.Error())
	}

	query = "UPDATE tasks SET done=? WHERE id=?"
	_, err = db.db.Exec(query, !status, id)
	if err != nil {
		return 0, fmt.Errorf("Unable toggle task: %s", err.Error())
	}

	return projectId, nil
}

func (db *Database) EditTask(id uint64, title, description string, priority uint64) (uint64, error) {
	query := "SELECT projectId FROM tasks WHERE id = ?"
	var projectId uint64
	if err := db.db.QueryRow(query, id).Scan(&projectId); err != nil {
		return 0, fmt.Errorf("Unable get projectId for task: %s", err.Error())
	}

	query = "UPDATE tasks SET title=?, description=?, priority=? WHERE id=?"
	_, err := db.db.Exec(query, title, description, priority, id)
	if err != nil {
		return 0, fmt.Errorf("Unable set task description: %s", err.Error())
	}

	return projectId, nil
}

func (db *Database) AddSession(projectId, duration, date uint64) error {
	query := "INSERT INTO sessions (projectId, timestamp, duration) VALUES (?, ?, ?)"
	_, err := db.db.Exec(query, projectId, date, duration)
	if err != nil {
		return fmt.Errorf("Unable to create project: %s", err.Error())
	}
	return nil
}

func (db *Database) DeleteSession(id uint64) (uint64, error) {
	query := "SELECT projectId FROM sessions WHERE id = ?"
	var projectId uint64
	if err := db.db.QueryRow(query, id).Scan(&projectId); err != nil {
		return 0, fmt.Errorf("Unable to get project id for session %s", err.Error())
	}

	query = "DELETE FROM sessions WHERE id = ?"
	if _, err := db.db.Exec(query, id); err != nil {
		return 0, fmt.Errorf("Unable to delete session: %s", err.Error())
	}
	return projectId, nil
}

func NewDatabase(dbDir string) (*Database, error) {
	db := new(Database)
	err := os.MkdirAll(dbDir, os.ModePerm)
	if err != nil {
		return nil, err
	}

	err = db.initialize(dbDir)
	if err != nil {
		return nil, err
	}

	return db, nil
}
