dojo.provide("desktop.apps.TaskManager");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.requireLocalization("desktop", "common");
dojo.requireLocalization("desktop", "apps");
dojo.requireLocalization("desktop", "system");
desktop.addDojoCss("dojox/grid/resources/Grid.css");

dojo.declare("desktop.apps.TaskManager", desktop.apps._App, {
	kill: function(){
	    clearTimeout(this.timer);
	    if (!this.win.closed){
	        this.win.close();
	    }
	},
	init: function(args){
	    var nls = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
        var sys = dojo.i18n.getLocalization("desktop", "system");
	    //make window
	    this.win = new desktop.widget.Window({
	        title: app["Task Manager"],
	        width: "400px",
	        height: "450px",
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
	    });
		var content = this.content = new dijit.layout.ContentPane({region: "center"});
        var store = this.store = new dojo.data.ItemFileWriteStore({
            data: {
                id: "instance",
                items: desktop.app.getInstancesStatus()
            }
        });
	    
        this.grid = new dojox.grid.DataGrid({
	        region: "center",
            structure: [{
				cells: [[
					{field: "instance", name: sys.instance},
                    {field: "sysname", name: sys.sysname},
                    {field: "name", name: nls.name},
                    {field: "status", name: sys.status}
				]]
			}],
            store: store,
            query: {instance: "*"}
	    });
		content.setContent(this.grid.domNode);
	    this.win.addChild(content);
	    this.win.show();
	    this.win.startup();
	    this.timer = setTimeout(dojo.hitch(this, "update"), 1000);
        this.grid.startup();
	},
	
    update: function(){
        var processes = desktop.app.getInstancesStatus();
        dojo.forEach(processes, function(instance){
            this.store.fetchItemByIdentity({
                identity: instance.instance,
                onItem: dojo.hitch(this, function(item){
                    if(!this.store.isItem(item)){
                        this.store.newItem(instance);
                        return;
                    }
                    for(var key in instance){
                        if(this.store.getValue(item, key) != instance[key])
                        this.store.setValue(item, key, instance[key]);
                    }
                })
            });
        }, this);
        this.store.fetch({
            query: {instance: "*"},
            onItem: dojo.hitch(this, function(item){
                var exists = false;
                var id = this.store.getIdentity(item);
                dojo.forEach(processes, function(instance){
                    if(id==instance.instance)
                        exists=true;
                });
                if(!exists){
                    this.store.deleteItem(item);
                }
            })
        })
        //make menu
        var sys = dojo.i18n.getLocalization("desktop", "system");
        var menu = this.menu = new dijit.Menu({});
        var killApp = new dijit.MenuItem({
            label: sys.kill,
            onClick: dojo.hitch(this, function(){
               var row = this.grid.getItem(this.__rowIndex);
               var id = this.store.getValue(row, "instance");
               this.executeKill(id);
            })
        });
        menu.addChild(killApp);
        menu.startup();
        this.grid.onRowContextMenu = dojo.hitch(this, function(e){
            this.__rowIndex = e.rowIndex;
            this.menu._contextMouse();
            this.menu._openMyself(e);
        });


        this.timer = setTimeout(dojo.hitch(this, "update"), 1000);
    },

	executeKill: function(id){
		var sys = dojo.i18n.getLocalization("desktop", "system");
	    if (desktop.app.getInstance(id).status != "killed"){
	        if(desktop.app.kill(id)){
	        desktop.dialog.notify(sys.killSuccess.replace("%s", id));
		}
		else {
			desktop.dialog.notify({
				message: sys.killFail.replace("%s", id),
				type: "error"
			});
		}
	    }
	    else {
	        desktop.dialog.notify({
	            type: "warning",
	            message: sys.allreadyKilled
	        });
	
	    }
	    this.home();
	
	}/*,
	home: function(){
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var app = dojo.i18n.getLocalization("desktop", "apps");
	    var data = desktop.app.getInstances();
	    var html = "<table style='width: 100%;'><thead><tr style='background-color: #dddddd;'><td>"+sys.name+"</td><td>"+sys.instance+"</td><td>"+sys.id+"</td><td>"+sys.status+"</td><td>"+sys.actions+"</td></tr></thead><tbody>";
	    for (var x = 0; x < data.length; x++){
	        if (typeof(data[x]) == "object"){
	            // Error handler, for some reason, it sometimes fucksup.
	            if (data[x].status != "killed"){
	                html += "<tr><td>" + (app[data[x].name] || data[x].name) + "</td><td>" + data[x].instance + "</td><td>" + data[x].sysname + "</td><td>" + sys[data[x].status] + "</td><td><a href='javascript:void(0);' onClick='desktop.app.instances[" + this.instance + "].executeKill("+ data[x].instance + ")'>"+sys.kill+"</a></td></tr>";
	
	            }
	
	        }
	
	    }
	    this.main.setContent(html);
	    this.timer = setTimeout(dojo.hitch(this, this.home), 1000);
	}*/
})
