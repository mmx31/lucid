api.misc = {};

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
