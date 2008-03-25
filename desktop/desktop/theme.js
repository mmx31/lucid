dojo.provide("desktop.theme");
/*
 * Class: desktop.theme
 * 
 * Takes care of themes
 */
desktop.theme = {
	/*
	 * Property: fileList
	 * 
	 * The different CSS files to load for each theme
	 */
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
	/*
	 * Method: set
	 * 
	 * Sets the theme
	 * 
	 * Arguments:
	 * 		theme - the theme to use
	 */
	set: function(/*String*/theme)
	{
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
	list: function(/*Function*/callback, /*Boolean?*/sync)
	{
		api.xhr({
			backend: "core.theme.get.list",
			load: callback,
			sync: sync || false,
			handleAs: "json"
		});
	}
}
