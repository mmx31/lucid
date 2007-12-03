api.consoleBuffer = new Array();
api.misc = new Object();
/**
* Writes stuff to the Psych Desktop console, and to firebug/the browser's console
* 
* @memberOf api
* @param {String} text	the text to put on the console
* @constructor	
*/
api.console = function(text)
{
	if(desktop.isLoaded == true)
	{
		dojo.byId("consoleoutput").innerHTML += text+"<br />\n";
		dojo.byId('console').scrollTop = dojo.byId('console').scrollHeight;
		if (console.log)
		{
			console.debug(text);
		}
	}
	else
	{
		api.consoleBuffer[api.consoleBuffer.length] = text;
		if(!this._subscribe)
		{
			this._subscribe = dojo.subscribe("desktopload", this, function() {
				for(message in api.consoleBuffer) api.console(message);
				dojo.unsubscribe(this._subscribe);
			});
		}
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
* @deprecated unfortunatly, dojo toaster widget does not work, so we're still figuring out what to do here.
*/
api.toaster = function(message)
{
	dojo.event.topic.publish("psychdesktop", message);
}

api.addDojoCss = function(path)
{
	var element = document.createElement("link");
	element.rel = "stylesheet";
	element.type = "text/css";
	element.media = "screen";
	element.href = "./dojo/"+path;
	document.getElementsByTagName("head")[0].appendChild(element);
}
