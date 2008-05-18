dojo.provide("desktop.apps.AdminPanel.quota");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.Button");

dojo.extend(desktop.apps.AdminPanel, {
	_quotaUI: {},
	quota: function() {
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		this.toolbar.destroyDescendants();
		//buttons
		this.toolbar.addChild(new dijit.form.Button({
			label: cmn.save,
			iconClass: "icon-16-actions-document-save",
			onClick: dojo.hitch(this, function() {
				var values = {};
				for(var key in this._quotaUI) {
					values[key] = this._quotaUI[key]();
				}
				desktop.admin.quota.set(values);
			})
		}));
		
		this.main.setContent(cmn.loading);
		desktop.admin.quota.list(dojo.hitch(this, function(items) {
			var div = document.createElement("div");
			dojo.forEach(items, function(item) {
				var row = document.createElement("div");
				var title = document.createElement("b");
				title.textContent = sys[item.type+"s"] || item.type;
				row.appendChild(title);
				row.appendChild(document.createElement("hr"));
				var ui = this.makeQuotaRow(item);
				row.appendChild(ui.node);
				div.appendChild(row);
				this._quotaUI[item.type] = ui.getValue;
			}, this);
			this.main.setContent(div);
			this.win.startup();
		}))
	},
	makeQuotaRow: function(item) {
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var row = document.createElement("div");
				
		//widgets
		var val = item.size == 0 ? 26214400 : item.size;
		var unit = "B";
		dojo.forEach([
			"KB",
			"MB",
			"GB"
		], function(item) {
			if(!(val % 1024)) {
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
		var cb_custom = new dijit.form.RadioButton({
			name: this.sysname+this.instance+"radio"+item.type,
			onChange: function(v) {
				valueWid.setDisabled(!v);
				unitWid.setDisabled(!v);
			}
		});
		cb_custom.setAttribute("checked", item.size != 0);
		cb_custom.onChange(item.size != 0);
		var cb_unlimited = new dijit.form.RadioButton({
			name: this.sysname+this.instance+"radio"+item.type
		})
		cb_unlimited.setAttribute("checked", item.size == 0);
		//put widgets in body
		var row1 = document.createElement("div");
		row1.appendChild(cb_custom.domNode);
		row1.appendChild(valueWid.domNode);
		row1.appendChild(unitWid.domNode);
		row.appendChild(row1);
		var row2 = document.createElement("div");
		row2.appendChild(cb_unlimited.domNode);
		var unLabel = document.createElement("span");
		unLabel.textContent = sys.unlimited;
		row2.appendChild(unLabel);
		row.appendChild(row2);
		
		return {
			node: row,
			getValue: function() {
				if(cb_unlimited.checked) return 0;
				var val = valueWid.getValue();
				dojo.forEach([
					{unit: "GB", size: 1073741824},
					{unit: "MB", size: 1048576},
					{unit: "KB", size: 1024}
				], function(item) {
					if(unitWid.getValue() == item.unit)
						val = val*item.size;
				});
				return val;
			}
		};
	}
});