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
* Contains all the taskbar functions of the desktop
* 
* @classDescription	Contains all the taskbar functions of the desktop
* @memberOf desktop
* @constructor	
*/
desktop.taskbar = new function()
	{
		/** 
		* sets the visibility of the taskbar
		* 
		* @alias desktop.taskbar.setVisibility
		* @param {Bool} value	false hides, true shows
		* @type {Function}
		* @memberOf desktop.taskbar
		*/
		this.setVisibility = function(value)
		{
			if(value == false)
			{
				desktop.config.taskbar.isShown = false;
				dojo.addClass(dojo.byId("taskbarhider"), "taskbarhider-hidden");
				dojo.addClass(dijit.byId("taskbar").domNode, "hidetaskbar");
			}
			else
			{
				if(value == true)
				{
					dojo.removeClass(dojo.byId("taskbarhider"), "taskbarhider-hidden");
					dojo.removeClass(dijit.byId("taskbar").domNode, "hidetaskbar");
					desktop.config.taskbar.isShown = true;
				}
			}
		}
		/** 
		* toggles the visibility of the taskbar. Used for the taskbar hider
		* 
		* @alias desktop.taskbar.hider
		* @type {Function}
		* @memberOf desktop.taskbar
		*/
		this.hider = function()
		{
			if(desktop.config.taskbar.isShown == true)
			{
				desktop.config.taskbar.isShown = false;
				if(desktop.config.fx == true)
				{
					var anim = dojo.fadeOut({ node: "taskbar", duration: 200 });
					dojo.connect(anim, "onEnd", null, dojo.hitch(this, function() {
						dojo.addClass(dijit.byId("taskbar").domNode, "hidetaskbar");
						dijit.byId("taskbar").startup();
						dijit.byId("desktop_main").resize();
						dojo.addClass(dojo.byId("taskbarhider"), "taskbarhider-hidden");
					}));
					anim.play();
				}
				else
				{
					dojo.addClass(dijit.byId("taskbar").domNode, "hidetaskbar");
					dojo.addClass(dojo.byId("taskbarhider"), "taskbarhider-hidden");
				}
			}
			else if(desktop.config.taskbar.isShown == false)
			{
				desktop.config.taskbar.isShown = true;
				dojo.removeClass(dijit.byId("taskbar").domNode, "hidetaskbar");
				dojo.removeClass(dojo.byId("taskbarhider"), "taskbarhider-hidden");
				dijit.byId("taskbar").startup();
				dijit.byId("desktop_main").resize();
				if(desktop.config.fx == true) dojo.fadeIn({ node: "taskbar", duration: 200 }).play();
				else dojo.style("taskbar", "opacity", 1);
			}
			desktop.windows.desktopResize();
		}
		/** 
		* Adds a taskbar item to the taskbar
		* TODO: add a context menu that can close the window, minimize it, etc.
		* 
		* @alias desktop.taskbar.task
		* @type {Function}
		* @param {object} Options	The properties of the item
		* @memberOf desktop.taskbar
		* @constructor
		*/
		this.task = function(options)
		{
			this.label = options.label;
			this.icon = options.icon;
			this.onclick = options.onclick;
			this.winid = options.winid;
			this._div=document.createElement("div");
			this._div.onclick = this.onclick;
			this._div.id="task_"+options.winid;
			dojo.addClass(this._div, "taskBarItem");
			if(this.icon) this._div.innerHTML = "<img src='"+this.icon+"' />";
			this._div.innerHTML += options.label;
			dojo.style(this._div, "opacity", 0);
			dojo.byId("appbar").appendChild(this._div);
			dojo.fadeIn({ node: this._div, duration: 200 }).play();
			this.destroy = function()
			{
				if(desktop.config.fx == true)
				{
					var anim = dojo.fadeOut({ node: this._div, duration: 200 });
					dojo.connect(anim, "onEnd", null, dojo.hitch(this, function() {
						this._div.parentNode.removeChild(dojo.byId(this._div));
					}));
					anim.play();
				}
				else this._div.parentNode.removeChild(dojo.byId(this._div));
			}
		}
		/** 
		* draws the taskbar
		* 
		* @alias desktop.taskbar.draw
		* @type {Function}
		* @memberOf desktop.taskbar
		*/
		this.draw = function()
		{
			tasktray = '<table id="tasktray"><tr id="tasklist"><td id="taskclock">&nbsp;</td><td><div id="trayclock"></div></td></tr></table>';
			html='<table border="0" cellpadding="0" cellspacing="0" width="100%" class="taskbartable"><tr><td width="30"><div id="menubutton"></div></td><td width="1%"><div class="seperator"></div></td><td width="80%"><div id="appbar"></div></td><td width="1%"><div class="seperator"></div></td><td width="15%">'+tasktray+'</td></tr></table>';
			
			div = new dijit.layout.ContentPane({
				id: "taskbar",
				layoutAlign: "bottom"
			}, document.createElement("div"))
			div.setContent(html);
			dijit.byId("desktop_main").addChild(div);
			dijit.byId("desktop_main").resize();
			
			
			div = document.createElement("div");
			div.id="taskbarhider";
			dojo.addClass(div, "taskbarhider");
			document.body.appendChild(div);
			dojo.connect(div, "onclick", this, this.hider);
			
			div = document.createElement("td");
			div.innerHTML = "<div class='icon-22-status-network-idle' id='networkStatus'></div>";
			dojo.byId("tasklist").insertBefore(div, dojo.byId("taskclock"));
			this._xhrStart = dojo.connect(dojo,"_ioSetArgs",this,function(m)
			{
				var f = Math.random();
				if(f <= (1/3)) dojo.byId("networkStatus").setAttribute("class", "icon-22-status-network-receive");
				else if(f <= (2/3)) dojo.byId("networkStatus").setAttribute("class", "icon-22-status-network-transmit");
				else dojo.byId("networkStatus").setAttribute("class", "icon-22-status-network-transmit-receive");
			}); 
		    this._xhrEnd = dojo.connect(dojo.Deferred.prototype,"_fire",this,function(m)
			{
				dojo.byId("networkStatus").setAttribute("class", "icon-22-status-network-idle");
			}); 
		}
		this.makeButton = function()
		{
			dojo.require("dijit.form.Button");
			var menubutton = new dijit.form.DropDownButton({
				iconClass: "menubutton-icon",
				label: "Apps",
				showLabel: false,
				dropDown: dijit.byId("sysmenu")
			}, dojo.byId("menubutton"));
			menubutton.domNode.style.height="28px";
			//menubutton.domNode.id="menubutton";
			menubutton.startup();
			
		}
		this.init = function()
		{
			dojo.subscribe("configApply", this, function(){
				var p = desktop.config.taskbar.isShown;
				this.setVisibility(p);
			});
			this.clockinterval = setInterval(function(){
				var clock_time = new Date();
				var clock_hours = clock_time.getHours();
				var clock_minutes = clock_time.getMinutes();
				var clock_seconds = clock_time.getSeconds();
				var clock_suffix = "AM";
				if (clock_hours > 11){
					clock_suffix = "PM";
					clock_hours = clock_hours - 12;
				}
				if (clock_hours == 0){
					clock_hours = 12;
				}
				if (clock_hours < 10){
					clock_hours = "0" + clock_hours;
				}if (clock_minutes < 10){
					clock_minutes = "0" + clock_minutes;
				}if (clock_seconds < 10){
					clock_seconds = "0" + clock_seconds;
				}
				dojo.byId("trayclock").innerHTML = clock_hours + ":" + clock_minutes + ":" + clock_seconds + " " + clock_suffix;
			}, 1000);
			dojo.subscribe("desktoplogout", this, function(){
				clearInterval(this.clockinterval);
			});
		}
		/*this isn't in dojo 0.9...
		/ 
		* toggles the visibility of the analog clock
		* 
		* @alias desktop.taskbar.toggleClock
		* @type {Function}
		* @memberOf desktop.taskbar
		*//*
		this.toggleClock = function()
		{
			if(dojo.byId("sysclock").style.display=="block")
			{
				dojo.byId("sysclock").style.display="none";
			}
			else dojo.byId("sysclock").style.display="block";
		}*/
	}
