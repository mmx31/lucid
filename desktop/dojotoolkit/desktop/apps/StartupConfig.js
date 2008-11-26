dojo.provide("desktop.apps.StartupConfig");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.CheckBox");
dojo.requireLocalization("desktop", "apps");

dojo.declare("desktop.apps.StartupConfig", desktop.apps._App, {
	cbs: {},
	init: function(args){
		var appNls = dojo.i18n.getLocalization("desktop", "apps");
		var win = this.win = new desktop.widget.Window({
			title: appNls["Startup Applications"],
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill"),
			width: "300px",
			height: "300px"
		});
		var cpane = new dijit.layout.ContentPane({
			region: "center",
			style: "overflow-y: auto; padding: 5px;"
		});
		var div = document.createElement("div");
		dojo.forEach(desktop.app.appList, function(app){
			//make checkbox
			var onStartup = false;
			dojo.forEach(desktop.config.startupApps, function(item){
				if(item == app.sysname || item.name == app.sysname) onStartup = true;
			});
			var cb = new dijit.form.CheckBox({
				checked: onStartup,
				onChange: dojo.hitch(this, "saveConfig")
			});
			this.cbs[app.sysname] = cb;
			
			//make row
			var row = document.createElement("div");
			var label = document.createElement("span");
			dojo.style(label, "marginLeft", "5px");
			desktop.textContent(label, appNls[app.name] || app.name);
			row.appendChild(cb.domNode);
			row.appendChild(label);
			div.appendChild(row);
		}, this);
		cpane.setContent(div);
		win.addChild(cpane);
		win.show();
		win.startup();
	},
	saveConfig: function(){
        var sApps = desktop.config.startupApps;
        var config = dojo.clone(sApps);
		for(var key in this.cbs){
			if(!this.cbs[key].checked){
                for(var i in sApps){
                    if(sApps[i] == key || sApps[i].name == key)
                        config.splice(i, 1);
                }
            }else{
                var exists = false;
                for(var i in sApps){
                    if(sApps[i] == key || sApps[i].name == key)
                        exists = true;
                }
                if(!exists)
                    config.push(key);
            }
            desktop.config.startupApps = config;
		}
	},
	kill: function(){
		if(!this.win.closed) this.win.close();
		desktop.config.save();
	}
});
