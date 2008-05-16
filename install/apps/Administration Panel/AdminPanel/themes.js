dojo.provide("desktop.apps.AdminPanel.themes");

dojo.extend(desktop.apps.AdminPanel, {
	themes: function() {
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		var apps = dojo.i18n.getLocalization("desktop", "apps");
		var mnus = dojo.i18n.getLocalization("desktop.ui", "menus");
		this.toolbar.destroyDescendants();
		var button = new dijit.form.Button({
			label: sys.installThemePackage,
			onClick: dojo.hitch(this, "installThemePackage")
		});
		this.toolbar.addChild(button);
		
		desktop.theme.list(dojo.hitch(this, function(data) {
			for(var i=0;i<data.length;i++) {
				data[i].preview = "<img style='width: 150px; height: 130px;' src='./themes/"+data[i].sysname+"/"+data[i].preview+"' />";
			};
			var layout = [{
				cells: [[]]
			}];
			//make headers
			for(var field in data[0]) {
				if(field == "sysname"
				|| field == "wallpaper") continue;
				var args = {
					name: sys[field] || field,
					field: field
				};
				if(field == "preview") args.width = 10;
				layout[0].cells[0].push(args);
			}
			this._themeStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "sysname",
					items: data
				}
			});
			var grid = this._themeGrid = new dojox.Grid({
				structure: layout,
				model: new dojox.grid.data.DojoData(null, null, {store: this._themeStore, query: {sysname: "*"}})
			});
			dojo.connect(this._themeStore, "onDelete", this, function(a) {
				desktop.theme.remove(a.sysname[0]); //that feels really hackish
			})
			this.main.setContent(this._themeGrid.domNode);
			this._themeGrid.render();
			var menu = this._themeMenu = new dijit.Menu({});
			dojo.forEach([
				{
					label: cmn["delete"],
					onClick: dojo.hitch(this, function(e) {
						var row = this._themeGrid.model.getRow(this.__rowIndex);
						api.ui.yesnoDialog({
							title: sys.themeDelConfirm,
							message: sys.delFromSys.replace("%s", row.name),
							callback: dojo.hitch(this, function(a) {
								if(a == false) return;
								this._themeStore.deleteItem(row.__dojo_data_item);
							})
						})
					})
				}
			], function(item) {
				var menuItem = new dijit.MenuItem(item);
				menu.addChild(menuItem);
			});
			this._themeGrid.onRowContextMenu = dojo.hitch(this, function(e) {
				this.__rowIndex = e.rowIndex;
				this._themeMenu._contextMouse();
				this._themeMenu._openMyself(e);
			});
			document.body.appendChild(menu.domNode);
			this.win.startup();
		}));
	},
	installThemePackage: function() {
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		var win = new api.Window({
			title: sys.installThemePackage,
			width: "300px",
			height: "200px"
		});
		this.windows.push(win);
		var main = new dijit.layout.ContentPane({layoutAlign: "client"});
		var div = document.createElement("div");
		dojo.addClass(div, "tundra");
		div.innerHTML = sys.installThemeInstructions;
		var uploader = new dojox.widget.FileInputAuto({
			name: "uploadedfile",
			url: api.xhr("core.theme.package.install"),
			onComplete: dojo.hitch(this, function(data,ioArgs,widgetRef) {
				if(data.status && data.status == "success"){
					widgetRef.overlay.innerHTML = sys.themeInstallSuccess;
					this.themes.call(this, []);
				}else{
					widgetRef.overlay.innerHTML = cmn.error+": "+data.error;
					console.log('error',data,ioArgs);
				}
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
	}
})
