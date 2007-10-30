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
			/*if(this.visibility == "closed")
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
			}*/
			dijit.popup.open({
				dropDown: this._menu
			});
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
				var menu = new dijit.Menu({
					id: "sysmenu"
				}, dojo.byId("sysmenu"));
				this._menu = menu;
				//menu.domNode.id="sysmenu";
				var cats = new Object();
				for(item in data)
				{
					cats[data[item].category] = true;
				}
				for(cat in cats)
				{
					//cat.meow();
					var category = new dijit.PopupMenuItem({iconClass: "icon-16-categories-applications-"+cat.toLowerCase(), label: cat});
					//category.addChild(dojo.doc.createElement("span"));
					var catMenu = new dijit.Menu({parentMenu: category});
					for(app in data)
					{
						if(data[app].category == cat)
						{
							var item = new dijit.MenuItem({
								label: data[app].name
							});
							dojo.connect(item, "onClick", desktop.app, 
							new Function("desktop.app.launch("+data[app].ID+")") );
							catMenu.addChild(item);
						}
					}
					catMenu.startup();
					//category.addChild(catMenu);
					category.popup = catMenu;
					menu.addChild(category);
				}
				menu.addChild(new dijit.MenuItem({
					label: "Log Out", 
					iconClass: "icon-16-actions-system-log-out",
					onClick: desktop.core.logout
				}));
				menu.bindDomNode("menubutton");
				menu.domNode.style.display="none";
				menu.startup();
				dojo.doc.body.appendChild(menu.domNode);
				desktop.taskbar.makeButton();
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
			//div.innerHTML = html;
			document.body.appendChild(div);
			this.getApplications();
		}
		this.init = function() {
			dojo.require("dijit.Menu");
		}
	}
