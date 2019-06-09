//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 03.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

package reef

import (
	"fmt"
	"io/ioutil"

	"github.com/ghodss/yaml"
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
	EnableAuth    bool          // Enable basic HTTP auth
	HtpasswdFile  string        // path to the htpasswd file
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
	opts.Web.EnableAuth = false
	opts.Backend.DatabaseDirectory = "data"
	return
}

// Load the configuration data from a Yaml file
func (opts *ReefOpts) LoadYaml(fileName string) error {
	data, err := ioutil.ReadFile(fileName)
	if err != nil {
		return fmt.Errorf("Unable to read the configuration file %s: %s", fileName, err)
	}

	err = yaml.Unmarshal(data, opts)
	if err != nil {
		return fmt.Errorf("Malformed config %s: %s", fileName, err)
	}

	return nil
}
