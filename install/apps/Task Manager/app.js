({
	kill: function() {
	    if (!this.win.closed) {
	        this.win.close();
	    }
	    clearTimeout(this.timer);
	},
	init: function(args) {
	    dojo.require("dijit.layout.LayoutContainer");
	    dojo.require("dijit.layout.ContentPane");
	    dojo.require("dijit.ProgressBar");
	    dojo.require("dijit.Toolbar");
	    dojo.require("dijit.form.Button");
	    dojo.require("dijit.Menu");
		dojo.requireLocalization("desktop", "common");
		dojo.requireLocalization("desktop", "apps");
		dojo.requireLocalization("desktop", "system");
		var nls = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
	    //make window
	    this.win = new api.Window({
	        title: app["Task Manager"],
	        width: "500px",
	        height: "400px"
	    });
	    //var layout = new dijit.layout.LayoutContainer({sizeMin: 60, sizeShare: 60}, document.createElement("div"));
	    this.main = new dijit.layout.ContentPane({
	        layoutAlign: "client"
	    },
	    document.createElement("div"));
	    //layout.addChild(this.main);
	    //this.toolbar = new dijit.Toolbar({layoutAlign: "top"});
	    //layout.addChild(this.toolbar);
	    this.win.addChild(this.main);
	    this.win.show();
	    this.win.startup();
	    this.win.onClose = dojo.hitch(this, this.kill);
	    this.main.setContent(nls.loading);
	    this.timer = setTimeout(dojo.hitch(this, this.home), 1000);
	
	},
	
	executeKill: function(id) {
		var sys = dojo.i18n.getLocalization("desktop", "system");
	    if (desktop.app.getInstance(id).status != "killed") {
	        if(desktop.app.kill(id)) {
	        api.ui.notify(sys.killSuccess.replace("%s", id));
		}
		else {
			api.ui.notify({
				message: sys.killFail.replace("%s", id),
				type: "error"
			});
		}
	    }
	    else {
	        api.ui.notify({
	            type: "warning",
	            message: sys.allreadyKilled
	        });
	
	    }
	    this.home();
	
	},
	home: function() {
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var app = dojo.i18n.getLocalization("desktop", "apps");
	    var data = desktop.app.getInstances();
	    var html = "<table style='width: 100%;'><thead><tr style='background-color: #dddddd;'><td>Name</td><td>Instance</td><td>AppID</td><td>Status</td><td>Actions</td></tr></thead><tbody>";
	    for (var x = 0; x < data.length; x++) {
	        if (typeof(data[x]) == "object") {
	            // Error handler, for some reason, it sometimes fucksup.
	            if (data[x].status != "killed") {
	                html += "<tr><td>" + app[data[x].name] + "</td><td>" + data[x].instance + "</td><td>" + data[x].appid + "</td><td>" + data[x].status + "</td><td><a href='javascript:void(0);' onClick='desktop.app.instances[" + this.instance + "].executeKill("+ data[x].instance + ")'>"+sys.kill+"</a></td></tr>";
	
	            }
	
	        }
	
	    }
	    this.main.setContent(html);
	    this.timer = setTimeout(dojo.hitch(this, this.home), 1000);
	}
})