/* 
 * Class: api.ide
 * 
 * Functions that you can use to write an IDE
 */
api.ide = new function()
{
	/*
	 * Method: execute
	 * 
	 * Executes code as if it were a real app
	 * 
	 * Arguments:
	 * 		code - the code to execute
	 * 
	 * Example:
	 * 		> api.ide.execute("this.init = function() { alert('hi'); }");
	 */
	this.execute = function(/*String*/code)
	{
		desktop.app._fetchApp(dojo.toJson({
			id: -666,
			code: code
		}));
		desktop.app.launch(-666);
	}
	/*
	 * Method: save
	 * 
	 * saves an app
	 * 
	 * Arguments:
	 * 		app - an object containing the app's information
	 * 
	 * Example:
	 * 		> api.ide.save({
	 * 		> 	id: 1, //if excluded it creates a new app
	 * 		> 	name: "my supercool app",
	 * 		> 	author: "foo barson",
	 * 		> 	email: "foo@barson.org",
	 * 		> 	version: "1.0",
	 * 		> 	maturity: "Alpha", //can be "Alpha", "Beta", or "Stable"
	 * 		> 	category: "Accessories", //can be "Accessories", "Development", "Games", "Graphics", "Internet", "Multimedia", "Office", "Other", or "System
	 * 		> 	code: "this.init = function(args) { alert('hi'); }",
	 * 		> 	callback: function(id) { //this is optional
	 * 		> 		alert("app "+id+" saved!");
	 * 		> 		//the id argument is the id of the app you just saved
	 * 		> 	}
	 * 		> });
	 */
	this.save = function(/*Object*/app)
	{
		if(typeof app.id != "undefined" &&
	        typeof app.name != "undefined" &&
	        typeof app.author != "undefined" &&
	        typeof app.email != "undefined" &&
	        typeof app.version != "undefined" &&
	        typeof app.maturity != "undefined" &&
	        typeof app.category != "undefined" &&
	        typeof app.code != "undefined")
		{
			  api.log("IDE API: Saving application...");
	          api.xhr({
	               backend: "api.ide.io.save",
	               content : {
	                    id: app.id,
	                    name: app.name,
	                    author: app.author,
	                    email: app.email,
	                    version: app.version,
	                    maturity: app.maturity,
	                    category: app.category,
	                    code: app.code
	               },
	               load: function(data, ioArgs){
						app.callback(data.id);
						api.log("IDE API: Save Sucessful");
						delete desktop.app.apps[parseInt(data.id)];
				   },
				   handleAs: "json"
	          });
	     }
		 else
		 {
			api.log("IDE API: Error! Could not save. Not all strings in the object are defined.");
		 	return false;
		 }
	}
	/*
	 * Method: load
	 * 
	 * Loads an app
	 * 
	 * Arguments:
	 * 		appID - the id of the app to load
	 * 		callback - a callback function.
	 * 
	 * This is the object that the callback function is passed in it's first argument
	 * 		> {
	 * 		> 	id: 1,
	 * 		> 	name: "my supercool app",
	 * 		> 	author: "foo barson",
	 * 		> 	email: "foo@barson.org",
	 * 		> 	version: "1.0",
	 * 		> 	maturity: "Alpha", //can be "Alpha", "Beta", or "Stable"
	 * 		> 	category: "Accessories", //can be "Accessories", "Development", "Games", "Graphics", "Internet", "Multimedia", "Office", "Other", or "System
	 * 		> 	code: "this.init = function(args) { alert('hi'); }",
	 * 		> }
	 */
	this.load = function(/*Integer*/appID, /*Function*/callback)
	{
		api.xhr({
			backend: "core.app.fetch.full",
			content: {
				id: appID
			},
			load: function(data, ioArgs)
			{
				if(callback) callback(data);
			},
			handleAs: "json"
		});
	}
	/*
	 * Method: getAppList
	 * 
	 * Gets the app list
	 * 
	 * Arguments:
	 * 		callback - a callback function. Gets passed an array of app info without the app's code.
	 *
	 * This is an example object that you would find in the array
	 * 		> {
	 * 		> 	id: 1,
	 * 		> 	name: "my supercool app",
	 * 		> 	author: "foo barson",
	 * 		> 	email: "foo@barson.org",
	 * 		> 	version: "1.0",
	 * 		> 	maturity: "Alpha", //can be "Alpha", "Beta", or "Stable"
	 * 		> 	category: "Accessories", //can be "Accessories", "Development", "Games", "Graphics", "Internet", "Multimedia", "Office", "Other", or "System
	 * 		> }
	 */
	this.getAppList = function(callback) {
	api.xhr({
		backend: "core.app.fetch.list",
		load: function(data, ioArgs)
		{
			callback(data);
		},
		handleAs: "json"
	});
	}
}
