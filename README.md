# two-way-socket-pipe

Given two `net.Socket`, pipe their data stream in both direction. 

This is useful when trying to build things like TCP proxies. 
It also automatically closes the opposite socket, when either end closes.

# npm install

```.bash
npm install --save @js-util/two-way-socket-pipe
```

# Example usage

> PS: This is incomplete code, you will need to modify for your actual use case.

```.js
// Load the module
const twoWaySocketPipe = require("@js-util/two-way-socket-pipe);

// Create the server with the socket listening event
const server = net.createServer(function (localsocket) {

	// Somehow get a remote socket connection
	let remotesocket = yourFunctionToGetRemoteSocketHere();
	
	// Lets connect the two sockets together
	// use true for the thrid parameter to enable verbose mode.
	// (aka easier to debug with console.log)
	twoWaySocketPipe(localsocket, remotesocket, true);

	// ...
});
```
