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
		 * The current working directory
		 * 
		 * @type {String}
		 * @alias desktop.taskbar.visibility
		 * @memberOf desktop.taskbar
		 */
		this.visibility = "show";
		/** 
		* sets the visibility of the taskbar
		* 
		* @alias desktop.taskbar.setVisibility
		* @param {String} value	can be "hide" or "show"
		* @type {Function}
		* @memberOf desktop.taskbar
		*/
		this.setVisibility = function(value)
		{
			if(value == "hide")
			{
				//new Effect.Fade('taskbar');
				this.visibility = "hide";
				document.getElementById("taskbarhider").innerHTML='<img src="./icons/showtask.gif">';
				dojo.html.setOpacity(dojo.byId("taskbar"), 0);
			}
			else
			{
				if(value == "show")
				{
					//new Effect.Appear('taskbar');
					dojo.html.setOpacity(dojo.byId("taskbar"), 100);
					this.visibility = "show";
					document.getElementById("taskbarhider").innerHTML='<img src="./icons/hidetask.gif">';
				}
			}
		}
		/** 
		* toggles the visibility of the tasbar. Used for the taskbar hider
		* 
		* @alias desktop.taskbar.hider
		* @type {Function}
		* @memberOf desktop.taskbar
		*/
		this.hider = function()
		{
			if(this.visibility == "show")
			{
				//new Effect.Fade('taskbar');
				dojo.lfx.html.fadeOut('taskbar', 300).play();
				this.visibility = "hide";
				dojo.byId("taskbarhider").innerHTML='<img src="./icons/showtask.gif">';
			}
			else
			{
				if(this.visibility == "hide")
				{
					dojo.lfx.html.fadeIn('taskbar', 300).play();
					this.visibility = "show";
					document.getElementById("taskbarhider").innerHTML='<img src="./icons/hidetask.gif">';
				}
			}
			desktop.windows.desktopResize();
			api.registry.saveValue(-1,"taskbarVisibility",this.visibility);
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
			div = document.createElement("div");
			div.id="sysclock";
			div.style.display="none";
			div.innerHTML = "<div id='clock'></div>";
			document.body.appendChild(div);
			appbarcontent = '<div id="appbar"></div>';
			tasktray = '<table id="tasktray"><tr id="tasklist"><td><div id="trayclock"></div></td></tr></table>';
			html='<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td width="30"><img src="./icons/apps.gif" onmousedown ="desktop.menu.button();" border="0"></td><td width="1%"><div class="seperator"></div></td><td width="80%">'+appbarcontent+'</td><td width="1%"><div class="seperator"></div></td><td width="15%">'+tasktray+'</td></tr></table>';
			//dojo.widget.createWidget("contentPane", {id: "appbar"}, dojo.byId("appbar"));
			div= document.createElement("div");
			div.innerHTML = html;
			div.id="taskbar";
			document.body.appendChild(div);
			div = document.createElement("div");
			div.id="taskbarhider";
			div.innerHTML = "<img src='./icons/hidetask.gif'>";
			document.body.appendChild(div);
			div.setAttribute("onclick", "desktop.taskbar.hider();");
			this.clock = dojo.widget.createWidget("clock", {id: "sysclock"}, dojo.byId("clock"));
			dojo.byId("trayclock").setAttribute("onclick", "desktop.taskbar.toggleClock();", true);
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
		}
		/** 
		* toggles the visibility of the analog clock
		* 
		* @alias desktop.taskbar.toggleClock
		* @type {Function}
		* @memberOf desktop.taskbar
		*/
		this.toggleClock = function()
		{
			if(dojo.byId("sysclock").style.display=="block")
			{
				dojo.byId("sysclock").style.display="none";
			}
			else dojo.byId("sysclock").style.display="block";
		}
	}