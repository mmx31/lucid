/*
 * Class: desktop
 * 
 * Property: version
 * 
 * The version of the desktop
 */
desktop.version = "SVN";

/*
 * Class: desktop.config
 * 
 * Contains configuraton for the desktop.
 */
desktop.config = {
	init: function(cback) {
		desktop.config.load(cback);
		setInterval(desktop.config.save, 1000*60);
	},
	/*
	 * Method: load
	 * 
	 * Loads the configuration from the server
	 */
	load: function(cback) {
		api.xhr({
	        backend: "core.config.stream.load",
	        load: function(data, ioArgs) {
				if(data == "") {
					desktop.config.apply();
					if(cback) cback();
					return;
				}
				data = dojo.fromJson(data);
				desktop.config = dojo.mixin(desktop.config, data);
				for(var a=0;a<desktop.config.startupapps.length;a++) {
					desktop.app.launch(desktop.config.startupapps[a]);
				}
				desktop.config.apply();
				if(cback) cback();
			}
        });
	},
	/*
	 * Method: save
	 * 
	 * Saves the current configuration to the server
	 */
	save: function(sync) {
		if(typeof sync == "undefined") sync=false;
		var conf = dojo.toJson(desktop.config);
		api.xhr({
            backend: "core.config.stream.save",
			sync: sync,
            content: {value: conf}
        });
	},
	/*
	 * Method: apply
	 * 
	 * Applies the current configuration settings
	 */
	apply: function()
	{
		dojo.publish("configApply", [desktop.config]);
	},
	/*
	 * Property: fx
	 * 
	 * Intensity of desktop effects (3 = insane, 0 = none)
	 */
	fx: 2,
	/*
	 * Property: debug
	 * 
	 * Whether or not the desktop should output information involving debugging
	 */
	debug: true,
	/*
	 * Property: crosstalkPing
	 * 
	 * Crosstalk ping interval (in miliseconds)
	 */
	crosstalkPing: 800,
	/*
	 * Property: panels
	 * 
	 * an array of each panel's settings and applets
	 */
	panels: [
		{
			thickness: 24,
			span: 1,
			locked: true,
			orientation: "horizontal",
			placement: "BC",
			opacity: 0.95,
			applets: [
				{"settings": {}, "pos": 0, "declaredClass": "desktop.ui.applets.menubar"},
				{"settings": {}, "pos": 0.20, "declaredClass": "desktop.ui.applets.taskbar"},
				{"settings": {}, "pos": 0.89, "declaredClass": "desktop.ui.applets.netmonitor"},
				{"settings": {}, "pos": 0.92, "declaredClass": "desktop.ui.applets.clock"}
			]
		}
	],
	/*
	 * Property: toasterPos
	 * 
	 * Position the toaster popup will appear
	 * Can be one of: ["br-up", "br-left", "bl-up", "bl-right", "tr-down", "tr-left", "tl-down", "tl-right"]
	 * 
	 * TODO:
	 * 		this needs a configuration tool
	 */
	toasterPos: "tr-down",
	/*
	 * Property: wallpaper
	 * 
	 * wallpaper information
	 * 
	 * image - the image to display
	 * color - the background color of the wallpaper
	 * style - can be "centered", "tiled", or "fillscreen"
	 * storedList - an array of wallpapers that the user can pick from in the wallpaper dialog
	 */
	wallpaper: {
		image: "./themes/default/wallpaper.png",
		color: "#32cd32",
		style: "centered",
		storedList: [
			"./themes/green/wallpaper.jpg",
			"./themes/default/wallpaper.png",
			"./themes/tsunami/wallpaper.jpg"
		]
	},
	/*
	 * Property: theme
	 * 
	 * The user's preferred theme
	 */
	theme: "green",
	/*
	 * Property: theme
	 * 
	 * An array of app ids to launch at startup
	 */
	startupapps: [],
	/*
	 * Property: window
	 * 
	 * window settings
	 * 
	 * constrain - should the window be constrained to the screen's edge?
	 * animSpeed - how fast the fade/maximize/minimize animations should be in miliseconds
	 */
	window: {
		constrain: false,
		animSpeed: 275
	},
	
	/*
	 * Property: filesystem
	 * 
	 * Some filesystem options (primarily for filearea)
	 * 
	 * hideExt - should the file extentions be hidden?
	 * icons - a json object containing icons for each file extention
	 */
	filesystem: {
		hideExt: true,
		//TODO: use mimetypes, not extentions!
		icons: {
			txt: "icon-32-mimetypes-text-x-generic",
			desktop: "icon-32-mimetypes-application-x-executable",
			mp3: "icon-32-mimetypes-audio-x-generic",
			wav: "icon-32-mimetypes-audio-x-generic",
			wma: "icon-32-mimetypes-audio-x-generic",
			jpg: "icon-32-mimetypes-image-x-generic",
			png: "icon-32-mimetypes-image-x-generic",
			gif: "icon-32-mimetypes-image-x-generic",
			xcf: "icon-32-mimetypes-image-x-generic",
			zip: "icon-32-mimetypes-package-x-generic",
			gz: "icon-32-mimetypes-package-x-generic",
			tar: "icon-32-mimetypes-package-x-generic",
			rar: "icon-32-mimetypes-package-x-generic",
			sh: "icon-32-mimetypes-text-x-script",
			js: "icon-32-mimetypes-text-x-script",
			bin: "icon-32-mimetypes-text-x-script",
			mpg: "icon-32-mimetypes-video-x-generic",
			wmv: "icon-32-mimetypes-video-x-generic",
			mpeg: "icon-32-mimetypes-video-x-generic",
			avi: "icon-32-mimetypes-video-x-generic",
			mpg: "icon-32-mimetypes-video-x-generic"
		}
	}
}
