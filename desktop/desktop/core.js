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
desktop.reload = false;
desktop.isLoaded = false;
/*
 * Package: core
 * 
 * Group: desktop
 * 
 * Summary:
 * 		Contains all the core functions of the desktop
 */
desktop.core = new function()
{
		/** 
		* Instalizes the desktop
		* 
		* @alias desktop.core.init
		* @type {Function}
		* @memberOf desktop.core
		*/
		this.init = function()
		{
			setTimeout('dijit.byId("desktop_main").resize()', 1000);
			dojo.connect(window, "onresize", desktop.windows, desktop.windows.desktopResize);
			this.beforeUnloadEvent = dojo.connect(window, "onbeforeunload", null, function(e)
			{
				desktop.core.logout(true);
			});
			dojo.connect(document, "onkeydown", desktop.console, desktop.console.toggle);
			dojo.connect(document, "onmouseup", desktop.menu, desktop.menu.leftclick);
			if(desktop.config.debug == false)
			{
				dojo.connect(window, "onerror", null, function(e)
				{
					api.console(e);
					alert("Psych Desktop encountered an error.\nPlease report this to the developers with the console output.\n(press the '`' key)")
				});
			}
			//cleanup
			desktop.isLoaded = true;
			dojo.publish("desktopload", ["yes"]);
			
			//startup applications
			g = desktop.config.startupapps;
			for(f in g)
			{
				if((typeof f) == "number")
				desktop.app.launch(g[f]);
			}
		}
		/** 
		* Logs the user out
		* TODO: get this working
		* 
		* @alias desktop.core.logout
		* @type {Function}
		* @memberOf desktop.core
		*/
		this.logout = function(sync)
		{
			if(desktop.reload) { return false; }
			dojo.disconnect(this.beforeUnloadEvent);
			if(typeof sync == "undefined") sync=false;
			desktop.config.save(sync);
			dojo.publish("desktoplogout", ["yes"]);
			dojo.xhrGet({
				url: desktop.core.backend("core.user.auth.logout"),
				sync: sync,
				load: function(data, ioArgs){
					if(data == "0")
					{
						if(desktop.config.fx == true)
						{
							var anim = dojo.fadeOut({node: document.body, duration: 1000});
							dojo.connect(anim, "onEnd", null, function(){
								dojo.style(document.body, "opacity", 0);
								window.close();
							});
							anim.play();
						}
						else
						{
							dojo.style(document.body, "opacity", 0);
							window.close();
						}
					}
					else
					{
						api.console("Error communicating with server, could not log out");
					}
				},
					mimetype: "text/plain"
			});
		}
		/** 
		* Shows or hides the loading indicator
		* 
		* @alias desktop.core.loadingIndicator
		* @param {Integer} action	When set to 0 the loading indicator is displayed. When set to 1, the loading indicator will be hidden.
		* @type {Function}
		* @memberOf desktop.core
		*/
		this.loadingIndicator = function(action)
		{
			//api.console("desktop.core.loadingIndicator is depricated!");
		}
		/*
		 * This generates a backend to use based on the module given
		 */
		this.backend = function(module)
		{
			var mod=module.split(".");
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
		this.draw = function()
		{
			dojo.require("dijit.layout.LayoutContainer");
			var elm = new dijit.layout.LayoutContainer({
				id: "desktop_main",
				style: "width: 100%; height: 100%;"
			}, document.createElement("div"));
			document.body.appendChild(elm.domNode);
			elm.startup();
		}
}
