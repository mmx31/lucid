dojo.provide("desktop.apps.AdminPanel");
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

dojo.declare("desktop.apps.AdminPanel", desktop.apps._App, {
	kill: function() {
		if(!this.win.closed) { this.win.close(); }
		if(this._userMenu) { this._userMenu.destroy(); }
		dojo.forEach(this.windows, function(win) {
			if(!win.closed) win.close();
		})
	},
	windows: [],
	init: function(args) {
		var app = dojo.i18n.getLocalization("desktop", "apps");
		var sys = dojo.i18n.getLocalization("desktop", "system");
		//make window
		this.win = new api.Window({
			title: app["Administration Panel"],
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
		});
		var split = new dijit.layout.SplitContainer({sizerWidth: 7, orientation: "horizontal", layoutAlign: "client"});
		var pane = new dijit.layout.ContentPane({sizeMin: 10, sizeShare: 20}, document.createElement("div"));
			var menu = new dijit.Menu({});
			menu.domNode.style.width="100%";
				var item = new dijit.MenuItem({label: sys.home,
			       iconClass: "icon-16-actions-go-home",
			       onClick: dojo.hitch(this, this.home)});
				menu.addChild(item);
				var item = new dijit.MenuItem({label: sys.apps,
			       iconClass: "icon-16-categories-applications-other",
			       onClick: dojo.hitch(this, this.apps)});
				menu.addChild(item);
				var item = new dijit.MenuItem({label: sys.users,
			       iconClass: "icon-16-apps-system-users",
			       onClick: dojo.hitch(this, this.users)});
				menu.addChild(item);
				var item = new dijit.MenuItem({label: sys.groups,
			       iconClass: "icon-16-apps-system-users",
			       onClick: dojo.hitch(this, this.groups)});
				menu.addChild(item);
				var item = new dijit.MenuItem({label: sys.permissions,
			       iconClass: "icon-16-apps-system-users",
			       onClick: dojo.hitch(this, this.permissions)});
				menu.addChild(item);
				var item = new dijit.MenuItem({label: sys.themes,
			       iconClass: "icon-16-apps-preferences-desktop-theme",
			       onClick: dojo.hitch(this, this.themes)});
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
		setTimeout(dojo.hitch(this, this.home), 100);
	},
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
	}
});

//Add in the functions for each page
//This is done for maintainability reasons
dojo.require("desktop.apps.AdminPanel.apps");
dojo.require("desktop.apps.AdminPanel.groups");
dojo.require("desktop.apps.AdminPanel.permissions");
dojo.require("desktop.apps.AdminPanel.themes");
dojo.require("desktop.apps.AdminPanel.users");