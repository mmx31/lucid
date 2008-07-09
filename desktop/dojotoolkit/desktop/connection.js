dojo.provide("desktop.connection");
dojo.require("dojo.rpc.JsonService");

desktop.connection = {
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
