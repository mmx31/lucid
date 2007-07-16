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
* Contains all the functions of the desktop
*
* @classDescription	Contains all the functions of the desktop
*/
var desktop = new Object();
desktop.modules = new Object();
dojo.require("dojo.io.script");

/**
* Bootstrap methods to load the desktop.
*
* @classDescription	Bootstrap methods to load the desktop.
*/
var PsychDesktop = {
  require: function(libraryName, version, callback) {
  	/*
    // inserting via DOM fails in Safari 2.0, so brute force approach
	if(version == "1.7") document.write('<script type="application/javascript;version=1.7" src="'+libraryName+'"></script>');
	else document.write('<script type="text/javascript" src="'+libraryName+'"></script>');*/
	var url = "./desktop/"+libraryName+".js";
	desktop.modules[libraryName] = new Object();
	desktop.modules[libraryName].initiated = false;
	if(typeof version == "integer" || typeof version == "string")
	{
		var element = document.createElement("script");
		element.type = "application/javascript;version="+version;
		element.src = url;
		element.id = "lib_"+libraryName;
		document.getElementsByTagName("head")[0].appendChild(element);
	}
	else
	{
		dojo.io.script.get({
			url: url,
			preventCache: true, //change to false in releases, this is to make debugging easier
			id: "lib_"+libraryName
		});
	}
},
  checkifloaded: function()
	{
		if(desktop.modules.api.initiated == true)
		{
			for(mod in desktop.modules)
			{
				if((typeof desktop[mod]) != "undefined")
				{
					desktop.modules[mod].loaded = true;
				}
				else
				{
						desktop.modules[mod].loaded = false;
						setTimeout(PsychDesktop.checkifloaded, 50);
						return;
				}
			}
			for(lib in desktop.modules) if((typeof desktop[lib].draw) == "function") desktop[lib].draw();
			for(lib in desktop.modules)
			{
				if(lib != "core" && lib != "api") if((typeof desktop[lib].init) == "function") desktop[lib].init();
				desktop.modules[lib].initiated = true;
			}
			desktop.core.init();
		}
		else
		{
			if((typeof api) != "undefined") {
				api.init();
				desktop.modules.api.initiated = true;
				//alert((typeof api)+", "+desktop.modules.api.initiated);
			}
			setTimeout(PsychDesktop.checkifloaded, 50);
		}
	},
  link: function(file, id)
  {
  	//document.write('<link id="'+id+'" rel="stylesheet" href="'+file+'" type="text/css" media="screen" />');
	var element = document.createElement("link");
	element.rel = "stylesheet";
	element.type = "text/css";
	element.media = "screen";
	element.href = file;
	element.id = id;
	document.getElementsByTagName("head")[0].appendChild(element);
  },
  load: function() {
 dojo.require("dijit.layout.LayoutContainer");
 dojo.require("dijit.layout.ContentPane");
 dojo.require("dijit.Menu");
 dojo.require("dojo.dnd.move");
 dojo.require("dojo.fx");
 PsychDesktop.require('api');
 PsychDesktop.require('app');
 PsychDesktop.require('config');
 PsychDesktop.require('console');
 PsychDesktop.require('core');
 PsychDesktop.require('icon');
 PsychDesktop.require('menu');
 PsychDesktop.require('rightclick');
 PsychDesktop.require('screensaver');
 PsychDesktop.require('taskbar');
 PsychDesktop.require('thread', "1.7");
 PsychDesktop.require('wallpaper');
 PsychDesktop.require('widget');
 PsychDesktop.require('windows');
 PsychDesktop.link("./themes/default/theme.css", "desktop_theme");
 PsychDesktop.link("./themes/default/window.css", "window_theme");
 PsychDesktop.link("desktop.css", "corestyle");
 PsychDesktop.checkifloaded();
}
}
dojo.addOnLoad(PsychDesktop.load);