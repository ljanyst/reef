//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 11.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

// +build dev

package reef

import "net/http"

var Assets http.FileSystem = http.Dir("../../ui/build")
