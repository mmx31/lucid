dojo.provide("api.crosstalk");
/* 
 * Class: api.crosstalk
 * 
 * An API that allows an app to communicate with other applications on a system-wide level. 
 */
api.crosstalk = {
	//	session: Array
	//		handler storage
	session: [],
	//	assignid: Integer
	//		ids for storage
	assignid: 0,
	/*=====
	__subscribeArgs: function() {
		//	instance: Integer
		//		your app's instance ID (this.instance)
		//	callback: Function
		//		a callback function to be called when this instance gets a crosstalk message
		this.instance = instance;
		this.callback = callback;
	},
	=====*/
	subscribe: function(/*api.crosstalk.__subscribeArgs*/params)
	{
		//	summary:
		//		register an event handler
		//	returns:
		//		returns a handle that you can use to unregister the handler (see unregisterHandler)
		
		var p = api.crosstalk.session[api.crosstalk.assignid] = new Object();
		p.suspended = false;
		p.appid = desktop.app.instances[params.instance].id;
        p.callback = params.callback;
        p.instance = params.instance;
		id = api.crosstalk.assignid;
		api.crosstalk.assignid++;
		return id;
	},
	unsubscribe: function(/*Handle*/handle)
	{
		//	summary:
		//		unregister an event handler
		//	handle:
		//		a handle that was returned from registerHandler
		api.crosstalk.session[handle].suspended = true;
	},
	_internalCheck: function()
	{
		//	summary:
		//		the crosstalk api checker, called every somewhat or so seconds, internally. then will handle it from the registered crap...
		if (api.crosstalk.session.length == 0) { // no data in array (no handlers registered)
		//api.log("Crosstalk API: No events to process...");
			}
		else { // handlers found. ask to obtain any events.
		//api.log("Crosstalk API: Checking for events...");
        	api.xhr({
	        	backend: "api.crosstalk.io.checkForEvents",
				handleAs: "json",
	        	load: dojo.hitch(this, this._internalCheck2),
	        	error: function(type, error) { api.log("Error in Crosstalk call: "+error.message); }
        	});
		}
	},
		
	/*=====
	__publishArgs: function() {
		//	userid: int
		//		the user to send the info to
		//	appid: int
		//		the app id to send it to
		//	instance: int?
		//		the specific instance to send it to. Defaults to all instances.
		//	message: string
		//		the message to send. Use in conjunction with dojo.toJson and dojo.fromJson for objects and arrays
		this.userid=userid;
		this.appid=appid;
		this.instance=instance;
		this.message=message;
	},
	=====*/
		
	publish: function(/*api.crosstalk.__publishArgs*/params)
	{
		//	summary:
		//		publish an event to be sent via crosstalk
    	api.xhr({
	    	backend: "api.crosstalk.io.sendEvent",
			content: {
				destination: params.userid,
				message: params.message,
				appid: params.appid,
				instance: params.instance
			},
			handleAs: "xml",
	    	error: function(type, error) {
				alert("Error in Crosstalk call: "+error.message);
				this.setup_timer();
			},
	    	mimetype: "text/xml"
    	});
	},
	
	/*=====
	_handlerArgs: function() {
		//	message: String
		//		the message of the sent event
		//	appid: int
		//		the appid that the publish event was given
		//	instance: int
		//		the instance the publish event was given
		//	sender: int
		//		the userid of the person who sent the message
	},
	=====*/
	
	_internalCheck2: function(data, ioArgs)
	{	
		//summary:
		//		the crosstalk api checker, stage2, compare the results with the handled handlers
		
		if(data == "") { this.setup_timer(); return; }
		// No events here. (Screwed up code)
		var handled = false;
		dojo.forEach(results, function(result) {
			api.log("processing result...");
			for(var x = 0; x<api.crosstalk.session.length; x++)
			{
				if(api.crosstalk.session[x].suspended != true
				&& result.appid == api.crosstalk.session[x].appid
				&& (result.instance == api.crosstalk.session[x].instance || result.instance == 0))
				{
					api.log("Found handler, appid: "+result.appid);
					var id = result.id; //id of the event in database.
					api.crosstalk.session[x].callback({
						message: results[i].firstChild.nodeValue,
						appid: result.appid,
						instance: result.instance,
						sender: result.sender
					});
					//remove the event, now. it has been handled.
			        api.xhr({
			        	backend: "api.crosstalk.io.removeEvent",
						content: {
							id: id
						},
			        	error: function(type, error) { alert("Error in CrosstalkRemoval call: "+error.message); }
			        });
					handled = true;
				}
			}
			if(handled != true) {
				//Found unhandled code. Do NOT remove, it may be useful later on.
				//api.log("Crosstalk API: Unhandled event, appid: "+result.appid")+" instance: "+result.instance+" message: "+results[i].firstChild.nodeValue);
			}
		});
		this.setup_timer();
	},
	handleSystemMessage: function(/*Object*/Object) {
		//	summary:
		//		handle system messages (internal, do not use)
		api.ui.alertDialog({title: "Psych Desktop", message: "<center> <b> System Message (senderID: "+object.sender+") </b> <br> "+object.message+" </center>"});
	},
	/*=====
	__sendSystemMessageArgs: function() {
		//	userid: int
		//		who to send the message to. 0 for all users on the system
		//	message: string
		//		the message to be sent
	},
	=====*/
	sendSystemMessage: function(/*api.crosstalk.__sendSystemMessageArgs*/obj) {
		//	summary:
		//		send system messages
		//		The current user must be an admin to use this.
		api.crosstalk.sendEvent({ userid: obj.userid, appid: 0, instance: 0, message: obj.message });
	},
	init: function()
	{
		var p = api.crosstalk.session[api.crosstalk.assignid] = new Object();
		p.suspended = false;
		p.appid = 0;
        p.callback = api.crosstalk.handleSystemMessage;
        p.instance = 0;
		id = api.crosstalk.assignid;
		api.crosstalk.assignid++;
		// start checking for events
		this.setup_timer();
	},
	setup_timer: function()
	{
		//	summary:
		//		Starts checking the server for messages
		this.timer = setTimeout(dojo.hitch(this, this._internalCheck), desktop.config.crosstalkPing);
	},
	stop: function()
	{
		//	summary:
		//		Stops crosstalk from checking the server for messages
		clearTimeout(this.timer);
	}
}
