/**
* Writes stuff to the Psych Desktop console, and to firebug/the browser's console
* 
* @memberOf api
* @param {String} text	the text to put on the console
* @constructor	
*/
api.console = function(text)
{
	dojo.byId("consoleoutput").innerHTML += text+"<br />\n";
	dojo.byId('console').scrollTop = dojo.byId('console').scrollHeight;
	if (console.log)
	{
		console.log(text);
	}
}
/**
* Changes the console's path.
* 
* @param {String} text	the path to switch to
* @memberOf api
* @constructor	
*/
api.consolepath = function(text)
{
	return desktop.console.aliases.cd(text);
}
/**
* The misc API. For things that don't really have a category
* 
* @classDescription	The misc API. For things that don't really have a category
* @memberOf api
* @constructor	
*/
api.misc = new function()
{    
	/**
	* Logs the user out
	* 
	* @memberOf api.misc
	* @constructor	
	* @deprecated why would an app need to log a user out? also couldn't they just call desktop.core.logout directly?
	*/
	this.logout = function()
	{
		desktop.core.logout();
	}
}
/**
* Displays a toaster notification
* 
* @param {String} message	the text the popup should have
* @memberOf api
* @constructor	
*/
api.toaster = function(message)
{
	dojo.event.topic.publish("psychdesktop", message);
}
