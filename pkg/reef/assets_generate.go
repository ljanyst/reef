//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 11.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

// +build ignore

package main

import (
	"github.com/ljanyst/reef/pkg/reef"

	"encoding/json"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/shurcooL/vfsgen"
	log "github.com/sirupsen/logrus"
	prefixed "github.com/x-cray/logrus-prefixed-formatter"
)

type projectOpts struct {
	Name string
}

func isProgramAvailable(name string) bool {
	cmd := exec.Command(name, "-v")
	if err := cmd.Run(); err != nil {
		return false
	}
	return true
}

func main() {
	log.SetFormatter(&prefixed.TextFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
		FullTimestamp:   true,
		ForceFormatting: true,
	})

	uiDir := "../../ui/"
	log.Infof("Working in: %s", uiDir)

	// Check the validity of the project
	jsonFile := filepath.Join(uiDir, "package.json")
	log.Infof("Reading project description from: %s", jsonFile)
	data, err := ioutil.ReadFile(jsonFile)
	if err != nil {
		log.Fatalf("Unable to read the configuration file: %v", err)
	}

	var opts projectOpts
	err = json.Unmarshal(data, &opts)
	if err != nil {
		log.Fatalf("Malformed config: %v", err)
	}

	if opts.Name == "" {
		log.Fatalf("The project has no name!")
	}

	log.Infof("The name of the project is: %s", opts.Name)

	// Check if we have npm available
	if !isProgramAvailable("npm") {
		log.Fatal("npm does not seem to be installed!")
	}

	// Clean up after previous builds
	log.Info("Removing data of the previous build...")
	if err = os.Remove(filepath.Join(uiDir, "package-lock.json")); os.IsExist(err) {
		log.Fatalf("Cannot remove package-lock.json: %s", err)
	}

	for _, dir := range []string{"build", "node_modules"} {
		if err = os.RemoveAll(filepath.Join(uiDir, dir)); os.IsExist(err) {
			log.Fatalf("Cannot remove %s: %s", dir, err)
		}
	}

	// Install node packages
	log.Info("Installing the JavaScript dependencies...")
	cmd := exec.Command("npm", "install")
	cmd.Dir = uiDir
	if err = cmd.Run(); err != nil {
		output, _ := cmd.CombinedOutput()
		log.Fatalf("Cannot install the JavaScript dependencies:\n%s", string(output))
	}

	// Build the UI assets
	log.Info("Building the UI assets...")
	cmd = exec.Command("npm", "run-script", "build")
	cmd.Dir = uiDir
	if err = cmd.Run(); err != nil {
		output, _ := cmd.CombinedOutput()
		log.Fatalf("Cannot build UI assets:\n%s", string(output))
	}

	// Generate the asset file
	log.Info("Generating the asset file...")
	err = vfsgen.Generate(reef.Assets, vfsgen.Options{
		PackageName:  "reef",
		BuildTags:    "!dev",
		VariableName: "Assets",
		Filename:     "assets_prod.go",
	})

	if err != nil {
		log.Fatalln(err)
	}

	log.Info("All done.")
}
