this.kill = function() {
	if(!this.win.hidden) { this.win.hide(); }
	if(this._userMenu) { this._userMenu.destroy(); }
	api.instances.setKilled(this.instance);
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
	dojo.require("dijit.Menu");
	api.addDojoCss("dojox/grid/_grid/Grid.css");
	//make window
	this.win = new api.window({title: "Administration Panel", width: "500px", height: "400px", onHide: dojo.hitch(this, this.kill)});
	this.win.setBodyWidget("SplitContainer", {sizerWidth: 7, orientation: "horizontal"});
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
			var item = new dijit.MenuItem({label: "Registry",
						       iconClass: "icon-16-mimetypes-x-office-spreadsheet",
						       onClick: dojo.hitch(this, this.pages.registry)});
			menu.addChild(item);
			var item = new dijit.MenuItem({label: "Crosstalk",
						       iconClass: "icon-16-devices-network-wired",
						       onClick: dojo.hitch(this, this.pages.crosstalk)});
			menu.addChild(item);
			var item = new dijit.MenuItem({label: "Filesystem",
						       iconClass: "icon-16-devices-drive-harddisk",
						       onClick: dojo.hitch(this, this.pages.filesystem)});
			menu.addChild(item);
		pane.setContent(menu.domNode);
	this.win.addChild(pane);
	var layout = new dijit.layout.LayoutContainer({sizeMin: 60, sizeShare: 60}, document.createElement("div"));
	this.main = new dijit.layout.ContentPane({layoutAlign: "client"}, document.createElement("div"));
	layout.addChild(this.main);
	this.toolbar = new dijit.Toolbar({layoutAlign: "top"});
	layout.addChild(this.toolbar);
	this.win.addChild(layout);
	this.win.show();
	this.win.startup();
	api.instances.setActive(this.instance);
	this.win.onHide = dojo.hitch(this, this.kill);
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
			var layout = [{
				cells: [[]]
			}];
			//make headers
			var i = 0;
			for(field in data[0]) {
				if(field != "password") layout[0].cells[0][layout[0].cells[0].length] = {name: field, field: i};
				i++;
			} console.log(layout);
			//make values
			var griddata = [];
			dojo.forEach(data, function(item) {
				var myitem = [];
				var i = 0;
				for(field in item) {
					if(field != "password") myitem[i] = item[field];
					i++;
				}
				griddata[griddata.length] = myitem;
			});
			console.log(griddata);
			this._userGrid = new dojox.Grid({
				structure: layout,
				model: new dojox.grid.data.Table(null, griddata)
			});
			this.main.setContent(this._userGrid.domNode);
			this._userGrid.render();
			var menu = this._userMenu = new dijit.Menu({});
			dojo.forEach([
				{
					label: "Delete"
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
		this.main.setContent("This is the apps page");
	},
	registry: function() {
		this.toolbar.destroyDescendants();
		this.main.setContent("This is the registry page");
	},
	crosstalk: function() {
		this.toolbar.destroyDescendants();
		this.main.setContent("This is the crosstalk page");
	},
	filesystem: function() {
		this.toolbar.destroyDescendants();
		this.main.setContent("This is the filesystem page");
	}
}