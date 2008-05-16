dojo.provide("desktop.apps.AdminPanel.permissions");

dojo.extend(desktop.apps.AdminPanel, {
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
			for(var key in data) {
				var item = data[key];
				item.description = permNls[item.name] || item.description;
			}
			//make headers
			for(var field in data[0]) {
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
})
