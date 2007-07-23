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
* Contains all the menu functions of the desktop
* TODO: use dojo's popupmenu2 widget, the CSS based menus are too problematic...
* 
* @classDescription	Contains all the menu functions of the desktop
* @memberOf desktop
* @constructor
*/

desktop.menu = new function()
	{
		/**
		 * Tracks wheather or not the desktop's menu is visible
		 * 
		 * @type {String}
		 * @alias desktop.menu.visibility
		 * @memberOf desktop.menu
		 */
		this.visibility = "closed";
		/**
		 * Tracks the number of clicks. Used when closing the menu.
		 * 
		 * @type {Integer}
		 * @alias desktop.menu.clickcache
		 * @memberOf desktop.menu
		 */
		this.clickcache = 0;
		/** 
		* A function that fixes IE display bugs in the menu
		* 
		* @memberOf desktop.menu
		* @alias desktop.menu.sfHover
		*/
		this.sfHover = function() {
			var sfEls = document.getElementById("sysmenu").getElementsByTagName("LI");
			for (var i=0; i<sfEls.length; i++) {
				sfEls[i].onmouseover=function() {
					this.className+=" sfhover";
				}
				sfEls[i].onmouseout=function() {
					this.className=this.className.replace(new RegExp(" sfhover\\b"), "");
				}
			}
		}
		if (window.attachEvent) window.attachEvent("onload", dojo.hitch(this, this.sfHover));
		/** 
		* Triggered on the document's left click event, used to close the menu.
		*
		* @memberOf desktop.menu
		* @alias desktop.menu.leftclick
		*/
		this.leftclick = function()
		{
			if(this.clickcache == '1')
			{
				if(this.visibility=="open")
				{
					this.hide();
					this.visibility="closed";
					this.clickcache = 0;
				}
			}
			else
			{
				count=5;
				while(count != 0)
				{
					if(this.visibility=="open")
					{
						this.clickcache = 1;
					}
					count--;
				}
			}
		}
		/** 
		* Function that is triggered when the menu button is pressed.
		* 
		* @memberOf desktop.menu
		* @alias desktop.menu.button
		*/
		this.button = function()
		{
			if(this.visibility == "closed")
			{
				document.getElementById("sysmenu").style.display = "inline";
				if(desktop.config.fx == true) dojo.fadeIn({ node: 'sysmenu', duration: 300 }).play();
				else dojo.style(dojo.byId("sysmenu"), "opacity", 100);
				this.visibility = "open";
			}
			else
			{
				if(this.visibility == "open")
				{
					//this.visibility = "closed";
				}
			}
		}
		/** 
		* Hides the menu
		*
		* @memberOf desktop.app
		* @alias desktop.menu.hide
		*/
		this.hide = function()
		{
			if(desktop.config.fx == true)
			{
			var anim = dojo.fadeOut({ node: 'sysmenu', duration: 300 });
			dojo.connect(anim, "onEnd", null, function(){
				document.getElementById("sysmenu").style.display = "none";
			});
			anim.play();
			}
			else
			{
				document.getElementById("sysmenu").style.display = "none";
			}
		}
		
		
		/** 
		* Gets a list of applications from the server and generates a menu from it.
		* TODO: convert this into JSON
		*
		* @memberOf desktop.menu
		* @alias desktop.menu.getApplications
		*/
		this.getApplications = function() {
		desktop.core.loadingIndicator(0);
		var url = "../backend/app.php?action=getPrograms";
		dojo.xhrGet({
			url: url,
			load: dojo.hitch(this, function(data, ioArgs){
				data = dojo.fromJson(data);
				html = '<ul id="nav">';
				var cats = new Object();
				for(item in data)
				{
					cats[data[item].category] = true;
				}
				for(cat in cats)
				{
					html += '<li style="border-top: 1px solid white; border-bottom: 1px solid white;"><img src="./themes/default/images/icons/applications-'+(cat.toLowerCase())+'.png" />&nbsp;'+cat+'<ul>';
					for(app in data)
					{
						if(data[app].category == cat)
						html += '<li onClick="javascript:desktop.app.launch('+data[app].ID+');" style="border-top: 1px solid white; border-bottom: 1px solid white;">'+data[app].name+'</li>';
					}
					html += '</ul></li>';
				}
				html += '<li onClick="javascript:desktop.core.logout();" style="border-top: 1px solid white; border-bottom: 1px solid white;"><img src="./themes/default/images/icons/system-log-out.png" />&nbsp;Logout</li>';
				html += '</ul>';
				document.getElementById("menu").innerHTML = html;
				desktop.core.loadingIndicator(1);
				}),
			error: function(type, data, evt) { desktop.core.loadingIndicator(1) },
			mimetype: "text/plain"
		});
		}
		
		/** 
		* Draws the menu
		*
		* @memberOf desktop.menu
		* @alias desktop.menu.draw
		*/
		this.draw = function()
		{
			html  = "<table><tr><td class='menutop'></td></tr><tr><td class='menubody'>";
			html += "<div id='menu_name'></div>";
			html += "<div id='menu'></div>";
			html += "</td></tr></table>";
			div = document.createElement("div");
			div.id="sysmenu";
			div.innerHTML = html;
			document.body.appendChild(div);
			this.getApplications();
		}
	}