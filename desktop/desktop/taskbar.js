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
				document.getElementById("taskbarhider").innerHTML='<img src="./icons/showtask.gif">';
				dojo.style("taskbar", "opacity", 0);
				dojo.byId("taskbar").style.display="none";
			}
			else
			{
				if(value == true)
				{
					dojo.byId("taskbar").style.display="block";
					dojo.style("taskbar", "opacity", 90);
					desktop.config.taskbar.isShown = true;
					document.getElementById("taskbarhider").innerHTML='<img src="./icons/hidetask.gif">';
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
						dojo.byId("taskbar").style.display="none";
						dojo.byId("taskbarhider").innerHTML='<img src="./themes/default/images/icons/showtask.gif">';
					}));
					anim.play();
				}
				else
				{
					dojo.byId("taskbar").style.display="none";
					dojo.style("taskbar", "opacity", 1);
					dojo.byId("taskbarhider").innerHTML='<img src="./themes/default/images/icons/showtask.gif">';
				}
			}
			else if(desktop.config.taskbar.isShown == false)
			{
				desktop.config.taskbar.isShown = true;
				dojo.byId("taskbar").style.display="block";
				dojo.byId("taskbarhider").innerHTML='<img src="./themes/default/images/icons/hidetask.gif">';
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
			this._div.setAttribute("class", "taskBarItem");
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
			document.body.appendChild(div);
			tasktray = '<table id="tasktray"><tr id="tasklist"><td><div id="trayclock"></div></td></tr></table>';
			html='<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td width="30"><img src="./themes/default/images/icons/apps.gif" onmousedown ="desktop.menu.button();" border="0"></td><td width="1%"><div class="seperator"></div></td><td width="80%"><div id="appbar"></div></td><td width="1%"><div class="seperator"></div></td><td width="15%">'+tasktray+'</td></tr></table>';
			div = document.createElement("div");
			div.innerHTML = html;
			div.id="taskbar";
			document.body.appendChild(div);
			div = document.createElement("div");
			div.id="taskbarhider";
			div.innerHTML = "<img src='./themes/default/images/icons/hidetask.gif'>";
			document.body.appendChild(div);
			div.setAttribute("onclick", "desktop.taskbar.hider();");
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
		///** 
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