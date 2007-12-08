/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
	*/
/*
 * Package: config
 * 
 * Group: desktop
 * 
 * Summary: 
 * 		Contains configuraton for the desktop.
 * 
 */
desktop.config = {
	draw: function(cback) {
		desktop.config.load(cback);
		setInterval(desktop.config.save, 1000*60);
	},
	load: function(cback) {
		dojo.xhrGet({
        url: desktop.core.backend("core.config.stream.load"),
        load: function(data, ioArgs) {
			if(data != "")
			{
				var config = dojo.fromJson(data);
				config = dojo.mixin(desktop.config, config);
				desktop.config = config;
				delete config;
				for(var a=0;a<desktop.config.startupapps.length;a++) {
					desktop.app.launch(desktop.config.startupapps[a]);
				}
				desktop.theme.set(desktop.config.theme);
			}
			if(cback) cback();
		},
        error: function(error, ioArgs) { api.console("Error loading the config: "+error.message); },
		mimetype: "text/plain"
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
			error: function(error, ioArgs) { api.console("Error saving the config: "+error.message); },
            mimetype: "text/plain"
        });
	},
	apply: function()
	{
		dojo.publish("configApply", []);
	},
	/**
	 * Whether or not the desktop's effects should be enabled (fading and such)
	 * 
	 * @type {Boolean}
	 * @alias desktop.config.fx
	 * @memberOf desktop.config
	 */
	fx: true,
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
		constrain: false
	},
	crosstalkPing: 500,
	filesystem: {
		hideExt: true,
		handlers: {
			txt: 4,
			folder: 10
		}
	}
}
