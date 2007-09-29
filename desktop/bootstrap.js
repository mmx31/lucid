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
var desktop = {};
desktop.modules = {};
dojo.require("dojo.io.script");
if(navigator.appName == "Microsoft Internet Explorer")
{
	//they give us shit poor debuging utilities, so we have no way of debugging our bootstrap.
	window.onerror = function(e)
	{
		err  = "An error occurred:\n";
		for(mod in desktop.modules)
		{
			if((typeof desktop[mod]) != "undefined")
			{
				err += mod+": loaded\n";
			}
			else
			{
				err += mod+": failed ("+(typeof desktop[mod])+")\n";
				if(mod == "api")
				{
					for(lib in api.libList)
					{
						if((typeof api[lib]) != "undefined")
						{
							err += "--"+lib+": loaded\n";
						}
						else
						{
							err += "--"+lib+": failed\n";
						}
					}
				}
			}
		}
		err += "\nerror:\n"+e;
		alert(err);
	};
}
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
  require: function(libraryName, version, callback) {
  	/*
    // inserting via DOM fails in Safari 2.0, so brute force approach
	if(version == "1.7") document.write('<script type="application/javascript;version=1.7" src="'+libraryName+'"></script>');
	else document.write('<script type="text/javascript" src="'+libraryName+'"></script>');*/
	var url = "./desktop/"+libraryName+".js";
	desktop.modules[libraryName] = {};
	desktop.modules[libraryName].initiated = false;
	desktop.modules[libraryName].loaded = false;
	if(typeof version == "integer" || typeof version == "string")
	{
		var element = document.createElement("script");
		element.type = "application/javascript;version="+version;
		element.src = url;
		element.id = "lib_"+libraryName;
		document.getElementsByTagName("head")[0].appendChild(element);
		desktop.modules[libraryName].version = version;
	}
	else
	{
		dojo.io.script.get({
			url: url,
			preventCache: true, //change to false in releases, this is to make debugging easier
			id: "lib_"+libraryName
		});
		desktop.modules[libraryName].version = "";
	}
},
numberOfModulesLoaded: 0,
  checkifloaded: function()
	{
		if(desktop.modules.api.initiated === true)
		{
			var nom = 0;
			for(mod in desktop.modules) {nom++;}
			for(mod in desktop.modules)
			{
				if(desktop.modules[mod].loaded === false)
				{
					if((typeof desktop[mod]) == "object")
					{
						desktop.modules[mod].loaded = true;
						bootstrap.numberOfModulesLoaded++;
						var p = bootstrap.numberOfModulesLoaded; //.toString();
						bootstrap._indicator.update({progress: p, maximum: nom});
						setTimeout(function(){}, 0); //yield
					}
					else
					{
						if(desktop.modules[mod].version == "1.7")
						{
							desktop[mod] = {disabled: true};
							desktop.modules[mod].loaded = true;
						}
						else
						{
							desktop.modules[mod].loaded = false;
							setTimeout(bootstrap.checkifloaded, 50);
							return;
						}
					}
				}
			}
			desktop.config.draw(function() {
				for(lib in desktop.modules) {
					if((typeof desktop[lib].draw) == "function") { desktop[lib].draw(); }
				}
				for(lib in desktop.modules)
				{
					if(lib != "core" && lib != "api" && lib != "config") {
						if((typeof desktop[lib].init) == "function") {
							desktop[lib].init();
						}
					}
					desktop.modules[lib].initiated = true;
				}
				dojo.doc.body.removeChild(bootstrap._loading);
				desktop.core.init();
			});
		}
		else
		{
			if((typeof api) != "undefined") {
				api.init();
				desktop.modules.api.initiated = true;
				//alert((typeof api)+", "+desktop.modules.api.initiated);
			}
			setTimeout(bootstrap.checkifloaded, 50);
		}
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
	dojo.require("dijit.ProgressBar");
  	bootstrap._loading = dojo.doc.createElement("div");
	bootstrap._loading.innerHTML = "Loading...";
	bootstrap._loading.style.position="absolute";
	var d=dijit.getViewport();
	bootstrap._loading.style.top=(d.h/3)+"px";
	bootstrap._loading.style.left=(d.w/3)+"px";
	bootstrap._loading.style.height=(d.h/3)+"px";
	bootstrap._loading.style.width=(d.w/3)+"px";
	bootstrap._loading.style.textAlign= "center";
	bootstrap._loading.style.zIndex = "1000000";
	dojo.addClass(bootstrap._loading, "tundra");
	bootstrap._indicator = new dijit.ProgressBar({indeterminate: true});
	bootstrap._loading.appendChild(bootstrap._indicator.domNode);
	dojo.doc.body.appendChild(bootstrap._loading);
	  
 bootstrap.link("./dojo/dijit/themes/dijit.css", "dijit");
 bootstrap.link("./dojo/dijit/themes/dijit_rtl.css", "dijit_rtl");
 bootstrap.link("./dojo/dijit/themes/tundra/tundra.css", "tundra");
 bootstrap.link("./dojo/dijit/themes/tundra/tundra_rtl.css", "tundra_rtl");
 bootstrap.link("desktop.css", "corestyle");
 dojo.require("dijit.layout.LayoutContainer");
 dojo.require("dijit.layout.ContentPane");
 dojo.require("dijit.Menu");
 dojo.require("dojo.dnd.move");
 dojo.require("dojo.fx");
 bootstrap.require('api');
 bootstrap.require('app');
 bootstrap.require('config');
 bootstrap.require('console');
 bootstrap.require('core');
 bootstrap.require('icon');
 bootstrap.require('menu');
 bootstrap.require('rightclick');
 bootstrap.require('screensaver');
 bootstrap.require('taskbar');
 bootstrap.require('theme');
 //bootstrap.require('thread', "1.7");
 bootstrap.require('wallpaper');
 bootstrap.require('widget');
 bootstrap.require('windows');
 bootstrap._indicator.update({indeterminate: false, progress: 0});
 bootstrap.checkifloaded();
}
};
dojo.addOnLoad(bootstrap.load);