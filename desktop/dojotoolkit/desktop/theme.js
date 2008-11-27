dojo.provide("desktop.theme");
desktop.theme = {
	//	summary:
	//		Theme manager
	//	fileList: Array
	//		The different CSS files to load for each theme
	fileList: ["dijit", "theme", "window", "icons"],
	draw: function()
	{
		if(dojo.isIE) document.execCommand('BackgroundImageCache', false, true);
		dojo.subscribe("configApply", this, function(conf){
			desktop.theme.set(conf.theme);
		});
	},
	set: function(/*String*/theme)
	{
		//	summary:
		//		Sets the theme
		//	theme:
		//		the theme to use
		desktop.config.theme = theme;
		dojo.forEach(this.fileList, function(e)
		{
			var elem = dojo.byId("desktop_theme_"+e);
			if(elem){
				elem.parentNode.removeChild(elem);
				elem = null;
			}
			var element = document.createElement("link");
			element.rel = "stylesheet";
			element.type = "text/css";
			element.media = "screen";
			element.href = dojo.moduleUrl("desktop.resources.themes."+theme, e+".css");
			element.id = "desktop_theme_"+e;
			document.getElementsByTagName("head")[0].appendChild(element);
		});
	},
	/*=====
	_listArgs: {
		//	sysname: String
		//		the system name of the string (it's directory's name in /desktop/themes/)
		sysname: "green",
		//	name: String
		//		the displayable name of the theme
		name:"Green",
		//	author: String
		//		the author of the theme
		author:"Psychcf",
		//	email: String
		//		the email address of the author
		email:"will@psychdesigns.net",
		//	version: String
		//		The version of the theme
		version:"1.0",
		//	wallpaper: String
		//		the wallpaper for the theme (file located in the theme's dir)
		wallpaper:"wallpaper.png",
		//	preivew: String
		//		a screenshot of the theme (file located in the theme's dir)
		preview:"screenshot.png"
	}
	=====*/
	list: function(/*Function*/onComplete, /*Function?*/onError, /*Boolean?*/sync)
	{
		//	summary:
		//		Pases a list of the themes to the callback provided
		//	callback:
		//		a callback function. First arg is an array of desktop.theme._listArgs objects.
		//	sync:
		//		Should the call be synchronous? defaults to false.
        var d = new dojo.Deferred();
        if(onComplete) d.addCallback(onComplete);
        if(onError) d.addErrback(onError);
		desktop.xhr({
			backend: "core.theme.get.list",
			load: dojo.hitch(d, "callback"),
            error: dojo.hitch(d, "errback"),
			sync: sync || false,
			handleAs: "json"
		});
        return d;
	},
	remove: function(/*String*/name, /*String?*/onComplete, /*String?*/onError){
		//	summary:
		//		removes a theme from the system
		//		must be an administrator to use this
		//	name:
		//		the name of the theme to remove
		//	onComplete:
		//		a callback once the action has been completed
		//	onError:
		//		a callback if there's an error
		var df = desktop.xhr({
			backend: "core.theme.package.remove",
			content: {
				themename: name
			}
		});
		if(onCallback) df.addCallback(onComplete);
		if(onError) df.addErrback(onError);
		return df;
	}
}
