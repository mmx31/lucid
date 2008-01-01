/**
 * Package: config
 * 
 * Group: desktop
 * 
 * Summary: 
 * 		Contains configuraton for the desktop.
 * 
 */
desktop.config = {
	init: function(cback) {
		desktop.config.load(cback);
		setInterval(desktop.config.save, 1000*60);
	},
	load: function(cback) {
		dojo.xhrGet({
	        url: desktop.core.backend("core.config.stream.load"),
	        load: function(data, ioArgs) {
				desktop.config = dojo.mixin(desktop.config, data);
				for(var a=0;a<desktop.config.startupapps.length;a++) {
					desktop.app.launch(desktop.config.startupapps[a]);
				}
				desktop.config.apply();
				if(cback) cback();
			},
	        error: function(error, ioArgs) { api.log("Error loading the config: "+error.message); },
			handleAs: "json"
        });
	},
	save: function(sync) {
		if(typeof sync == "undefined") sync=false;
		var conf = desktop.config;
		conf = dojo.toJson(conf);
		dojo.xhrPost({
            url: desktop.core.backend("core.config.stream.save"),
			sync: sync,
            content: {value: conf},
			error: function(error, ioArgs) { api.log("Error saving the config: "+error.message); },
            mimetype: "text/plain"
        });
	},
	apply: function()
	{
		dojo.publish("configApply", [desktop.config]);
	},
	/**
	 * Intensity of desktop effects (3 = insane, 0 = none)
	 * 
	 * @type {Int}
	 * @alias desktop.config.fx
	 * @memberOf desktop.config
	 */
	fx: 1,
	/**
	 * Whether or not the desktop should do various debugging tasks
	 * 
	 * @type {Boolean}
	 * @alias desktop.config.debug
	 * @memberOf desktop.config
	 */
	debug: true,
	/**
	 * Crosstalk Ping timer
	 * 
	 * @type {Integer}
	 * @alias desktop.config.crosstalkPing
	 * @memberOf desktop.config
	 */
	crosstalkPing: 800,
	/**
	 * Configuration on taskbar elements
	 * 
	 * @type {Object}
	 * @alias desktop.config.taskbar
	 * @memberOf desktop.config
	 */
	taskbar: {
		/**
		 * Whether or not the taskbar is shown
		 * 
		 * @type {Boolean}
		 * @alias desktop.config.taskbar.isShown
		 * @memberOf desktop.config.taskbar
		 */
		isShown: true
	},
	wallpaper: {
		image: "./themes/green/wallpaper.jpg",
		color: "#eeeeee"
	},
	theme: "green",
	startupapps: [],
	window: {
		constrain: false,
		animSpeed: 275
	},
	crosstalkPing: 500,
	filesystem: {
		hideExt: true,
		handlers: {
			txt: 4,
			folder: 10,
			htm: 6,
			html: 6
		},
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
