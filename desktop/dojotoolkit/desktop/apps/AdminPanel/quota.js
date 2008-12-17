dojo.provide("desktop.apps.AdminPanel.quota");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.Button");

dojo.extend(desktop.apps.AdminPanel, {
	_quotaUI: {},
	quota: function(){
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		this.toolbar.destroyDescendants();
		//buttons
		this.toolbar.addChild(new dijit.form.Button({
			label: cmn.save,
			iconClass: "icon-16-actions-document-save",
			onClick: dojo.hitch(this, function(){
				var values = {};
				for(var key in this._quotaUI){
					values[key] = this._quotaUI[key]();
				}
				desktop.admin.quota.set(values);
			})
		}));
		
		this.main.setContent(cmn.loading);
		desktop.admin.quota.list(dojo.hitch(this, function(items){
			var div = document.createElement("div");
			dojo.forEach(items, function(item){
				var row = document.createElement("div");
				var title = document.createElement("b");
				title.innerHTML = sys[item.type+"s"] || item.type;
				row.appendChild(title);
				row.appendChild(document.createElement("hr"));
				var ui = this.makeQuotaRow(item);
				row.appendChild(ui.node);
				div.appendChild(row);
				this._quotaUI[item.type] = ui.getValue;
			}, this);
			this.main.setContent(div);
			this.win.layout();
		}))
	},
	makeQuotaRow: function(item, showDefault){
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var row = document.createElement("div");
				
		//widgets
		var val = item.size < 1 ? 26214400 : item.size;
		var unit = "B";
		dojo.forEach([
			"KB",
			"MB",
			"GB"
		], function(item){
			if(!(val % 1024)){
				unit = item;
				val = val/1024;
			}
		});
		var valueWid = new dijit.form.NumberSpinner({
			value: val,
			constraints: {
				min: 1
			}
		})
		var unitWid = new dijit.form.FilteringSelect({
			autoComplete: true,
			searchAttr: "value",
			style: "width: 120px;",
			value: unit,
			store: new dojo.data.ItemFileReadStore({
				data: {
					identifier: "value",
					items: [
						{value: "B"},
						{value: "KB"},
						{value: "MB"},
						{value: "GB"}
					]
				}
			})
		});
		var onChange = function(v){
			if(!v) return;
			valueWid.setDisabled(this.value != "custom");
			unitWid.setDisabled(this.value != "custom");
		}
		var cb_custom = new dijit.form.RadioButton({
			name: this.sysname+this.instance+"radio"+item.type,
			value: "custom",
			onChange: onChange
		});
		cb_custom.setAttribute("checked", item.size > 0);
		var cb_unlimited = new dijit.form.RadioButton({
			name: this.sysname+this.instance+"radio"+item.type,
			value: "unlimited",
			onChange: onChange
		})
		cb_unlimited.setAttribute("checked", item.size == 0);
		var cb_default;
		if(showDefault){
			cb_default = new dijit.form.RadioButton({
				name: this.sysname+this.instance+"radio"+item.type,
				value: "default",
				onChange: onChange
			});
			cb_default.setAttribute("checked", item.size == -1);
		}
		valueWid.setDisabled(item.size <= 0);
		unitWid.setDisabled(item.size <= 0);
		//put widgets in body
		var row1 = document.createElement("div");
		row1.appendChild(cb_custom.domNode);
		row1.appendChild(valueWid.domNode);
		row1.appendChild(unitWid.domNode);
		row.appendChild(row1);
		var row2 = document.createElement("div");
		row2.appendChild(cb_unlimited.domNode);
		var unLabel = document.createElement("span");
		unLabel.innerHTML = sys.unlimited;
		row2.appendChild(unLabel);
		row.appendChild(row2);
		if(showDefault){
			var row3 = document.createElement("div");
			var defLabel = document.createElement("span");
			defLabel.innerHTML = sys["default"];
			row3.appendChild(cb_default.domNode);
			row3.appendChild(defLabel);
			row.appendChild(row3);
		}
		
		return {
			node: row,
			getValue: function(){
				if(cb_unlimited.checked) return 0;
				if(showDefault && cb_default.checked) return -1;
				var val = valueWid.getValue();
				dojo.forEach([
					{unit: "GB", size: 1073741824},
					{unit: "MB", size: 1048576},
					{unit: "KB", size: 1024}
				], function(item){
					if(unitWid.getValue() == item.unit)
						val = val*item.size;
				});
				return val;
			}
		};
	},
	makeQuotaWin: function(item, callback){
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		var sys = dojo.i18n.getLocalization("desktop", "system");
		item.type = item.name;
		var ui = this.makeQuotaRow(item, true);
		var win = new desktop.widget.Window({
			title: sys.modifyQuota.replace("%s", item.name),
			width: "400px",
			height: "100px"
		});
		var cpane = new dijit.layout.ContentPane({region: "center"});
		cpane.setContent(ui.node);
		win.addChild(cpane);
		//bottom part
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
				callback(ui.getValue());
				win.close();
			})
		})
		cont.appendChild(save.domNode);
		dojo.addClass(cont, "floatRight");
		bottom.setContent(cont);
		win.addChild(bottom);
		this.windows.push(win);
		win.show();
	}
});
