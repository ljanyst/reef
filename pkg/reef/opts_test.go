//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 03.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

package reef

import (
	"bytes"
	"flag"
	"fmt"
	"github.com/google/go-cmp/cmp"
	"io/ioutil"
	"os"
	"path/filepath"
	"testing"
)

var update = flag.Bool("update", false, "update .golden files")

func TestDefaultOpts(t *testing.T) {
	opts := NewReefOpts()
	if len(opts.Web.BindAddresses) != 1 {
		t.Error("Default config should contain exactly one bind address")
	}
	addr := opts.Web.BindAddresses[0]
	if addr.Host != "localhost" {
		t.Error("Default config should bind to localhost")
	}
	if addr.Port != 7651 {
		t.Error("Default config should bind to port 7651")
	}

	if !cmp.Equal(opts.Web.Https, HttpsOpts{}) {
		t.Error("Default config should not configure https")
	}

	if opts.Backend.DatabaseDirectory != "data" {
		t.Error("Default config should store database in the \"data\" directory")
	}

}

func TestOpts(t *testing.T) {
	cases := []string{
		"config-full",
		"config-no-addresses",
		"config-no-backend",
		"config-empty",
	}

	for _, tc := range cases {
		opts := NewReefOpts()
		jsonFile := filepath.Join("testdata", tc+".json")
		err := opts.LoadYaml(jsonFile)
		if err != nil {
			t.Errorf("Unable to load json configuration: %s", err)
		}

		optsBytes := []byte(fmt.Sprintf("%+v\n", opts))
		goldenFile := filepath.Join("testdata", tc+".golden")
		if *update {
			ioutil.WriteFile(goldenFile, optsBytes, 0644)
		}

		expected, _ := ioutil.ReadFile(goldenFile)
		if !bytes.Equal(optsBytes, expected) {
			t.Errorf("Actual and golden config don't match\n%v\n%v", string(optsBytes),
				string(expected))
		}
	}
}

func TestMain(m *testing.M) {
	flag.Parse()
	retCode := m.Run()
	os.Exit(retCode)
}
