this.kill = function() {
    if (!this.win.closed) {
        this.win.close();
    }
    clearTimeout(this.timer);
}
this.init = function(args) {
    dojo.require("dijit.layout.LayoutContainer");
    dojo.require("dijit.layout.ContentPane");
    dojo.require("dijit.ProgressBar");
    dojo.require("dijit.Toolbar");
    dojo.require("dijit.form.Button");
    dojo.require("dijit.Menu");
    //make window
    this.win = new api.Window({
        title: "Task Manager",
        width: "500px",
        height: "400px"
    });
    var toolbar = new dijit.Toolbar({
        layoutAlign: "top"
    });
    toolbar.addChild(new dijit.form.Button({
        label: "About",
        onClick: dojo.hitch(this, this.about),
        iconClass: "icon-16-apps-help-browser"
    }));
    toolbar.addChild(new dijit.form.Button({
        label: "Exit",
        onClick: dojo.hitch(this, this.kill),
        iconClass: "icon-16-actions-system-log-out"
    }));
    this.win.addChild(toolbar);
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
    this.main.setContent("Getting processes...");
    this.timer = setTimeout(dojo.hitch(this, this.home), 1000);

}

this.about = function() {
    api.ui.alertDialog({
        title: "Task Manager",
        message: "Psych Desktop Task Manager<br>Version " + this.version
    });

}

this.executeKill = function(id) {
    if (desktop.app.getInstance(id).status != "killed") {
        desktop.app.kill(id);
        api.ui.alertDialog({
            title: "Task Manager",
            message: "Instance " + id + " was killed sucessfully."
        });

    }
    else {
        api.ui.alertDialog({
            title: "Task Manager",
            message: "This process has already been killed or has exited."
        });

    }
    this.home();

}
this.home = function() {
    this.main.setContent("Refreshing...");
    var data = desktop.app.getInstances();
    var html = "<table style='width: 100%;'><thead><tr style='background-color: #dddddd;'><td>Name</td><td>Instance</td><td>AppID</td><td>Status</td><td>Actions</td></tr></thead><tbody>";
    for (var x = 0; x < data.length; x++) {
        if (typeof(data[x]) == "object") {
            // Error handler, for some reason, it sometimes fucksup.
            if (data[x].status != "killed") {
                html += "<tr><td>" + data[x].name + "</td><td>" + data[x].instance + "</td><td>" + data[x].appid + "</td><td>" + data[x].status + "</td><td><a href='javascript:void(0);' onClick='desktop.app.instances[" + this.instance + "].executeKill(" + data[x].instance + ")'>Kill</a></td></tr>";

            }

        }

    }
    this.main.setContent(html);
    this.timer = setTimeout(dojo.hitch(this, this.home), 1000);
}