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
* Package: bootstrap
* 
* Summary:
* 		Bootstrap methods to load the desktop.
* 
* Description:
* 		This initiates each module of the desktop. First, it adds the <script>
* 		tags dynamically for each module, and waits for it to load.
* 		Then, it looks for a 'draw()' method in each module and calls it.
* 		Finally, it looks for an 'init()' method, and calls it.
* 		If a module does not have an 'init' or 'draw' method, it does not get called.
*/
var bootstrap = {
    modules: [],
	loaded: false,
    require: function(libraryName) {
        var path = libraryName.split(".").join("/");
		var base = libraryName.split(".")[0];
		if(typeof window[base] == "undefined")
			window[base] = {}; //make the root object
        dojo.io.script.get({
            url: "./" + path + ".js",
            preventCache: false,
            module: libraryName,
            checkString: libraryName,
            canDelete: false,
            load: bootstrap.check

        });
        bootstrap.modules.push(libraryName);

    },
    check: function()
    {
		if (!bootstrap.loaded) {
			var ready = true;
			var modCount = 0;
			for (key in bootstrap.modules) {
				if (eval('typeof(' + bootstrap.modules[key] + ')') == "undefined") {
					ready = false;
				}
				else 
					modCount++;
				
			}
			if (ready) {
				bootstrap.loaded = true;
				bootstrap.startup();
			}
			else {
				bootstrap._indicator.update({
					indeterminate: false,
					progress: modCount,
					maximum: bootstrap.modules.length
				});
			}
		}
    },
    startup: function()
    {
		bootstrap._loading.parentNode.removeChild(bootstrap._loading);
        dojo.forEach(bootstrap.modules, function(module) {
			if(eval("typeof(" + module + ".draw) == 'function'"))
			{
				eval(module).draw();
			}
		});
		dojo.forEach(bootstrap.modules, function(module) {
			if(eval("typeof(" + module + ".init) == 'function'"))
			{
				eval(module).init();
			}
		});
	},
    link: function(file, id)
    {
        var element = document.createElement("link");
        element.rel = "stylesheet";
        element.type = "text/css";
        element.media = "screen";
        element.href = file;
        element.id = id;
        document.getElementsByTagName("head")[0].appendChild(element);

    },
    load: function() {
		dojo.require("dojo.io.script");
        dojo.require("dijit.ProgressBar");
        bootstrap._loading = dojo.doc.createElement("div");
        bootstrap._loading.innerHTML = "Loading...";
        var d = dijit.getViewport();
		var style = {
			position: "absolute",
			top: (d.h / 3) + "px",
	        left: (d.w / 3) + "px",
	        height: (d.h / 3) + "px",
	        width: (d.w / 3) + "px",
	        textAlign: "center",
	        zIndex: "1000000"
		};
		for(key in style) {
			dojo.style(bootstrap._loading, key, style[key]);
		}
       
        dojo.addClass(bootstrap._loading, "tundra");
        bootstrap._indicator = new dijit.ProgressBar({
            indeterminate: true
        });
        bootstrap._loading.appendChild(bootstrap._indicator.domNode);
        dojo.doc.body.appendChild(bootstrap._loading);

        bootstrap.link("./dojo/dijit/themes/dijit.css", "dijit");
        bootstrap.link("./dojo/dijit/themes/dijit_rtl.css", "dijit_rtl");
        bootstrap.link("desktop.css", "corestyle");
		dojo.require("dijit.layout.LayoutContainer");
		dojo.require("dijit.layout.ContentPane");
		dojo.require("dijit.Menu");
 		dojo.require("dojo.dnd.move");
		bootstrap.require("api.crosstalk");
		bootstrap.require("api.registry");
		bootstrap.require("api.filearea");
		bootstrap.require("api.fs");
		bootstrap.require("api.ide");
		bootstrap.require("api.instances");
		bootstrap.require("api.misc");
		bootstrap.require("api.soundmanager");
		bootstrap.require("api.startup");
		bootstrap.require("api.tray");
		bootstrap.require("api.ui");
		bootstrap.require("api.user");
		bootstrap.require("api.window");
		bootstrap.require("api.xsite");
        bootstrap.require('desktop.admin');
        bootstrap.require('desktop.app');
        bootstrap.require('desktop.config');
        bootstrap.require('desktop.console');
        bootstrap.require('desktop.core');
        bootstrap.require('desktop.icon');
        bootstrap.require('desktop.menu');
        bootstrap.require('desktop.rightclick');
        bootstrap.require('desktop.screensaver');
        bootstrap.require('desktop.taskbar');
        bootstrap.require('desktop.theme');
        bootstrap.require('desktop.user');
        bootstrap.require('desktop.wallpaper');
        bootstrap.require('desktop.widget');
        bootstrap.require('desktop.windows');
        bootstrap._indicator.update({
            indeterminate: false,
            progress: 0
        });

    },
	checkLoggedIn: function()
	{
		dojo.xhrGet({
			url: "../backend/core/bootstrap.php?section=check&action=loggedin",
			load: function(data, ioArgs) {
				if(data == "0")
				{
					bootstrap.load();
				}
				else
				{
					window.close();
					document.body.innerHTML = "Not Logged In";
					//Maybe one day we should implement a login form
				}
			}
		});
	}
};
dojo.addOnLoad(bootstrap.checkLoggedIn);