api.util = {};
if(typeof djConfig == "undefined") djConfig = {};
djConfig.usePlainJson=true;

/*
 * Class: api
 * 
 * Method: xhr
 * 
 * an extention of dojo's XHR utilities, but with some extra params to make life easy
 * 
 * Arguments:
 * 		args -	When you give a string such as "api.fs.io.read", you will get the backend's url returned.
 * 				You can also give an object as you would in dojo's XHR methods. However there are two extra params.
 * 				backend - a backend string as described above
 * 				xsite - when true, it makes the call using the server-side proxy (so you can make cross-domain requests)
 */
api.xhr = function(/*dojo.__ioArgs|String*/args) {
	var backend = function(str) {
		var mod=str.split(".");
		//TODO: put in something so we can switch to python backends when desired
		var url = "../backend";
		for(var i=0; i <= mod.length-3; i++)
		{
			url += "/"+mod[i];
		}
		url += ".php?section="+escape(mod[mod.length-2]);
		url += "&action="+escape(mod[mod.length-1])
		return url;
	}
	if(dojo.isString(args)) {
		//if we just need to get a module url, pass a string
		return backend(args);
	}
	if(args.xsite) {
		if(!dojo.isObject(args.content)) args.content = {};
		args.content.path = args.url;
		args.url = "../backend/api/xsite.php";
	}
	else if(args.backend) {
		args.url = backend(args.backend);
	}
	else if(args.app) {
		args.url = "../apps/"+args.app+"/"+args.url;
	}
	var callback = args.load;
	args.load = function(data, ioArgs) {
		if(typeof parseInt(data) == "number" && parseInt(data) > 0) {
			console.error(data); //TODO: we should alert the user in some cases, or possibly retry the request
		}
		callback.apply(dojo.global, arguments);
	}
	//comment filtering is tricky in certain cases...
	//if(args.handleAs == "json") {
	//	args.handleAs="json-comment-filtered";
	//}
	return dojo.xhrPost(args);
}

/*
 * Method: addDojoCss
 * 
 * Adds an additional dojo CSS file (usefull for the dojox modules)
 * 
 * Arguments:
 * 		path - the path to the css file (the path to dojo is placed in front)
 * 
 * Example:
 * 		api.addDojoCss("/dojox/widget/somewidget/foo.css");
 */
api.addDojoCss = function(/*String*/path)
{
	var element = document.createElement("link");
	element.rel = "stylesheet";
	element.type = "text/css";
	element.media = "screen";
	element.href = "./dojo/"+path;
	document.getElementsByTagName("head")[0].appendChild(element);
}

/*
 * Method: log
 * 
 * logs a string onto any console that is open
 * 
 * Arguments:
 * 		str - the string to log onto the consoles
 */
api.log = function(/*String*/str) {
	str = dojo.toJson(str);
	dojo.query(".consoleoutput").forEach(function(elem) {
		elem.innerHTML += "<br />"+str;
	});
}