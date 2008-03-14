this.kill = function() {
	if(!this.win.closed) { this.win.close(); }
	if(this._userMenu) { this._userMenu.destroy(); }
}
this.init = function(args)
{
	dojo.require("dijit.layout.SplitContainer");
	dojo.require("dijit.layout.LayoutContainer");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("dijit.ProgressBar");
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.form.Button");
	dojo.require("dojox.grid.Grid");
	dojo.require("dojo.data.ItemFileWriteStore");
	dojo.require("dijit.Menu");
	api.addDojoCss("dojox/grid/_grid/Grid.css");
	//make window
	this.win = new api.window({title: "Administration Panel", width: "500px", height: "400px", onClose: dojo.hitch(this, this.kill)});
	var split = new dijit.layout.SplitContainer({sizerWidth: 7, orientation: "horizontal", layoutAlign: "client"});
	var pane = new dijit.layout.ContentPane({sizeMin: 10, sizeShare: 20}, document.createElement("div"));
		var menu = new dijit.Menu({});
		menu.domNode.style.width="100%";
			var item = new dijit.MenuItem({label: "Home",
						       iconClass: "icon-22-actions-go-home",
						       onClick: dojo.hitch(this, this.pages.home)});
			menu.addChild(item);
			var item = new dijit.MenuItem({label: "Users",
						       iconClass: "icon-16-apps-system-users",
						       onClick: dojo.hitch(this, this.pages.users)});
			menu.addChild(item);
			var item = new dijit.MenuItem({label: "Apps",
						       iconClass: "icon-16-categories-applications-other",
						       onClick: dojo.hitch(this, this.pages.apps)});
			menu.addChild(item);
			var item = new dijit.MenuItem({label: "Groups",
						       iconClass: "icon-16-apps-system-users",
						       onClick: dojo.hitch(this, this.pages.groups)});
			menu.addChild(item);
		pane.setContent(menu.domNode);
	split.addChild(pane);
	var layout = new dijit.layout.LayoutContainer({sizeMin: 60, sizeShare: 60}, document.createElement("div"));
	this.main = new dijit.layout.ContentPane({layoutAlign: "client"}, document.createElement("div"));
	layout.addChild(this.main);
	this.toolbar = new dijit.Toolbar({layoutAlign: "top"});
	layout.addChild(this.toolbar);
	split.addChild(layout);
	this.win.addChild(split);
	this.win.show();
	this.win.startup();
	this.win.onClose = dojo.hitch(this, this.kill);
	setTimeout(dojo.hitch(this, this.pages.home), 100);
}

this.userPermDialog = function() {
	var row = this._userGrid.model.getRow(this.__rowIndex).__dojo_data_item;
	this.__rowIndex = null;
	var perms = dojo.fromJson(this._userStore.getValue(row, "permissions"));
	var win = new api.window({
		title: "Permissions for "+this._userStore.getValue(row, "username")
	});
	var main = new dijit.layout.ContentPane({layoutAlign: "client"});
	var tab = document.createElement("table");
	dojo.style(tab, "width", "100%");
	dojo.style(tab, "height", "100%");
	dojo.style(tab, "overflow-y", "auto");
	tab.innerHTML = "<thead><tr><td>Name</td><td>Description</td><td>Allow</td><td>Deny</td><td>Default</td></tr></thead>";
	var body = document.createElement("tbody");
	tab.appendChild(body);
	desktop.admin.permissions.list(function(list) {
		dojo.forEach(list, function(item) {
			var tr = document.createElement("tr");
			console.log(item);
			body.appendChild(tr);
		});
		main.setContent(tab);
		win.addChild(main);
		win.show();
	});
}

this.pages = {
	home: function() {
		this.toolbar.destroyDescendants();
		desktop.admin.users.online(dojo.hitch(this, function(data) {
			var h = "Users online: <div dojoType='dijit.ProgressBar' progress='"+data.online+"' maximum='"+data.total+"'></div>";
			desktop.admin.diskspace(dojo.hitch(this, function(data) {
				h += "Disk Usage: <div dojoType='dijit.ProgressBar' progress='"+(data.total-data.free)+"' maximum='"+data.total+"'></div>"
				this.main.setContent(h);
			}));
		}));
	},
	users: function() {
		this.toolbar.destroyDescendants();
		this.main.setContent("loading...");
		desktop.admin.users.list(dojo.hitch(this, function(data) {
			for(i=0;i<data.length;i++) {
				data[i].permissions = dojo.toJson(data[i].permissions);
				data[i].groups = dojo.toJson(data[i].groups);
			};
			var layout = [{
				cells: [[]]
			}];
			//make headers
			for(field in data[0]) {
				if(field == "permissions" || field == "groups") continue;
				var name = field.charAt(0).toUpperCase() + field.substr(1).toLowerCase();
				var editor;
				var options;
				if(field == "name" || field == "username") editor = dojox.grid.editors.TextBox
				if(field == "level") {
					editor = dojox.grid.editors.Select;
					options = ["admin", "developer", "user"];
				}
				layout[0].cells[0].push({name: name, field: field, editor: editor, options: options});
			}
			
			this._userStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "id",
					items: data
				}
			});
			var grid = this._userGrid = new dojox.Grid({
				structure: layout,
				model: new dojox.grid.data.DojoData(null, null, {store: this._userStore, query: {id: "*"}})
			});
			dojo.connect(this._userStore, "onDelete", this, function(a) {
				desktop.admin.users.remove(a.id[0]); //that feels really hackish
			})
			dojo.connect(this._userStore, "onSet", this, function(item, attribute, oldVal, newVal) {
				var id = this._userStore.getValue(item, "id");
				if(id == false) return;
				var args = {id: id};
				args[attribute] = newVal;
				desktop.user.set(args);
			})
			this.main.setContent(this._userGrid.domNode);
			this._userGrid.render();
			var menu = this._userMenu = new dijit.Menu({});
			dojo.forEach([
				{
					label: "Delete",
					onClick: dojo.hitch(this, function(e) {
						var row = this._userGrid.model.getRow(this.__rowIndex);
						api.ui.yesnoDialog({
							title: "User deletion confirmation",
							message: "Are you sure you want to permanently delete "+row.username+" from the system?",
							callback: dojo.hitch(this, function(a) {
								if(a == false) return;
								this._userStore.deleteItem(row.__dojo_data_item);
							})
						})
					})
				},
				{
					label: "Alter permissions",
					onClick: dojo.hitch(this, "userPermDialog")
				}
			], function(item) {
				var menuItem = new dijit.MenuItem(item);
				menu.addChild(menuItem);
			});
			this._userGrid.onRowContextMenu = dojo.hitch(this, function(e) {
				this.__rowIndex = e.rowIndex;
				this._userMenu._contextMouse();
				this._userMenu._openMyself(e);
			});
			document.body.appendChild(menu.domNode);
			this.win.startup();
		}));
	},
	apps: function() {
		this.toolbar.destroyDescendants();
		this.main.setContent("Here you will be able to manage apps");
	},
	groups: function() {
		this.toolbar.destroyDescendants();
		this.main.setContent("Here you will be able to manage the user groups");
	}
}