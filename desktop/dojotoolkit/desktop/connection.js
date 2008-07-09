dojo.provide("desktop.connection");

desktop.connection = {
	//	summary:
	//		The desktop's connection manager manages server connections made by the APIs, and apps. It makes sure that
	//		an XHR using long-polling does not cause a short XHR to wait for that long-poll to finish. In other words,
	//		if a short XHR is made while a long-poll is open, the long-poll is closed, allowing the short XHR to be handled.
	_connections: [],
	init: function() {
		//TODO: create dojo.rpc.JsonService classes for each backend
	},
	notify: function(/*dojo.Deferred*/connection, /*String*/type) {
		//	summary:
		//		notify the connection manager that a connection has been made
		//	connection:
		//		the connection that has been made
		//	type:
		//		the type of connection. Possible values are "long" and "short". "short" /allways/ gets a higher priority over "long".
		//		short -	used for server pings. Use this when directly interacting with the user. In most cases, you would use this.
		//		long -	used for connections that stay open until new data is on the server (also known as long-polling).
		//				If "long" is used while interacting with the user (for example, a chat program), you should add an errback
		//				just in case the connection has to be closed for a "short" request.
		//	example:
		//		making a short server ping
		//		|	var df = dojo.xhrPost({
		//		|		url: "/foo/bar.php",
		//		|		load: function(data) { console.log(data) }
		//		|	});
		//		|	desktop.connection.notify(df, "short");
		//		a request using long-polling
		//		|	function longPoll() {
		//		|		var df = dojo.xhrPost({
		//		|			url: "/foo/longpoll.php",
		//		|			load: function(data) {
		//		|				console.info("New data from server: "+data);
		//		|				longPoll();
		//		|			},
		//		|			error: function() {
		//		|				console.error("Connection was closed for a short request. Reconnecting...");
		//		|				longPoll();
		//		|			}
		//		|		});
		//		|		desktop.connection.notify(df, "long");
		//		|	}
		//		|	longPoll();
		if(type == "short") {
			//check for any long polls, and cancel them
			dojo.forEach(this._connections, function(pointer) {
				if(pointer.type == "long" && pointer.connection.fired < 0)
					pointer.connection.cancel();
			});
		}
		//add the connection to the queue
		this.connections.push({type: type, connection: connection});
		//cleanup any finished connections from the queue if we're not debugging
		if(!dojo.config.isDebug) this.cleanup();
	},
	cleanup: function() {
		//	summary:
		//		clean up all the connections that have finished from the queue
		var connections = []
		dojo.forEach(this._connections, function(pointer) {
			if(pointer.connection.fired > 0) {
				connections.push(pointer);
			}
		})
		this._connections = connections;
	}
}
