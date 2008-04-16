dojo.provide("desktop.theme");
desktop.theme = {
	//	summary:
	//		Theme manager
	//	fileList: Array
	//		The different CSS files to load for each theme
	fileList: ["theme", "window", "icons", "dijit"],
	draw: function()
	{
		dojo.addClass(document.body, "dijit");
		dojo.forEach(this.fileList, function(e)
		{
			var element = document.createElement("link");
			element.rel = "stylesheet";
			element.type = "text/css";
			element.media = "screen";
			element.href = "./themes/"+(desktop.config.theme ? desktop.config.theme : "green")+"/"+e+".css";
			element.id = "desktop_theme_"+e;
			document.getElementsByTagName("head")[0].appendChild(element);
		});
		dojo.subscribe("configApply", this, function(conf) {
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
		dojo.forEach(this.fileList, function(e) {
			dojo.byId("desktop_theme_"+e).href ="./themes/"+desktop.config.theme+"/"+e+".css";
		});
	},
	/*
	 * Method: list
	 * 
	 * Pases a list of the themes to the callback provided
	 * 
	 * Arguments:
	 * 		callback - a callback function
	 * 		sync - should the call be syncronous? (defaults to false)
	 */
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
	list: function(/*Function*/callback, /*Boolean?*/sync)
	{
		//	summary:
		//		Pases a list of the themes to the callback provided
		//	callback:
		//		a callback function. First arg is an array of desktop.theme._listArgs objects.
		//	sync:
		//		Should the call be synchronous? defaults to false.
		api.xhr({
			backend: "core.theme.get.list",
			load: callback,
			sync: sync || false,
			handleAs: "json"
		});
	}
}
