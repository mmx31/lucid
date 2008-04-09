({
	kill: function() {
		if(!this.win.closed) { this.win.close(); }
		if(this._userMenu) { this._userMenu.destroy(); }
		dojo.forEach(this.windows, function(win) {
			if(!win.closed) win.close();
		})
	},
	windows: [],
	init: function(args) {
		dojo.require("dijit.layout.SplitContainer");
		dojo.require("dijit.layout.LayoutContainer");
		dojo.require("dijit.layout.ContentPane");
		dojo.require("dijit.ProgressBar");
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.form.Button");
		dojo.require("dijit.form.CheckBox");
		dojo.require("dijit.form.TextBox");
		dojo.require("dijit.form.FilteringSelect");
		dojo.require("dojox.grid.Grid");
		dojo.require("dojo.data.ItemFileWriteStore");
		dojo.require("dijit.Menu");
		dojo.require("dijit.Dialog");
		dojo.require("dojox.widget.FileInputAuto");
		api.addDojoCss("dojox/grid/_grid/Grid.css");
		api.addDojoCss("dojox/widget/FileInput/FileInput.css");
		dojo.requireLocalization("desktop", "apps");
		dojo.requireLocalization("desktop", "system");
		dojo.requireLocalization("desktop", "common");
		dojo.requireLocalization("desktop", "permissions");
		dojo.requireLocalization("desktop.ui", "accountInfo");
		dojo.requireLocalization("desktop.ui", "menus");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		var sys = dojo.i18n.getLocalization("desktop", "system");
		//make window
		this.win = new api.Window({title: app["Administration Panel"], width: "500px", height: "400px", onClose: dojo.hitch(this, "kill")});
		var split = new dijit.layout.SplitContainer({sizerWidth: 7, orientation: "horizontal", layoutAlign: "client"});
		var pane = new dijit.layout.ContentPane({sizeMin: 10, sizeShare: 20}, document.createElement("div"));
			var menu = new dijit.Menu({});
			menu.domNode.style.width="100%";
				var item = new dijit.MenuItem({label: sys.home,
							       iconClass: "icon-16-actions-go-home",
							       onClick: dojo.hitch(this, this.pages.home)});
				menu.addChild(item);
				var item = new dijit.MenuItem({label: sys.apps,
							       iconClass: "icon-16-categories-applications-other",
							       onClick: dojo.hitch(this, this.pages.apps)});
				menu.addChild(item);
				var item = new dijit.MenuItem({label: sys.users,
							       iconClass: "icon-16-apps-system-users",
							       onClick: dojo.hitch(this, this.pages.users)});
				menu.addChild(item);
				var item = new dijit.MenuItem({label: sys.groups,
							       iconClass: "icon-16-apps-system-users",
							       onClick: dojo.hitch(this, this.pages.groups)});
				menu.addChild(item);
				var item = new dijit.MenuItem({label: sys.permissions,
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
	},
	pages: {
		home: function() {
			var sys = dojo.i18n.getLocalization("desktop", "system");
			this.toolbar.destroyDescendants();
			desktop.admin.users.online(dojo.hitch(this, function(data) {
				var h = sys.usersOnline+": <div dojoType='dijit.ProgressBar' progress='"+data.online+"' maximum='"+data.total+"'></div>";
				desktop.admin.diskspace(dojo.hitch(this, function(data) {
					h += sys.diskUsage+": <div dojoType='dijit.ProgressBar' progress='"+(data.total-data.free)+"' maximum='"+data.total+"'></div>"
					this.main.setContent(h);
				}));
			}));
		},
		users: function() {
			var sys = dojo.i18n.getLocalization("desktop", "system");
			var cmn = dojo.i18n.getLocalization("desktop", "common");
			var usr = dojo.i18n.getLocalization("desktop.ui", "accountInfo");
			this.toolbar.destroyDescendants();
			var button = new dijit.form.DropDownButton({
				label: sys.createNewUser,
				dropDown: this.newUserDialog()
			});
			this.toolbar.addChild(button);
			this.main.setContent(cmn.loading);
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
						name: sys[field] || usr[field],
						field: field
					};
					if(field == "name" || field == "username" || field == "email") args.editor = dojox.grid.editors.Input;
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
					if(attribute == "permissions") return;
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
						label: cmn["delete"],
						onClick: dojo.hitch(this, function(e) {
							var row = this._userGrid.model.getRow(this.__rowIndex);
							api.ui.yesnoDialog({
								title: sys.userDelConfirm,
								message: sys.delFromSys.replace("%s", row.username),
								callback: dojo.hitch(this, function(a) {
									if(a == false) return;
									this._userStore.deleteItem(row.__dojo_data_item);
								})
							})
						})
					},
					{
						label: usr.changePassword,
						onClick: dojo.hitch(this, function(e) {
							var row = this._userGrid.model.getRow(this.__rowIndex);
							var win = new api.Window({
								title: sys.chUsersPassword.replace("%s", row.username),
								width: "250px",
								height: "200px"
							});
							this.windows.push(win);
							
							var client = new dijit.layout.ContentPane({
								layoutAlign: "client"
							});
							var div = document.createElement("div");
							var errBox = document.createElement("div");
							div.appendChild(errBox);
							var input1, input2;
							dojo.forEach([
								{
									label: usr.newPassword,
									widget: input1 = new dijit.form.TextBox({
										type: "password"
									})
								},
								{
									label: usr.confirmNewPassword,
									widget: input2 = new dijit.form.TextBox({
										type: "password"
									})
								}
							], function(item) {
								var row = document.createElement("div");
								var label = document.createElement("span");
								label.textContent = item.label+": ";
								row.appendChild(label);
								row.appendChild(item.widget.domNode);
								div.appendChild(row);
							})
							
							client.setContent(div);
							win.addChild(client);
							
							var bottom = new dijit.layout.ContentPane({
								layoutAlign: "bottom"
							});
							var div = document.createElement("div");
							dojo.addClass(div, "floatRight");
							var button = new dijit.form.Button({
								label: cmn.ok,
								onClick: dojo.hitch(this, function() {
									if(input1.getValue() != input2.getValue()) return errBox.textContent = usr.passwordsDontMatch;
									this._userStore.setValue(row.__dojo_data_item, "password", input1.getValue());
									win.close();
								})
							})
							div.appendChild(button.domNode);
							var cancel = new dijit.form.Button({label: cmn.cancel, onClick: dojo.hitch(win, "close")});
							div.appendChild(cancel.domNode);
							bottom.setContent(div);
							win.addChild(bottom);
							win.show();
							win.startup();
						})
					},
					{
						label: sys.alterPermissions,
						onClick: dojo.hitch(this, "permDialog",
							grid,
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
			var sys = dojo.i18n.getLocalization("desktop", "system");
			var cmn = dojo.i18n.getLocalization("desktop", "common");
			var apps = dojo.i18n.getLocalization("desktop", "apps");
			var mnus = dojo.i18n.getLocalization("desktop.ui", "menus");
			this.toolbar.destroyDescendants();
			var button = new dijit.form.Button({
				label: sys.installAppPackage,
				onClick: dojo.hitch(this, "installPackage")
			});
			this.toolbar.addChild(button);
			
			desktop.app.list(dojo.hitch(this, function(data) {
				for(i=0;i<data.length;i++) {
					data[i].filetypes = data[i].filetypes.join(", ");
					data[i].name = apps[data[i].name] || data[i].name;
					data[i].category = mnus[data[i].category.toLowerCase()];
				};
				var layout = [{
					cells: [[]]
				}];
				//make headers
				for(field in data[0]) {
					var args = {
						name: sys[field],
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
						label: cmn["delete"],
						onClick: dojo.hitch(this, function(e) {
							var row = this._appGrid.model.getRow(this.__rowIndex);
							api.ui.yesnoDialog({
								title: sys.appDelConfirm,
								message: sys.delFromSys.replace("%s", row.name),
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
			var sys = dojo.i18n.getLocalization("desktop", "system");
			var cmn = dojo.i18n.getLocalization("desktop", "common");
			this.toolbar.destroyDescendants();
			var button = new dijit.form.DropDownButton({
				label: sys.createNewGroup,
				dropDown: this.createGroupDialog()
			});
			this.toolbar.addChild(button);
			this.main.setContent(cmn.loading);
			desktop.admin.groups.list(dojo.hitch(this, function(data) {
				for(i=0;i<data.length;i++) {
					data[i].permissions = dojo.toJson(data[i].permissions);
				};
				//make headers (need to do it manually unfortunatly)
				var layout = [{
					cells: [[
						{name: sys.name, field: "name", editor: dojox.grid.editors.Input},
						{name: sys.description, field: "description", editor: dojox.grid.editors.Input}
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
					if(attribute == "permissions") return;
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
						label: cmn["delete"],
						onClick: dojo.hitch(this, function(e) {
							var row = this._groupGrid.model.getRow(this.__rowIndex);
							api.ui.yesnoDialog({
								title: sys.groupDelConfirm,
								message: sys.delFromSys.replace("%s", row.name),
								callback: dojo.hitch(this, function(a) {
									if(a == false) return;
									this._groupStore.deleteItem(row.__dojo_data_item);
								})
							})
						})
					},
					{
						label: sys.alterPermissions,
						onClick: dojo.hitch(this, "permDialog",
							grid,
							dojo.hitch(this, function(row) {
								return this._groupStore.getValue(row, "name");
							}),
							dojo.hitch(this, function(row) {
								return dojo.fromJson(this._groupStore.getValue(row, "permissions"));
							}),
							dojo.hitch(this, function(row, newPerms){
								console.log(newPerms);
								this._groupStore.setValue(row, "permissions", dojo.toJson(newPerms));
								desktop.admin.groups.set({
									id: this._groupStore.getValue(row, "id"),
									permissions: newPerms
								})
							})
						)
					},
					{
						label: sys.manageGroupMembers,
						onClick: dojo.hitch(this, "groupMemberDialog")
					}
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
			var sys = dojo.i18n.getLocalization("desktop", "system");
			var cmn = dojo.i18n.getLocalization("desktop", "common");
			var permNls = dojo.i18n.getLocalization("desktop", "permissions");
			this.main.setContent(cmn.loading);
			
			desktop.admin.permissions.list(dojo.hitch(this, function(data) {
				var layout = [{
					cells: [[]]
				}];
				for(key in data) {
					var item = data[key];
					item.description = permNls[item.name] || item.description;
				}
				//make headers
				for(field in data[0]) {
					var args = {
						name: sys[field],
						field: field
					};
					if(field == "initial") {
						args.editor = dojox.grid.editors.Bool;
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
	},
	makeUserStore: function(callback) {
		desktop.admin.users.list(dojo.hitch(this, function(data) {
			for(i=0;i<data.length;i++) {
				data[i].permissions = dojo.toJson(data[i].permissions);
				data[i].groups = dojo.toJson(data[i].groups);
			};
			this._userStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "id",
					items: data
				}
			});
			callback();
		}));
	},
	newUserDialog: function() {
		var usr = dojo.i18n.getLocalization("desktop.ui", "accountInfo");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		var dialog = new dijit.TooltipDialog({});
		var error = document.createElement("div");
		dialog.containerNode.appendChild(error);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = usr.name+": ";
	    line.appendChild(p);
		var name = new dijit.form.TextBox();
	    line.appendChild(name.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = usr.username+": ";
	    line.appendChild(p);
		var username = new dijit.form.TextBox();
	    line.appendChild(username.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = usr.email+": ";
	    line.appendChild(p);
		var email = new dijit.form.TextBox();
	    line.appendChild(email.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = usr.password+": ";
	    line.appendChild(p);
		var password = new dijit.form.TextBox({type: "password"});
	    line.appendChild(password.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = usr.confirmPassword+": ";
	    line.appendChild(p);
		var confpassword = new dijit.form.TextBox({type: "password"});
	    line.appendChild(confpassword.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var button = new dijit.form.Button({
			label: cmn.create,
			onClick: dojo.hitch(this, function() {
				dojo.require("dojox.validate.web");
				if(username.getValue() == "") return error.textContent = usr.enterUsername;
				if(!dojox.validate.isEmailAddress(email.getValue())) return error.textContent = usr.enterValidEmail;
				if(password.getValue() == "") return error.textContent = usr.enterPassword;
				if(password.getValue() != confpassword.getValue()) return error.textContent = usr.passwordsDontMatch;
				error.textContent = "";
				desktop.admin.users.create({
					name: name.getValue(),
					username: username.getValue(),
					email: email.getValue(),
					password: password.getValue(),
					callback: dojo.hitch(this, function(id) {
						if(id == false) return error.textContent = usr.usernameAllreadyTaken;
						error.textContent = usr.userCreated;
						this._userStore.newItem({
							name: name.getValue(),
							username: username.getValue(),
							groups: "[]",
							permissions: "[]",
							email: email.getValue(),
							id: id
						});
					})
				});
			})
		});
	    line.appendChild(button.domNode);
		dialog.containerNode.appendChild(line);
		dialog.startup();
		return dialog;
	},
	installPackage: function() {
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		var win = new api.Window({
			title: sys.installAppPackage,
			width: "300px",
			height: "200px"
		});
		this.windows.push(win);
		var main = new dijit.layout.ContentPane({layoutAlign: "client"});
		var div = document.createElement("div");
		dojo.addClass(div, "tundra");
		div.innerHTML = sys.installAppInstructions;
		var uploader = new dojox.widget.FileInputAuto({
			name: "uploadedfile",
			url: api.xhr("core.app.install.package"),
			onComplete: dojo.hitch(this, function(data,ioArgs,widgetRef) {
				if(data.status && data.status == "success"){
					widgetRef.overlay.innerHTML = sys.appInstallSuccess;
					this.pages.apps();
				}else{
					widgetRef.overlay.innerHTML = cmn.error+": "+data.error;
					console.log('error',data,ioArgs);
				}
				dojo.publish("updateMenu", []);
			})
		});
		div.appendChild(uploader.domNode);
		main.setContent(div);
		win.addChild(main);
		var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom"});
			var cont = document.createElement("div");
			var close = new dijit.form.Button({
				label: cmn.close,
				onClick: dojo.hitch(win, "close")
			})
			cont.appendChild(close.domNode);
			dojo.addClass(cont, "floatRight");
			bottom.setContent(cont);
			win.addChild(bottom);
		win.show();
		dojo.style(uploader.inputNode, "width", "163px");
		uploader.startup();
	},
	permDialog: function(grid, lbl, permissions, callback) {
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		var perms = dojo.i18n.getLocalization("desktop", "permissions");
		var row = grid.model.getRow(this.__rowIndex).__dojo_data_item;
		var perms = permissions(row);
		this.__rowIndex = null;
		var win = new api.Window({
			title: sys.permsFor.replace("%s", lbl(row))
		});
		this.windows.push(win);
		var main = new dijit.layout.ContentPane({layoutAlign: "client"});
		var tab = document.createElement("table");
		dojo.style(tab, "width", "100%");
		dojo.style(tab, "height", "100%");
		dojo.style(tab, "overflow-y", "auto");
		tab.innerHTML = "<tr><th>"+sys.name+"</td><th>"+sys.description+"</th><th>"+sys.allow+"</th><th>"+sys.deny+"</th><th>"+sys["default"]+"</th></tr>";
		var radioWidgets = {};
		desktop.admin.permissions.list(dojo.hitch(this, function(list) {
			dojo.forEach(list, function(item) {
				var tr = document.createElement("tr");
				
				var td = document.createElement("td");
				td.textContent = item.name;
				tr.appendChild(td);
				var td = document.createElement("td");
				td.textContent = perms[item.name] || item.description;
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
				label: cmn.save,
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
	},
	createGroupDialog: function() {
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		
		var dialog = new dijit.TooltipDialog({});
		var errBox = document.createElement("div");
		dialog.containerNode.appendChild(errBox);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = sys.name+": ";
	    line.appendChild(p);
		var name = new dijit.form.TextBox({});
		line.appendChild(name.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = sys.description+": ";
	    line.appendChild(p);
		var description = new dijit.form.TextBox({});
		line.appendChild(description.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
		var button = new dijit.form.Button({
			label: cmn.create,
			onClick: dojo.hitch(this, function() {
				var n = name.getValue();
				var d = description.getValue();
				this._groupStore.fetch({
					query: {name: n},
					onComplete: dojo.hitch(this, function(list) {
						if(list.length != 0){
							errBox.textContent = sys.groupAlreadyExists;
							return;
						}
						errBox.textContent = "";
						desktop.admin.groups.add({
							name: n,
							description: d,
							callback: dojo.hitch(this, function(id) {
								name.setValue("");
								description.setValue("");
								this._groupStore.newItem({
									id: id,
									name: n,
									description: d,
									permissions: "[]"
								})
							})
						})
					})
				})
			})
		});
		line.appendChild(button.domNode);
		dialog.containerNode.appendChild(line);
		
		return dialog;
	},
	
	groupMemberDialog: function(group) {
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		var row = this._groupGrid.model.getRow(this.__rowIndex).__dojo_data_item;
		var window = new api.Window({
			title: sys.manageGroupMembers.replace("%s", this._groupStore.getValue(row, "name")),
			width: "400px",
			height: "200px"
		})
		this.windows.push(window);
		var makeUI = function(list) {
			var client = new dijit.layout.ContentPane({
				layoutAlign: "client",
				style: "overflow-x: auto"
			})
			var div = document.createElement("div");
			var idList = [];
			var makeItem = dojo.hitch(this, function(item){
				idList.push(item.id);
				var drow = document.createElement("div");
				dojo.style(drow, "position", "relative");
				drow.innerHTML = "<span>"+item.username+"</span>";
				var right = document.createElement("span");
				dojo.style(right, "position", "absolute");
				dojo.style(right, "right", "0px");
				dojo.style(right, "top", "0px");
				dojo.addClass(right, "icon-16-actions-list-remove");
				drow.appendChild(right);
				dojo.connect(right, "onclick", this, function() {
					desktop.admin.groups.removeMember(
						this._groupStore.getValue(row, "id"),
						item.id
					);
					div.removeChild(drow);
					dojo.forEach(idList, function(id, i) {
						if(id == item.id) idList.splice(i, 1);
					})
				})
				div.appendChild(drow);
			})
			
			dojo.forEach(list, makeItem, this)
			
			client.setContent(div);
			window.addChild(client);
			
			var top = new dijit.layout.ContentPane({
				layoutAlign: "top"
			});
			var tdiv = document.createElement("div");
			var s = new dijit.form.FilteringSelect({
				store: this._userStore,
				autoComplete: true,
				labelAttr: "username",
				searchAttr: "username"
			});
			var b = new dijit.form.Button({
				label: cmn.add,
				onClick: dojo.hitch(this, function() {
					desktop.admin.groups.addMember(
						this._groupStore.getValue(row, "id"),
						s.getValue()
					);
					var hasItem = false;
					dojo.forEach(idList, function(id) {
						if(id == s.getValue()) hasItem = true;
					});
					if(!hasItem) this._userStore.fetch({
						query: {id: s.getValue()},
						onItem: makeItem
					})
					s.setDisplayedValue("");
					s.reset();
				})
			})
			tdiv.appendChild(s.domNode);
			tdiv.appendChild(b.domNode);
			top.setContent(tdiv);
			window.addChild(top);
			window.show();
			window.startup();
		}
		desktop.admin.groups.getMembers(this._groupStore.getValue(row, "id"), dojo.hitch(this, function(list){
			if(typeof this._userStore == "undefined") {
				this.makeUserStore(dojo.hitch(this, makeUI, list));
			}
			else dojo.hitch(this, makeUI, list)();
		}));
	}
})