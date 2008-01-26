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
dojo.require("dojo.io.script");
dojo.require("dijit.ProgressBar");
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
bootstrap = {
    modules: [
		"api.aflax",
	    'api.console',
		"api.crosstalk",
		"api.registry",
		"api.filearea",
		"api.fs",
		"api.ide",
		"api.instances",
		"api.mail",
		"api.misc",
		"api.sound",
		"api.startup",
		"api.tray",
		"api.ui",
		"api.user",
		"api.window",
		//"api.xhr",
		"api.xsite",
	    'desktop.admin',
	    'desktop.app',
	    'desktop.config',
	    'desktop.core',
	    //'desktop.screensaver',
	    'desktop.theme',
		'desktop.ui',
	    //'desktop.widget',
	    'desktop.user'
	],
	loaded: false,
    require: function() {
		dojo.forEach(bootstrap.modules, function(libraryName) {
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
	            load: dojo.hitch(bootstrap, bootstrap.check)
	        });
	    });
	},
    check: function()
    {
		if (!bootstrap.loaded) {
			var ready = true;
			var modCount = 0;
			for (key in bootstrap.modules) {
				if (eval('typeof(' + bootstrap.modules[key] + ')') == "undefined") {
					ready = false;
					break;
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
			if(dojo.isFunction(eval(module + ".draw")))
			{
				eval(module+".draw()");
			}
		});
		dojo.forEach(bootstrap.modules, function(module) {
			if(dojo.isFunction(eval(module + ".init")))
			{
				eval(module+".init()");
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
        bootstrap.link("desktop.css", "corestyle");
        bootstrap.link("./dojo/dijit/themes/dijit.css", "dijit");
        bootstrap.link("./dojo/dijit/themes/dijit_rtl.css", "dijit_rtl");
		bootstrap.require();
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