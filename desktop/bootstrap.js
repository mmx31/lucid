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
(function() {
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
var bootstrap = {
    modules: [
	    'api.console',
		"api.crosstalk",
		"api.registry",
		"api.filearea",
		"api.fs",
		"api.ide",
		"api.mail",
		"api.sound",
		"api.ui",
		"api.user",
		"api.util",
		"api.window",
	    'desktop.admin',
	    'desktop.app',
	    'desktop.config',
	    'desktop.theme',
		'desktop.ui',
	    'desktop.user'
	],
	loaded: false,
    load: function() {
        bootstrap.link("desktop.css", "corestyle");
        bootstrap.link("./dojo/dijit/themes/dijit.css", "dijit");
        bootstrap.link("./dojo/dijit/themes/dijit_rtl.css", "dijit_rtl");
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
			for (key in bootstrap.modules) {
				if (eval('typeof(' + bootstrap.modules[key] + ')') == "undefined") {
					ready = false;
					break;
				}
				
			}
			if (ready) {
				bootstrap.loaded = true;
				bootstrap.startup();
			}
		}
    },
    startup: function()
    {
        dojo.forEach(bootstrap.modules, function(module) {
			if(dojo.isFunction(eval(module).draw))
			{
				eval(module).draw();
			}
			else if(eval(module).prototype && dojo.isFunction(eval(module).prototype.draw)) {
				eval(module).prototype.draw();
			}
		});
		dojo.forEach(bootstrap.modules, function(module) {
			if(dojo.isFunction(eval(module).init))
			{
				eval(module).init();
			}
			else if(eval(module).prototype && dojo.isFunction(eval(module).prototype.init)) {
				eval(module).prototype.init();
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
					history.back();
					window.close();
					document.body.innerHTML = "Not Logged In";
					//Maybe one day we should implement a login form
				}
			}
		});
	}
};
dojo.addOnLoad(bootstrap.checkLoggedIn);
})();
