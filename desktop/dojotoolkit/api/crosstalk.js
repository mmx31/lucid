dojo.provide("api.crosstalk");
/* 
 * Class: api.crosstalk
 * 
 * An API that allows an app to communicate with other applications on a system-wide level. 
 */
api.crosstalk = new function()
{
	/*
	 * Property: session
	 * 
	 * handler storage
	 */
	this.session = new Array();
	/*
	 * Property: assignid
	 * 
	 * ids for storage
	 */
	this.assignid = 0;
	/*
	 * Method: subscribe
	 * 
	 * register an event handler
	 * 
	 * Arguments:
	 * 		params - an object containing extra parameters
	 * 		> {
	 * 		> 	instance: integer, //your app's instance ID (this.instance)
	 * 		> 	callback: function //a callback function to be called when this instance gets a crosstalk message
	 * 		> }
	 * 
	 * Returns:
	 * 		a handle that you can use to unregister the handler (see <unregisterHandler>)
	 */
	this.subscribe = function(/*Object*/params)
    		{
			/*
			*OMG this code is super-fucked.
			* infact, it's more of a mess than code
			*but hey, it works.
			*/
		var p = api.crosstalk.session[api.crosstalk.assignid] = new Object();
		p.suspended = false;
		p.appid = desktop.app.instances[params.instance].id;
        p.callback = params.callback;
        p.instance = params.instance;
		id = api.crosstalk.assignid;
		api.crosstalk.assignid++;
		return id;
		}
	/*
	 * Method: unsubscribe
	 * 
	 * unregister an event handler
	 * 
	 * Arguments:
	 * 		id - a handle that was returned from <registerHandler>
	 */
	this.unsubscribe = function(/*Integer*/id)
	{
		api.crosstalk.session[id].suspended = true;
	}
	/* 
	 * Method: _internalCheck
	 * 
	 * the crosstalk api checker, called every somewhat or so seconds, internally. then will handle it from the registered crap...
	 */
	this._internalCheck = function()
		{
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
		}
		
	/* 
	 * Method: publish
	 * 
	 * publish an event to be sent via crosstalk
	 * 
	 * Arguments:
	 * 		params - an object containing additional parameters:
	 * 		> {
	 * 		> 	userid: integer, //the user to send the info to
	 * 		> 	appid: integer, //the app id to send it to.
	 * 		> 	instance: integer, //the specific instance to send it to. Optional.
	 * 		> 	message: string //the message to send. Use in conjunction with dojo.toJson and dojo.fromJson for objects and arrays
	 * 		> }
	 */
	this.publish = function(/*Object*/params)
		{
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
		}


	/* 
	 * Method: _internalCheck2
	 * 
	 * the crosstalk api checker, stage2, compare the results with the handled handlers ;)
	 * 
	 * See:
	 * 		<_internalCheck>
	 */
	this._internalCheck2 = function(data, ioArgs)
	{	// JayM: I tried to optimize the thing as much as possible, add more optimization if needed. 
		if(data == "") { this.setup_timer(); return; }
		// No events here. (Screwed up code)
		var handled = false;
		dojo.forEach(results, function(result) {
			api.log("processing result...");
			for(var x = 0; x<api.crosstalk.session.length; x++)
			{
				if(api.crosstalk.session[x].suspended != true)
				{
					if(result.appid == api.crosstalk.session[x].appid)
					{
						if(result.instance == api.crosstalk.session[x].instance || result.instance == 0)
						{
							api.log("Found handler, appid: "+result.appid);
							var id = result.id; //id of the event in database.
							api.crosstalk.session[x].callback({ message: results[i].firstChild.nodeValue, appid: result.appid, instance: result.instance, sender: result.sender});
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
				}
			}
			if(handled != true) {
				//Found unhandled code. Do NOT remove, it may be useful later on.
				//api.log("Crosstalk API: Unhandled event, appid: "+result.appid")+" instance: "+result.instance+" message: "+results[i].firstChild.nodeValue);
			}
		});
		this.setup_timer();
	}
	/*
	 * Method: handleSystemMessage
	 *  
	 * handle system messages (internal, do not use)
	 * 
	 * Arguments:
	 * 		object - an object containing additional parameters
	 * 		> {
	 * 		> 	sender: string, //who sent the message
	 * 		> 	message: string //what to send
	 * 		> }
	 */
	this.handleSystemMessage = function(/*Object*/object) {
		api.ui.alertDialog({title: "Psych Desktop", message: "<center> <b> System Message (senderID: "+object.sender+") </b> <br> "+object.message+" </center>"});
	}
	/*
	 * Method: sendSystemMessage
	 * 
	 * send system messages
	 * The current user must be an admin to use this.
	 * 
	 * Arguments:
	 * 		ooo - an object containing additional parameters:
	 * 		> {
	 * 		> 	userid: integer, //who to send the message to. 0 for everybody
	 * 		> 	message: string //the message to be sent
	 * 		> }
	 */
	this.sendSystemMessage = function(/*Object*/ooo) {
		api.crosstalk.sendEvent({ userid: ooo.userid, appid: 0, instance: 0, message: ooo.message });
	}
	this.init = function()
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
	}
	/*
	 * Method: setup_timer
	 * 
	 * Starts checking the server for messages
	 */
	this.setup_timer = function()
	{
		this.timer = setTimeout(dojo.hitch(this, this._internalCheck), desktop.config.crosstalkPing);
	}
	/*
	 * Method: stop
	 * 
	 * Stops crosstalk from checking the server for messages
	 */
	this.stop = function()
	{
		// stop checking for events
		clearTimeout(this.timer);
	}
}
