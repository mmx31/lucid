api.console = function(text)
{
		dojo.byId("desktop_console_output").innerHTML += text;
		dojo.byId("desktop_console_input").focus();
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