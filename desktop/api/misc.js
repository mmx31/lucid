api.console = function(text)
{
	dojo.byId("consoleoutput").innerHTML += text+"\n";
	dojo.byId('console').scrollTop = dojo.byId('console').scrollHeight;
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