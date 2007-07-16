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
				app_return = data;
				html = '<ul id="nav">';
				rawcode = app_return.split(desktop.app.xml_seperator);
				app_amount = rawcode.length;
				app_amount--;
				app_amount = app_amount/3;
				var x = 0;
				var y = 0;
				var z = 1;
				office_id = new Array();
				office_name = new Array();
				office_count = 0;
				system_id = new Array();
				system_name = new Array();
				system_count = 0;
				internet_id = new Array();
				internet_name = new Array();
				internet_count = 0;
				while (x <= app_amount)
				{
					var app_id = rawcode[y];
					var app_name = rawcode[z];
					var app_category = rawcode[z+1];
					switch(app_category)
					{
						case "Office":
							office_id[office_id.length] = app_id;
							office_name[office_name.length] = app_name;
						break;
						case "System":
							system_id[system_id.length] = app_id;
							system_name[system_name.length] = app_name;			
						break;
						case "Internet":
							internet_id[internet_id.length] = app_id;
							internet_name[internet_name.length] = app_name;
							internet_count++;			
						break;
					}
					x++;
					y++; y++; y++;
					z++; z++; z++;
				}
				html += '<li style="border-top: 1px solid white; border-bottom: 1px solid white;"><img src="./themes/default/images/icons/applications-office.png" />&nbsp;Office<ul>';
				for(count=0;count<=office_id.length-1;count++)
				{
					html += '<li onClick="javascript:desktop.app.launch('+office_id[count]+');" style="border-top: 1px solid white; border-bottom: 1px solid white;">'+office_name[count]+'</li>';
				}
				html += '</ul>';
				html += '<li style="border-top: 1px solid white; border-bottom: 1px solid white;"><img src="./themes/default/images/icons/applications-internet.png" />&nbsp;Internet<ul>';
				for(count=0;count<=internet_id.length-1;count++)
				{
					html += '<li onClick="javascript:desktop.app.launch('+internet_id[count]+');" style="border-top: 1px solid white; border-bottom: 1px solid white;">'+internet_name[count]+'</li>';
				}
				html += '</ul>';
				html += '<li style="border-top: 1px solid white; border-bottom: 1px solid white;"><img src="./themes/default/images/icons/preferences-system.png" />&nbsp;System<ul>';
				for(count=0;count<=system_id.length-1;count++)
				{
					html += '<li onClick="javascript:desktop.app.launch('+system_id[count]+');" style="border-top: 1px solid white; border-bottom: 1px solid white;">'+system_name[count]+'</li>';
				}
				html += '</ul>';
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