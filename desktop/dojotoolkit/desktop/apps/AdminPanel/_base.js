dojo.provide("desktop.apps.AdminPanel._base");

dojo.declare("desktop.apps.AdminPanel", desktop.apps._App, {
	kill: function(){
		if(!this.win.closed){ this.win.close(); }
		if(this._userMenu){ this._userMenu.destroy(); }
		dojo.forEach(this.windows, function(win){
			if(!win.closed) win.close();
		})
	},
	windows: [],
	init: function(args){
		var app = dojo.i18n.getLocalization("desktop", "apps");
		var sys = dojo.i18n.getLocalization("desktop", "system");
		//make window
		this.win = new desktop.widget.Window({
			title: app["Administration Panel"],
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill"),
			design: "sidebar"
		});
		var pane = new dijit.layout.ContentPane({
			minSize: 120,
			style: "width: 120px;",
			region: "left",
			splitter: true
		});
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
				var item = new dijit.MenuItem({label: sys.quota,
			       iconClass: "icon-16-devices-drive-harddisk",
			       onClick: dojo.hitch(this, this.quota)});
				menu.addChild(item);
				var item = new dijit.MenuItem({label: sys.themes,
			       iconClass: "icon-16-apps-preferences-desktop-theme",
			       onClick: dojo.hitch(this, this.themes)});
				menu.addChild(item);
			pane.setContent(menu.domNode);
		this.win.addChild(pane);
		this.main = new dijit.layout.ContentPane({region: "center"}, document.createElement("div"));
		this.win.addChild(this.main);
		this.toolbar = new dijit.Toolbar({region: "top"});
		this.win.addChild(this.toolbar);
		this.win.show();
		this.win.startup();
		this.win.onClose = dojo.hitch(this, this.kill);
		setTimeout(dojo.hitch(this, this.home), 100);
	},
	home: function(){
		var sys = dojo.i18n.getLocalization("desktop", "system");
		this.toolbar.destroyDescendants();
		desktop.admin.users.online(dojo.hitch(this, function(data){
			var h = sys.usersOnline+": <div dojoType='dijit.ProgressBar' progress='"+data.online+"' maximum='"+data.total+"'></div>";
			desktop.admin.diskspace(dojo.hitch(this, function(data){
				h += sys.diskUsage+": <div dojoType='dijit.ProgressBar' progress='"+(data.total-data.free)+"' maximum='"+data.total+"'></div>"
				this.main.setContent(h);
			}));
		}));
	},
	permDialog: function(grid, lbl, permissions, callback){
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		var permsNls = dojo.i18n.getLocalization("desktop", "permissions");
		var row = grid.getItem(this.__rowIndex);
		var perms = permissions(row);
		this.__rowIndex = null;
		var win = new desktop.widget.Window({
			title: sys.permsFor.replace("%s", lbl(row))
		});
		this.windows.push(win);
		var main = new dijit.layout.ContentPane({region: "center"});
		var tab = document.createElement("table");
		dojo.style(tab, "width", "100%");
		dojo.style(tab, "height", "100%");
		dojo.style(tab, "overflow-y", "auto");
		tab.innerHTML = "<tr><th>"+sys.name+"</td><th>"+sys.description+"</th><th>"+sys.allow+"</th><th>"+sys.deny+"</th><th>"+sys["default"]+"</th></tr>";
		var radioWidgets = {};
		desktop.admin.permissions.list(dojo.hitch(this, function(list){
			dojo.forEach(list, function(item){
				var tr = document.createElement("tr");
				
				var td = document.createElement("td");
				td.innerHTML = item.name;
				tr.appendChild(td);
				var td = document.createElement("td");
				td.innerHTML = permsNls[item.name] || item.description;
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
					name: item.name+this.instance+lbl(row)
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
			var bottom = new dijit.layout.ContentPane({region: "bottom"});
			var cont = document.createElement("div");
			var cancel = new dijit.form.Button({
				label: "Cancel",
				onClick: dojo.hitch(win, "close")
			})
			cont.appendChild(cancel.domNode);
			var save = new dijit.form.Button({
				label: cmn.save,
				onClick: dojo.hitch(this, function(){
					var newPerms = {};
					dojo.forEach(list, function(item){
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
