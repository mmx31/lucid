api.console = function(text)
{
		dojo.byId("consoleoutput").innerHTML += text+"\n";
}
api.misc = new function()
{    
	this.logout = function()
	{
		desktop.core.logout();
	}
}
api.toaster = function(message)
{
	dojo.event.topic.publish("psychdesktop", message);
}