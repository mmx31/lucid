this.kill = function() {
	if(!this.win.closed) { this.win.close(); }
	if(this._userMenu) { this._userMenu.destroy(); }
	dojo.forEach(this.windows, function(win) {
		if(!win.closed) win.close();
	})
}
this.windows = [];
this.init = function(args)
{
	dojo.require("dijit.layout.SplitContainer");
	dojo.require("dijit.layout.LayoutContainer");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("dijit.ProgressBar");
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.form.CheckBox");
	dojo.require("dijit.form.TextBox");
	dojo.require("dojox.grid.Grid");
	dojo.require("dojo.data.ItemFileWriteStore");
	dojo.require("dijit.Menu");
	dojo.require("dijit.Dialog");
	dojo.require("dojox.widget.FileInputAuto");
	api.addDojoCss("dojox/grid/_grid/Grid.css");
	api.addDojoCss("dojox/widget/FileInput/FileInput.css");
	//make window
	this.win = new api.window({title: "Administration Panel", width: "500px", height: "400px", onClose: dojo.hitch(this, "kill")});
	var split = new dijit.layout.SplitContainer({sizerWidth: 7, orientation: "horizontal", layoutAlign: "client"});
	var pane = new dijit.layout.ContentPane({sizeMin: 10, sizeShare: 20}, document.createElement("div"));
		var menu = new dijit.Menu({});
		menu.domNode.style.width="100%";
			var item = new dijit.MenuItem({label: "Home",
						       iconClass: "icon-22-actions-go-home",
						       onClick: dojo.hitch(this, this.pages.home)});
			menu.addChild(item);
			var item = new dijit.MenuItem({label: "Apps",
						       iconClass: "icon-16-categories-applications-other",
						       onClick: dojo.hitch(this, this.pages.apps)});
			menu.addChild(item);
			var item = new dijit.MenuItem({label: "Users",
						       iconClass: "icon-16-apps-system-users",
						       onClick: dojo.hitch(this, this.pages.users)});
			menu.addChild(item);
			var item = new dijit.MenuItem({label: "Groups",
						       iconClass: "icon-16-apps-system-users",
						       onClick: dojo.hitch(this, this.pages.groups)});
			menu.addChild(item);
			var item = new dijit.MenuItem({label: "Permissions",
						       iconClass: "icon-16-apps-system-users",
						       onClick: dojo.hitch(this, this.pages.permissions)});
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
				var args = {
					name: field.charAt(0).toUpperCase() + field.substr(1).toLowerCase(),
					field: field
				};
				if(field == "name" || field == "username") args.editor = dojox.grid.editors.TextBox;
				if(field == "level") {
					args.editor = dojox.grid.editors.Select;
					args.options = ["admin", "developer", "user"];
				}
				layout[0].cells[0].push(args);
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
					onClick: dojo.hitch(this, "permDialog",
						dojo.hitch(this, function(row){
							this._userStore.getValue(row, "username");
						}),
						dojo.hitch(this, function(row){
							return dojo.fromJson(this._userStore.getValue(row, "permissions"));
						}),
						dojo.hitch(this, function(row, newPerms) {
							this._userStore.setValue(row, "permissions", dojo.toJson(newPerms));
							desktop.user.set({
								id: this._userStore.getValue(row, "id"),
								permissions: newPerms
							})
						})
					)
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
		var button = new dijit.form.Button({
			label: "Install app package",
			onClick: dojo.hitch(this, "installPackage")
		});
		this.toolbar.addChild(button);
		
		desktop.app.list(dojo.hitch(this, function(data) {
			for(i=0;i<data.length;i++) {
				data[i].filetypes = data[i].filetypes.join(", ");
			};
			var layout = [{
				cells: [[]]
			}];
			//make headers
			for(field in data[0]) {
				var args = {
					name: field.charAt(0).toUpperCase() + field.substr(1).toLowerCase(),
					field: field
				};
				layout[0].cells[0].push(args);
			}
			
			this._appStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "id",
					items: data
				}
			});
			var grid = this._appGrid = new dojox.Grid({
				structure: layout,
				model: new dojox.grid.data.DojoData(null, null, {store: this._appStore, query: {id: "*"}})
			});
			dojo.connect(this._appStore, "onDelete", this, function(a) {
				api.ide.remove(a.id[0]); //that feels really hackish
			})
			this.main.setContent(this._appGrid.domNode);
			this._appGrid.render();
			var menu = this._appMenu = new dijit.Menu({});
			dojo.forEach([
				{
					label: "Delete",
					onClick: dojo.hitch(this, function(e) {
						var row = this._appGrid.model.getRow(this.__rowIndex);
						api.ui.yesnoDialog({
							title: "App deletion confirmation",
							message: "Are you sure you want to permanently delete "+row.name+" from the system?",
							callback: dojo.hitch(this, function(a) {
								if(a == false) return;
								this._appStore.deleteItem(row.__dojo_data_item);
							})
						})
					})
				}
			], function(item) {
				var menuItem = new dijit.MenuItem(item);
				menu.addChild(menuItem);
			});
			this._appGrid.onRowContextMenu = dojo.hitch(this, function(e) {
				this.__rowIndex = e.rowIndex;
				this._appMenu._contextMouse();
				this._appMenu._openMyself(e);
			});
			document.body.appendChild(menu.domNode);
			this.win.startup();
		}));
	},
	groups: function() {
		this.toolbar.destroyDescendants();
		var button = new dijit.form.DropDownButton({
			label: "Create new group",
			dropDown: this.createGroupDialog()
		});
		this.toolbar.addChild(button);
		this.main.setContent("loading...");
		desktop.admin.groups.list(dojo.hitch(this, function(data) {
			for(i=0;i<data.length;i++) {
				data[i].permissions = dojo.toJson(data[i].permissions);
			};
			//make headers (need to do it manually unfortunatly)
			var layout = [{
				cells: [[
					{name: "Name", field: "name", editor: dojox.grid.editors.TextBox},
					{name: "Description", field: "description", editor: dojox.grid.editors.TextBox}
				]]
			}];
			this._groupStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "id",
					items: data
				}
			});
			var grid = this._groupGrid = new dojox.Grid({
				structure: layout,
				model: new dojox.grid.data.DojoData(null, null, {store: this._groupStore, query: {id: "*"}})
			});
			dojo.connect(this._groupStore, "onDelete", this, function(a) {
				desktop.admin.groups.remove(a.id[0]); //that feels really hackish
			})
			dojo.connect(this._groupStore, "onSet", this, function(item, attribute, oldVal, newVal) {
				var id = this._groupStore.getValue(item, "id");
				if(id == false) return;
				var args = {id: id};
				args[attribute] = newVal;
				desktop.admin.groups.set(args);
			})
			this.main.setContent(this._groupGrid.domNode);
			this._groupGrid.render();
			var menu = this._groupMenu = new dijit.Menu({});
			dojo.forEach([
				{
					label: "Delete",
					onClick: dojo.hitch(this, function(e) {
						var row = this._groupGrid.model.getRow(this.__rowIndex);
						api.ui.yesnoDialog({
							title: "Group deletion confirmation",
							message: "Are you sure you want to permanently delete "+row.name+" from the system?",
							callback: dojo.hitch(this, function(a) {
								if(a == false) return;
								this._groupStore.deleteItem(row.__dojo_data_item);
							})
						})
					})
				},
				{
					label: "Alter permissions",
					onClick: dojo.hitch(this, "permDialog",
						dojo.hitch(this, function(row) {
							return this._groupStore.getValue(row, "name");
						}),
						dojo.hitch(this, function(row) {
							return dojo.fromJson(this._groupStore.getValue(row, "permissions"));
						}),
						dojo.hitch(this, function(row, newPerms){
							this._groupStore.setValue(row, "permissions", dojo.toJson(newPerms));
							desktop.admin.groups.set({
								id: this._groupStore.getValue(row, "id"),
								permissions: newPerms
							})
						})
					)
				}
				//TODO: add an item for managing group members
			], function(item) {
				var menuItem = new dijit.MenuItem(item);
				menu.addChild(menuItem);
			});
			this._groupGrid.onRowContextMenu = dojo.hitch(this, function(e) {
				this.__rowIndex = e.rowIndex;
				this._groupMenu._contextMouse();
				this._groupMenu._openMyself(e);
			});
			document.body.appendChild(menu.domNode);
			this.win.startup();
		}));
	},
	permissions: function() {
		this.toolbar.destroyDescendants();
		this.main.setContent("loading...");
		this.toolbar.destroyDescendants();
		
		desktop.admin.permissions.list(dojo.hitch(this, function(data) {
			var layout = [{
				cells: [[]]
			}];
			//make headers
			for(field in data[0]) {
				var args = {
					name: field.charAt(0).toUpperCase() + field.substr(1).toLowerCase(),
					field: field
				};
				if(field == "initial") {
					args.editor = dojox.grid.editors.Bool;
					args.name = "Allow by default";
				}
				layout[0].cells[0].push(args);
			}
			
			this._permStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "id",
					items: data
				}
			});
			dojo.connect(this._permStore, "onSet", this, function(item, attribute, oldVal, newVal) {
				var id = this._permStore.getValue(item, "id");
				if(id == false || attribute != "initial") return;
				desktop.admin.permissions.setDefault(id, newVal);
			})
			var grid = this._permGrid = new dojox.Grid({
				structure: layout,
				model: new dojox.grid.data.DojoData(null, null, {store: this._permStore, query: {id: "*"}})
			});
			this.main.setContent(this._permGrid.domNode);
			this._permGrid.render();
			this.win.startup();
		}));
	}
}

this.installPackage = function() {
	var win = new api.window({
		title: "Install app package",
		width: "300px",
		height: "200px"
	});
	this.windows.push(win);
	var main = new dijit.layout.ContentPane({layoutAlign: "client"});
	var div = document.createElement("div");
	dojo.addClass(div, "tundra");
	div.innerHTML = "Select an app package to install from your local hard disk:";
	var uploader = new dojox.widget.FileInputAuto({
		url: api.xhr("core.app.install.package"),
		onComplete: function(data,ioArgs,widgetRef) {
			if(data.status && data.status == "success"){
				widgetRef.overlay.innerHTML = "success!";
			}else{
				widgetRef.overlay.innerHTML = "Error: "+data.error;
				console.log('error',data,ioArgs);
			}
		}
	});
	div.appendChild(uploader.domNode);
	main.setContent(div);
	win.addChild(main);
	var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom"});
		var cont = document.createElement("div");
		var close = new dijit.form.Button({
			label: "Close",
			onClick: dojo.hitch(win, "close")
		})
		cont.appendChild(close.domNode);
		dojo.addClass(cont, "floatRight");
		bottom.setContent(cont);
		win.addChild(bottom);
	win.show();
	dojo.style(uploader.inputNode, "width", "163px");
	uploader.startup();
}

this.permDialog = function(lbl, permissions, callback) {
	var row = this._userGrid.model.getRow(this.__rowIndex).__dojo_data_item;
	var perms = permissions(row);
	this.__rowIndex = null;
	var win = new api.window({
		title: "Permissions for "+lbl(row)
	});
	this.windows.push(win);
	var main = new dijit.layout.ContentPane({layoutAlign: "client"});
	var tab = document.createElement("table");
	dojo.style(tab, "width", "100%");
	dojo.style(tab, "height", "100%");
	dojo.style(tab, "overflow-y", "auto");
	tab.innerHTML = "<tr><th>Name</td><th>Description</th><th>Allow</th><th>Deny</th><th>Default</th></tr>";
	var radioWidgets = {};
	desktop.admin.permissions.list(dojo.hitch(this, function(list) {
		dojo.forEach(list, function(item) {
			var tr = document.createElement("tr");
			
			var td = document.createElement("td");
			td.textContent = item.name;
			tr.appendChild(td);
			var td = document.createElement("td");
			td.textContent = item.description;
			tr.appendChild(td);
			
			var td = document.createElement("td");
			var allow = new dijit.form.RadioButton({
				name: item.name+this.instance+lbl(row)
			});
			allow.setChecked(perms[item.name] == true);
			td.appendChild(allow.domNode);
			tr.appendChild(td);
			var td = document.createElement("td");
			var deny = new dijit.form.RadioButton({
				name: item.name+this.instance+lbl(row),
			});
			deny.setChecked(perms[item.name] == false);
			td.appendChild(deny.domNode);
			tr.appendChild(td);
			var td = document.createElement("td");
			var def = new dijit.form.RadioButton({
				name: item.name+this.instance+lbl(row)
			});
			def.setChecked(typeof perms[item.name] == "undefined");
			td.appendChild(def.domNode);
			tr.appendChild(td);
			
			tab.appendChild(tr);
			radioWidgets[item.name] = {
				def: def,
				deny: deny,
				allow: allow
			};
		}, this);
		main.setContent(tab);
		win.addChild(main);
		var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom"});
		var cont = document.createElement("div");
		var cancel = new dijit.form.Button({
			label: "Cancel",
			onClick: dojo.hitch(win, "close")
		})
		cont.appendChild(cancel.domNode);
		var save = new dijit.form.Button({
			label: "Save",
			onClick: dojo.hitch(this, function() {
				var newPerms = {};
				dojo.forEach(list, function(item) {
					if(radioWidgets[item.name].def.checked == true) return;
					if(radioWidgets[item.name].deny.checked == true) newPerms[item.name] = false;
					if(radioWidgets[item.name].allow.checked == true) newPerms[item.name] = true;
				});
				callback(row, newPerms);
				win.close();
			})
		})
		cont.appendChild(save.domNode);
		dojo.addClass(cont, "floatRight");
		bottom.setContent(cont);
		win.addChild(bottom);
		win.show();
	}));
}

this.createGroupDialog = function() {
	var dialog = new dijit.TooltipDialog({
		title: "Create a new group"
	});
	
	var line = document.createElement("div");
    var p = document.createElement("span");
    p.innerHTML = "Name: ";
    line.appendChild(p);
	var name = new dijit.form.TextBox({});
	line.appendChild(name.domNode);
	dialog.containerNode.appendChild(line);
	
	var line = document.createElement("div");
    var p = document.createElement("span");
    p.innerHTML = "Description: ";
    line.appendChild(p);
	var description = new dijit.form.TextBox({});
	line.appendChild(description.domNode);
	dialog.containerNode.appendChild(line);
	
	var line = document.createElement("div");
    var p = document.createElement("span");
	var button = new dijit.form.Button({
		label: "Add",
		onClick: dojo.hitch(this, function() {
			var n = name.getValue();
			var d = description.getValue();
			desktop.admin.groups.add({
				name: n,
				description: d,
				callback: dojo.hitch(this, function(id) {
					name.setValue("");
					description.setValue("");
					this._groupStore.newItem({
						id: id,
						name: n,
						description: d
					})
				})
			})
		})
	});
	line.appendChild(button.domNode);
	dialog.containerNode.appendChild(line);
	
	return dialog;
}
