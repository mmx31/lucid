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
/**
* Contains configuraton for the desktop.
*  
* @type {Object}
* @memberOf desktop
*/
desktop.config = {
	init: function() {
		desktop.config.load();
		setInterval(desktop.config.save, 1000*60);
	},
	load: function() {
		//TODO: give this it's own mySQL table
		dojo.xhrGet({
        url: "../backend/api/registry.php?registry=load&appid=0&varname=config",
        load: function(data, ioArgs) {
			if(data != "")
			{
				var config = dojo.fromJson(data);
				config = dojo.mixin(config, {
					load: desktop.config.load,
					save: desktop.config.save
				});
				desktop.config = config;
				delete config;
			}
		},
        error: function(error, ioArgs) { api.console("Error loading the config: "+error.message); },
		mimetype: "text/plain"
        });
	},
	save: function() {
		var conf = desktop.config;
		conf = dojo.toJson(conf);
		dojo.xhrPost({
            url: "../backend/api/registry.php?registry=save&appid=0&varname=config",
            content: {value: conf},
			error: function(error, ioArgs) { api.console("Error saving the config: "+error.message); },
            mimetype: "text/plain"
        });
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
		image: "./wallpaper/default.gif",
		color: "#eeeeee"
	}
}