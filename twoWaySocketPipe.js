/**
 * Given two `net.Socket`, pipe their data stream in both direction.
 * This is useful when trying to build things like TCP proxies.
 * 
 * Automatically closes the opposite socket, when either end closes.
 * 
 * @param {net.Socket} localsocket 
 * @param {net.Socket} remotesocket 
 * @param {Boolean} verbose 
 */
function twoWaySocketPipe(localsocket, remotesocket, verbose = false) {
	//
	// Sanity check
	//
	if( localsocket == null || remotesocket == null ) {
		throw "missing valid socket connection"
	}

	//
	// Get the respective socket logging names
	// and setup the verbose logging function
	//
	let localsocketAddr = localsocket.remoteAddress+":"+localsocket.remotePort;
	let remotesocketAddr = remotesocket.remoteAddress+":"+remotesocket.remotePort;

	function _localToRemoteLog(msg) {
		if( verbose ) {
			console.log(`${localsocketAddr} -> ${remotesocketAddr} : ${msg}`);
		}
	}
	function _remoteToLocalLog(msg) {
		if( verbose ) {
			console.log(`${localsocketAddr} <- ${remotesocketAddr} : ${msg}`);
		}
	}

	//
	// Stream the data between the 2 sockets
	// 
	// pause the respective socket when the buffer is 
	//

	localsocket.on('data', function (data) {
		_localToRemoteLog("Writing data");
		
		// socket.write, returns false when the buffer is above 
		// the soft limit, aka "full" - note there is no hard limit
		if (!remotesocket.write(data)) {
			// therefor, we pause the connection, to throttle it down
			_localToRemoteLog("socket is not flushed; pausing connection");
			localsocket.pause();
		}
	});
	
	remotesocket.on('data', function(data) {
		_remoteToLocalLog("Writing data");
		
		// socket.write, returns false when the buffer is above 
		// the soft limit, aka "full" - note there is no hard limit
		if (!localsocket.write(data)) {
			// therefor, we pause the connection, to throttle it down
			_remoteToLocalLog("socket is not flushed; pausing connection");
			remotesocket.pause();
		}
	});
	
	//
	// Unpause a previously paused socket stream
	// whenever the buffer is cleared
	//

	localsocket.on('drain', function() {
		_remoteToLocalLog("buffer drained; resuming connection");
		remotesocket.resume();
	});
	remotesocket.on('drain', function() {
		_localToRemoteLog("buffer drained; resuming connection");
		localsocket.resume();
	});
	
	//
	// Socket closing
	//
	localsocket.on('close', function() {
		_localToRemoteLog("Closing the socket");
		remotesocket.end();
	});
	remotesocket.on('close', function() {
		_remoteToLocalLog("Closing the socket");
		localsocket.end();
	});

	//
	// Socket error, and closing handling
	//
	localsocket.on('error', function(err) {
		_localToRemoteLog(`Closing due to error - ${err}`);
		remotesocket.end();
	});
	remotesocket.on('error', function(err) {
		_remoteToLocalLog(`Closing due to error - ${err}`);
		localsocket.end();
	});
}
module.exports = twoWaySocketPipe;