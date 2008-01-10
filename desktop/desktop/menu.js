/**
* Contains all the menu functions of the desktop
* TODO: use dojo's popupmenu2 widget, the CSS based menus are too problematic...
* 
* @classDescription	Contains all the menu functions of the desktop
* @memberOf desktop
* @constructor
*/
dojo.require("dijit.Menu");
desktop.menu = new function()
	{		
		/** 
		* Gets a list of applications from the server and generates a menu from it.
		* TODO: convert this into JSON
		*
		* @memberOf desktop.menu
		* @alias desktop.menu.getApplications
		*/
		this.getApplications = function() {
		dojo.xhrGet({
			url: desktop.core.backend("core.app.fetch.list"),
			load: dojo.hitch(this, function(data, ioArgs){
				data = dojo.fromJson(data);
				if (this._menu) {
					this._menu.destroy();
					this.draw(true);
				}
				var menu = new dijit.Menu({
					id: "sysmenu"
				}, dojo.byId("sysmenu"));
				this._menu = menu;
				var cats = {};
				for(item in data)
				{
					cats[data[item].category] = true;
				}
				list = [];
				for(cat in cats)
				{
					list.push(cat);
				}
				list.sort();
				for(cat in list)
				{
					var cat = list[cat];
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
							new Function("desktop.app.launch("+data[app].id+")") );
							catMenu.addChild(item);
						}
					}
					catMenu.startup();
					//category.addChild(catMenu);
					category.popup = catMenu;
					menu.addChild(category);
				}
				//menu.addChild(new dijit.MenuItem({label:"System", disabled:true}));
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
		this.draw = function(getApps)
		{
			dojo.require("dijit.Menu");
			//html  = "<table><tr><td class='menutop'></td></tr><tr><td class='menubody'>";
			//html += "<div id='menu_name'></div>";
			//html += "<div id='menu'></div>";
			//html += "</td></tr></table>";
			div = document.createElement("div");
			div.id="sysmenu";
			//div.innerHTML = html;
			document.body.appendChild(div);
			if(!getApps) this.getApplications();
		}
	}
