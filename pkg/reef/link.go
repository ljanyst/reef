//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 27.05.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

package reef

type Link struct {
	RequestChan  chan Request
	ResponseChan chan Response
	CloseChan    chan bool
}

func (link *Link) Close() {
	// At any time we may have two goroutines that may wait for the channel
	// closure
	link.CloseChan <- true
	link.CloseChan <- true
}

func NewLink() *Link {
	link := new(Link)
	link.RequestChan = make(chan Request, 25)
	link.ResponseChan = make(chan Response, 25)
	link.CloseChan = make(chan bool, 2)
	return link
}
