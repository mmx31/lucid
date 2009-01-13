dojo.provide("desktop.apps.AdminPanel.themes");

dojo.extend(desktop.apps.AdminPanel, {
	themes: function(){
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
		
		desktop.theme.list(dojo.hitch(this, function(data){
			for(var i=0;i<data.length;i++){
				var src = dojo.moduleUrl("desktop.resources.themes."+data[i].sysname, data[i].preview);
				data[i].preview = "<img style='width: 150px; height: 130px;' src='"+src+"' />";
			};
			var layout = [{
				cells: [[]]
			}];
			//make headers
			for(var field in data[0]){
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
			var grid = this._themeGrid = new dojox.grid.DataGrid({
				structure: layout,
                store: this._themeStore,
                query: {sysname: "*"}
			});
			if(this._con) dojo.disconnect(this._con);
			this._con = dojo.connect(this.main, "resize", grid, "resize");
			dojo.connect(this._themeStore, "onDelete", this, function(a){
				desktop.theme.remove(a.sysname[0]); //that feels really hackish
			})
			this.main.setContent(this._themeGrid.domNode);
			this._themeGrid.render();
			var menu = this._themeMenu = new dijit.Menu({});
			dojo.forEach([
				{
					label: cmn["delete"],
					onClick: dojo.hitch(this, function(e){
						var row = this._themeGrid.getItem(this.__rowIndex);
						desktop.dialog.yesno({
							title: sys.themeDelConfirm,
							message: sys.delFromSys.replace("%s", row.name),
							onComplete: dojo.hitch(this, function(a){
								if(a == false) return;
								this._themeStore.deleteItem(row);
							})
						})
					})
				}
			], function(item){
				var menuItem = new dijit.MenuItem(item);
				menu.addChild(menuItem);
			});
			this._themeGrid.onRowContextMenu = dojo.hitch(this, function(e){
				this.__rowIndex = e.rowIndex;
				this._themeMenu._contextMouse();
				this._themeMenu._openMyself(e);
			});
			document.body.appendChild(menu.domNode);
			this.win.layout();
		}));
	},
	installThemePackage: function(){
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		var win = new desktop.widget.Window({
			title: sys.installThemePackage,
			width: "300px",
			height: "200px"
		});
		this.windows.push(win);
		var main = new dijit.layout.ContentPane({region: "center"});
		var div = document.createElement("div");
		dojo.addClass(div, "tundra");
		div.innerHTML = sys.installThemeInstructions;
		var uploader = new dojox.widget.FileInputAuto({
			name: "uploadedfile",
			url: desktop.xhr("core.theme.package.install"),
			onComplete: dojo.hitch(this, function(data,ioArgs,widgetRef){
				if(data.status && data.status == "success"){
					widgetRef.overlay.innerHTML = sys.themeInstallSuccess;
                    //check for compatibility
					if(!data.compatible){
					    desktop.dialog.alert({
					        title: sys.notCompatible,
					        message: sys.notCompatibleText
					    });
					}
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
		var bottom = new dijit.layout.ContentPane({region: "bottom"});
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
