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

func (db *Database) initializeNew() error {
	initializationQueries := []struct {
		Query    string
		ErrorMsg string
	}{
		{
			"INSERT INTO metadata (key, value) VALUES (\"version\", \"1\");",
			"Unable to set the database version",
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

	return db, nil
}
