/**
* Contains all the wallpaper functions of the desktop
* 
* @classDescription	Contains all the wallpaper functions of the desktop
* @memberOf desktop
* @constructor	
*/
desktop.wallpaper = new function()
	{
		/** 
		* Loads the wallpaper preferences
		* 
		* @alias desktop.wallpaper.loadPrefs
		* @type {Function}
		* @memberOf desktop.wallpaper
		*/
		this.loadPrefs = function()
		{
			this.set(desktop.config.wallpaper.image);
			this.setColor(desktop.config.wallpaper.color);
		}
		/** 
		* Sets the wallpaper image
		* 
		* @alias desktop.wallpaper.set
		* @param {string} image	The image to use as the wallpaper
		* @type {Function}
		* @memberOf desktop.wallpaper
		*/		
		this.set = function(image)
		{
			dojo.style("wallpaper", "backgroundImage", (image ? "url("+image+")" : "none"));
		}
		/** 
		* Sets the wallpaper background color
		* 
		* @alias desktop.wallpaper.setColor
		* @param {string} color	The color to use. Can be a color name or a hex code, or RGB.
		* @type {Function}
		* @memberOf desktop.wallpaper
		*/
		this.setColor = function(color)
		{
			if( document.documentElement && document.documentElement.style ) {
			    document.documentElement.style.backgroundColor = color; }
			if( document.body && document.body.style ) {
			    document.body.style.backgroundColor = color; }
			    document.bgColor = color;
		}
		/** 
		* Draws the wallpaper elements
		* 
		* @alias desktop.wallpaper.init
		* @type {Function}
		* @memberOf desktop.wallpaper
		*/
		this.draw = function()
		{
			div = document.createElement("div");
			div.id="wallpaper";
			div.name="wallpaper";
			//document.body.appendChild(div);
			var client = new dijit.layout.ContentPane({
				layoutAlign: "client"
			}, document.createElement("div"));
			client.setContent(div);
			dijit.byId("desktop_main").addChild(client);
			dijit.byId("desktop_main").resize();
		}
		this.init = function()
		{
			dojo.subscribe("configApply", this, this.loadPrefs);
			this.loadPrefs();
		}
	}