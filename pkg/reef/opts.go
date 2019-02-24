//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 03.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

package reef

import (
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"reflect"
)

type BindAddress struct {
	Host    string // Either host name or an IP address (IPv4 or IPv6)
	Port    int
	IsHttps bool
}

type HttpsOpts struct {
	Cert string // Certificate file (mandatory)
	Key  string // Key file (mandatory)
}

type WebOpts struct {
	BindAddresses []BindAddress // List of addresses the server should bind to
	Https         HttpsOpts     // Https configuration
}

type BackendOpts struct {
	DatabaseDirectory string // Directory for the database files
}

type ReefOpts struct {
	Web     WebOpts     // Web server configuration
	Backend BackendOpts // Backend data store configuration
}

// Create a ReefOpts object with default settings filled in
func NewReefOpts() (opts *ReefOpts) {
	opts = new(ReefOpts)
	opts.Web.BindAddresses = []BindAddress{BindAddress{"localhost", 7651, false}}
	opts.Backend.DatabaseDirectory = "data"
	return
}

func fillDefaults(target interface{}, source interface{}) {
	sKind := reflect.TypeOf(source).Kind()
	tKind := reflect.TypeOf(target).Kind()
	if sKind != reflect.Ptr {
		log.Errorf("Default opt source needs to be a pointer but got: %s", sKind)
	}
	if tKind != reflect.Ptr {
		log.Errorf("Opt target needs to be a pointer but got: %s", tKind)
	}

	sValue := reflect.ValueOf(source)
	tValue := reflect.ValueOf(target)
	sValue = reflect.Indirect(sValue)
	tValue = reflect.Indirect(tValue)

	if sValue.Type() != tValue.Type() {
		log.Errorf("Source and target type mismatch: %v vs %v", sValue.Type(),
			tValue.Type())
		return
	}

	if sValue.Kind() == reflect.Struct {
		for i := 0; i < sValue.NumField(); i++ {
			sFieldValue := sValue.Field(i).Interface()
			tFieldValue := tValue.Field(i).Interface()
			fillDefaults(&tFieldValue, &sFieldValue)
		}
		return
	}

	if tValue.Interface() == reflect.Zero(reflect.TypeOf(target)).Interface() {
		tValue.Set(sValue)
	}
}

func (opts *ReefOpts) fillDefaults() {
	def := new(ReefOpts)
	fillDefaults(opts, def)
}

// Load the configuration data from a JSON file
func (opts *ReefOpts) LoadJson(fileName string) (err error) {
	data, err := ioutil.ReadFile(fileName)
	if err != nil {
		log.Errorf("Unable to read the configuration file: %v", err)
		return
	}

	err = json.Unmarshal(data, &opts)
	if err != nil {
		log.Errorf("Malformed config: %v", err)
		return
	}

	opts.fillDefaults()
	return
}
