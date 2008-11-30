dojo.provide("desktop.apps.AdminPanel.groups");

dojo.extend(desktop.apps.AdminPanel, {
	groups: function(){
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		this.toolbar.destroyDescendants();
		var button = new dijit.form.DropDownButton({
			label: sys.createNewGroup,
			dropDown: this.createGroupDialog()
		});
		this.toolbar.addChild(button);
		desktop.admin.groups.list(dojo.hitch(this, function(data){
			for(var i=0;i<data.length;i++){
				data[i].permissions = dojo.toJson(data[i].permissions);
			};
			//make headers (need to do it manually unfortunatly)
			var layout = [{
				cells: [[
					{name: sys.name, field: "name"},
					{name: sys.description, field: "description", editable: true, type: dojox.grid.cells.Cell}
				]]
			}];
			this._groupStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "id",
					items: data
				}
			});
			var grid = this._groupGrid = new dojox.grid.DataGrid({
				structure: layout,
                store: this._groupStore,
                query: {id: "*"}
			});
			if(this._con) dojo.disconnect(this._con);
			this._con = dojo.connect(this.main, "resize", grid, "resize");
			dojo.connect(this._groupStore, "onDelete", this, function(a){
				desktop.admin.groups.remove(a.id[0]); //that feels really hackish
			})
			dojo.connect(this._groupStore, "onSet", this, function(item, attribute, oldVal, newVal){
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
					onClick: dojo.hitch(this, function(e){
						var row = this._groupGrid.getItem(this.__rowIndex);
						desktop.dialog.yesno({
							title: sys.groupDelConfirm,
							message: sys.delFromSys.replace("%s", row.name),
							onComplete: dojo.hitch(this, function(a){
								this._groupStore.deleteItem(row);
							})
						})
					})
				},
				{
					label: sys.alterPermissions,
					onClick: dojo.hitch(this, "permDialog",
						grid,
						dojo.hitch(this, function(row){
							return this._groupStore.getValue(row, "name");
						}),
						dojo.hitch(this, function(row){
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
				},
				{
					label: sys.manageGroupMembersGeneric,
					onClick: dojo.hitch(this, "groupMemberDialog")
				},
				{
					label: sys.modifyQuotaGeneric,
					onClick: dojo.hitch(this, function(){
						var row = this._groupGrid.getItem(this.__rowIndex);
						var info = {
							name: this._groupStore.getValue(row, "name"),
							size: this._groupStore.getValue(row, "quota")
						};
						this.makeQuotaWin(info, dojo.hitch(this, function(value){
							this._groupStore.setValue(row, "quota", value);
						}));
					})
				}
			], function(item){
				var menuItem = new dijit.MenuItem(item);
				menu.addChild(menuItem);
			});
			this._groupGrid.onRowContextMenu = dojo.hitch(this, function(e){
				this.__rowIndex = e.rowIndex;
				this._groupMenu._contextMouse();
				this._groupMenu._openMyself(e);
			});
			document.body.appendChild(menu.domNode);
			this.win.layout();
		}));
	},
	
	createGroupDialog: function(){
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
			onClick: dojo.hitch(this, function(){
				var n = name.getValue();
				var d = description.getValue();
				this._groupStore.fetch({
					query: {name: n},
					onComplete: dojo.hitch(this, function(list){
						if(list.length != 0){
							errBox.textContent = sys.groupAlreadyExists;
							return;
						}
						errBox.textContent = "";
						desktop.admin.groups.add({
							name: n,
							description: d,
							onComplete: dojo.hitch(this, function(id){
								name.setValue("");
								description.setValue("");
								this._groupStore.newItem({
									id: id,
									name: n,
									description: d,
									permissions: "[]",
									quota: -1
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
	
	groupMemberDialog: function(group){
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		var row = this._groupGrid.getItem(this.__rowIndex);
		var window = new desktop.widget.Window({
			title: sys.manageGroupMembers.replace("%s", this._groupStore.getValue(row, "name")),
			width: "400px",
			height: "200px"
		})
		this.windows.push(window);
		var makeUI = function(list){
			var client = new dijit.layout.ContentPane({
				region: "center",
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
				dojo.connect(right, "onclick", this, function(){
					desktop.admin.groups.removeMember(
						this._groupStore.getValue(row, "id"),
						item.id
					);
					div.removeChild(drow);
					dojo.forEach(idList, function(id, i){
						if(id == item.id) idList.splice(i, 1);
					})
				})
				div.appendChild(drow);
			})
			
			dojo.forEach(list, makeItem, this)
			
			client.setContent(div);
			window.addChild(client);
			
			var top = new dijit.layout.ContentPane({
				region: "top"
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
				onClick: dojo.hitch(this, function(){
					desktop.admin.groups.addMember(
						this._groupStore.getValue(row, "id"),
						s.getValue()
					);
					var hasItem = false;
					dojo.forEach(idList, function(id){
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
			if(typeof this._userStore == "undefined"){
				this.makeUserStore(dojo.hitch(this, makeUI, list));
			}
			else dojo.hitch(this, makeUI, list)();
		}));
	}
})
