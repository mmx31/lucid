dojo.provide("desktop._base");
dojo.require("desktop.admin");
dojo.require("desktop.app");
dojo.require("desktop.config");
dojo.require("desktop.theme");
dojo.require("desktop.ui");
dojo.require("desktop.user");
dojo.require("desktop.crosstalk");
dojo.require("desktop.filesystem");
dojo.require("desktop.Registry");
dojo.require("desktop.Sound");
dojo.require("desktop.dialog");
dojo.require("desktop.widget.Window");
dojo.require("desktop.widget.StatusBar");
dojo.require("desktop.widget.Console");
dojo.require("desktop.widget.FileArea");
dojo.require("desktop.flash.flash");

(function(){
	var modules = [
		"desktop.crosstalk",
		"desktop.filesystem",
		"desktop.Sound",
	    'desktop.admin',
	    'desktop.app',
	    'desktop.config',
	    'desktop.theme',
		'desktop.ui',
	    'desktop.user',
        'desktop.dialog'
	]
	var callIfExists = function(object, method){
		object = dojo.getObject(object);
		if(dojo.isFunction(object[method]))
		{
			object[method]();
		}
		else if(object.prototype && dojo.isFunction(object.prototype.draw)){
			object.prototype[method]();
		}
	}
	dojo.addOnLoad(function(){
		desktop.xhr({
			backend: "core.bootstrap.check.loggedin",
			load: function(data, ioArgs){
				if(data == "0")
				{
					dojo.forEach(modules, function(module){
						callIfExists(module, "draw");
					});
					dojo.forEach(modules, function(module){
						callIfExists(module, "init");
					});
				}
				else
				{
					history.back();
					window.close();
					document.body.innerHTML = "Not Logged In";
				}
			}
		});
		//if debugging, put console in a window
		if(dojo.config.isDebug){
			var console = dojo.byId("firebugToolbar")
		}
	});
})();

(function(){
    var token = null;
    
    desktop.xhr = function(/*dojo.__ioArgs|String*/args){
	    //	summary:
    	//		an extention of dojo's XHR utilities, but with some extra params to make life easy
	    //	
    	//	args:
    	//		When you give a string such as "api.fs.io.read", you will get the backend's url returned.
	    //		You can also give an object as you would in dojo's XHR methods. However there are two extra params.
    	//		backend - a backend string as described above
	    //		xsite - when true, it makes the call using the server-side proxy (so you can make cross-domain reques
    	var backend = function(str){
	    	var mod=str.split(".");
		    //TODO: put in something so we can switch to python backends when desired
    		var url = "../backend";
	    	for(var i=0; i <= mod.length-3; i++)
		    {
    			url += "/"+mod[i];
	    	}
		    url += ".php?section="+escape(mod[mod.length-2]);
    		url += "&action="+escape(mod[mod.length-1])
    
            // WORKAROUND, see #159 for more info
            if(str == "api.fs.io.upload")
                return "../backend/api/fs_uploader_workaround.php?vars="+dojo.cookie("desktop_session");
    
	    	return url;
    	}
	    if(dojo.isString(args)){
		    //if we just need to get a module url, pass a string
    		return backend(args);
	    }
    	if(args.xsite){
	    	if(!dojo.isObject(args.content)) args.content = {};
		    var xsiteArgs = {
    			url: args.url
	    	}
		    if(args.auth){
			    xsiteArgs.authinfo = dojo.clone(args.auth);
    			if(!args.appid){
	    			xsiteArgs.appid=0;
		    	}
			    else {
				    xsiteArgs.appid=args.appid;
    				delete args.appid;
	    		}
		    }
	    	args.content["DESKTOP_XSITE_PARAMS"] = dojo.toJson(xsiteArgs);
    		delete args.auth;
	    	args.url = "../backend/api/xsite.php";
    	}
	    else if(args.backend){
    		args.url = backend(args.backend);
	    }
    	else if(args.app){
	    	args.url = "../apps/"+args.app+"/"+args.url;
	    }
    	var df = new dojo.Deferred();
	    if(args.load) df.addCallback(args.load);
    	if(args.error) df.addErrback(args.error);
        if(!args.content) args.content = {};
	    args.content["DESKTOP_TOKEN"] = token;
    	var xhr = dojo.xhrPost(dojo.mixin(args, {
	    	load: function(data){
		    	if(typeof parseInt(data) == "number" && parseInt(data) > 0 && !args.number){
			    	console.error(data); //TODO: we should alert the user in some cases, or possibly retry the request. OR FUCKTARD, RETURN AN ERROR, NE?
				    df.errback(data);
    			}
	    		else
		    		df.callback(data);
    		},
	    	error: function(err){
		    	console.error(err);
			    df.errback(err);
    		},
	    }));
    	df.canceler = dojo.hitch(xhr, "cancel");
	    return df;
    }
    dojo.xhrPost({
        url: "../backend/core/bootstrap.php?section=check&action=getToken",
        sync: true,
        load: function(data){
            token = data.token;
        },
        handleAs: "json"
    });
})();
desktop.addDojoCss = function(/*String*/path)
{
	//	summary:
	//		Adds an additional dojo CSS file (useful for the dojox modules)
	//
	//	path:
	//		the path to the css file (the path to dojo is placed in front)
	//	
	//	example:
	//	|	api.addDojoCss("/dojox/widget/somewidget/foo.css");
	var element = document.createElement("link");
	element.rel = "stylesheet";
	element.type = "text/css";
	element.media = "screen";
	element.href = "./dojotoolkit/"+path;
	document.getElementsByTagName("head")[0].appendChild(element);
}

desktop.log = function(/*String*/str){
	//	summary:
	//		logs a string onto any console that is open
	//	
	//	str:
	//		the string to log onto the consoles
	str = dojo.toJson(str);
	dojo.query(".consoleoutput").forEach(function(elem){
		elem.innerHTML += "<div>"+str+"</div>";
	});
	console.log(str);
}

desktop.textContent= function(/*DomNode|String*/node, /*String?*/text){
	//	summary:
	//		sets the textContent of a domNode if text is provided
	//		gets the textContent if a domNode if text is not provided
	//		if dojo adds this in the future, grep though
	//		the js code and replace it with dojo's method
	//	node:
	//		the node to set/get the text of
	//	text:
	//		the text to use
	node = dojo.byId(node);
	var attr = typeof node.textContent == "string" ? "textContent" : "innerText";
	if(arguments.length == 1)
		return node[attr];
	else
		node[attr] = text;
}

desktop._errorCodes = [
	"ok",
	"generic_err",
	"not_authed",
	"not_found",
	"db_connect_err",
	"db_select_err",
	"db_query_err",
	"permission_denied",
	"mail_connect_err",
	"feature_not_available",
	"object_not_found",
	"already_installed",
	"quota_exceeded",
	"remote_authentication_failed",
	"remote_connection_failed"
];
