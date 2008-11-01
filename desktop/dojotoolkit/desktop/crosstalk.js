dojo.provide("desktop.crosstalk");
desktop.crosstalk = {
	//	summary:
	//		An API that allows an app to communicate with other applications on a system-wide level. 
	//	session: Array
	//		handler storage
	session: [],
	subscribe: function(/*String*/topic, /*Function*/handler, /*Int?*/instance)
	{
		//	summary:
		//		register an event handler
		//	instance:
		//		the current app ID. Pass this.id when using in an app.
		//		to capture system events, omit this
		//	topic:
		//		the topic to subscribe to
		//	handler:
		//		a handler function that is called when something for this event is published
		//	returns:
		//		returns a handle that you can use to unregister the handler (see unregisterHandler)
		var session = desktop.crosstalk.session;
		var p = session[session.length] = {
			appsysname: (instance ? desktop.app.instances[instance].sysname : -1),
			callback: handler,
			instance: instance || -1,
			topic: topic
		};
		return session.length-1;
	},
	unsubscribe: function(/*Handle*/handle)
	{
		//	summary:
		//		unregister an event handler
		//	handle:
		//		a handle that was returned from subscribe()
		delete desktop.crosstalk.session[handle];
	},
	_internalCheck: function()
	{
		//	summary:
		//		the crosstalk api checker, called every somewhat or so seconds, internally. then will handle it from the registered crap...
		
		//I'm commenting this out because the new system may have to launch the app when an event is recieved
		
		//var eventsToHandle = false;
		//dojo.forEach(this.session, function(i) {
		//	if(i != null) eventsToHandle=true;
		//})
		//if (!eventsToHandle) { // no data in array (no handlers registered)
		//	//desktop.log("Crosstalk API: No events to process...");
		//	this.setup_timer();
		//}
		//else { // handlers found. ask to obtain any events.
			//desktop.log("Crosstalk API: Checking for events...");
        	desktop.xhr({
	        	backend: "api.crosstalk.io.checkForEvents",
				handleAs: "json",
	        	load: dojo.hitch(this, "_internalCheck2"),
	        	error: function(type, error) { desktop.log("Error in Crosstalk call: "+error.message); }
        	});
		//}
	},
		
	publish: function(/*String*/topic, /*Array*/args, /*Int?*/userid, /*String?*/appsysname, /*Int?*/instance)
	{
		//	summary:
		//		publish an event to be sent
		//	topic:
		//		the topic name to publish
		//	args:
		//		the arguments to pass to the handler
		//	userid:
		//		the specific user to send the event to.
		//		Omit to send to all users (the current user must be an admin to do this)
		//	appid:
		//		the appid to send it to. Omit to send as a system event
		//	instance:
		//		the specific app instance to send it to.
		//		omit to send it to all instances
    	desktop.xhr({
	    	backend: "api.crosstalk.io.sendEvent",
			content: {
				topic: topic,
				userid: userid || -1,
				args: dojo.toJson(args),
				appsysname: appsysname || -1,
				instance: instance || -1
			},
	    	error: function(type, error) {
				desktop.log("Error in Crosstalk call: "+error.message);
				this.setup_timer();
			}
    	});
	},
	
	_internalCheck2: function(data, ioArgs)
	{	
		//summary:
		//		the crosstalk api checker, stage2, compare the results with the handled handlers
		
		if(data == "") { this.setup_timer(); return; }
		// No events here.
		try {
			var checkForHandler = dojo.hitch(this, function(event) {
				//cycle through the handlers stored and find a handler for the event
				dojo.forEach(this.session, function(handler) {
					//A subscribed handler is required
					if(typeof handler == "undefined") return false;
					//matching the appid and topic are required
					if(handler.appsysname == event.appsysname
					&& handler.topic == event.topic) {
						//matching the instance isn't
						//but if it's provided and this handler is not of he correct instance, return
						if(event.instance != -1
						&& event.instance != handler.instance) return false;
						//check to see if the topic matches
						if(event.topic != handler.topic) return false;
						//ok, we found a match
						var args = dojo.fromJson(event.args);
						args._crosstalk = {topic: event.topic, instance: event.instance, appsysname: event.appsysname, sender: event.sender};
						handler.callback(args);
						handled = true;
						return true;
					}
				}, this);
			})
		
			dojo.forEach(data, function(event) {
				var handled = false;
				checkForHandler(event);
				if(handled == false && event.instance == -1) {
					if(event.appsysname == -1) return; //system call - TODO: Handle?
					//check to see if there's allready an instance of this app running
					var instances = desktop.app.getInstances();
					for(var i=0;i<instances.length;i++) {
						//if there is allready an instance running, it must not handle any crosstalk events. Skip the event.
						if(instances[i].sysname == event.appsysname) return;
					}
					//otherwise, launch the app
					desktop.app.launch(event.appsysname, {crosstalk: true}, function(app) {
						//check for a handler again
						var handled = checkForHandler(event);
						//if there's still no handler, kill the app
						if(handled == false) app.kill();
					})
				}
			}, this);
		}
		catch(err) {
			console.log(err);
		}
		this.setup_timer();
	},
	init: function()
	{
		// start checking for events
		this.setup_timer();
	},
	setup_timer: function()
	{
		//	summary:
		//		Starts checking the server for messages
		this.timer = setTimeout(dojo.hitch(this, "_internalCheck"), desktop.config.crosstalkPing);
	},
	stop: function()
	{
		//	summary:
		//		Stops crosstalk from checking the server for messages
		clearTimeout(this.timer);
	}
}
