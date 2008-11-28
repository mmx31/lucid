dojo.provide("desktop.apps.Todo._base");
dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.requireLocalization("desktop.apps.Todo", "labels");
dojo.requireLocalization("desktop", "apps");
desktop.addDojoCss("dojox/grid/resources/Grid.css");

dojo.declare("desktop.apps.Todo", desktop.apps._App, {
    init: function(args){
        var labels = dojo.i18n.getLocalization("desktop.apps.Todo", "labels");
        var app = dojo.i18n.getLocalization("desktop", "apps");
        var win = this.win = new desktop.widget.Window({
            title: app["Todo"],
            width: "450px",
            height: "250px",
            onClose: dojo.hitch(this, "kill")
        });
        var toolbar = new dijit.Toolbar({
            region: "top"
        });
        var newTask = new dijit.form.Button({
            label: labels.newTask,
            iconClass: "icon-16-actions-list-add",
            onClick: dojo.hitch(this, "newTask")
        });
        toolbar.addChild(newTask);
        var removeTask = new dijit.form.Button({
            label: labels.removeTask,
            iconClass: "icon-16-actions-list-remove",
            onClick: dojo.hitch(this, "removeTask")
        });
        toolbar.addChild(removeTask);
        win.addChild(toolbar);
        
        var store = this.store = new desktop.Registry({
            name: "tasks",
            appname: this.sysname,
            data: {
                identifier: "id",
                items: []
            }
        });
        dojo.connect(store, "onSet", this, function(){ this.grid.setSortIndex(0, true); store.save(); });
		dojo.connect(store, "onDelete", function(){ store.save(); });
        dojo.connect(store, "onNew", function(){ store.save(); });

        var grid = this.grid = new dojox.grid.DataGrid({
            store: store,
            query: {id: "*"},
            structure: [{
				cells: [[
					{field: "complete", name: labels.complete, editable: true, type: dojox.grid.cells.Bool, sort: "desc"},
                    {field: "description", name: labels.description, width: "auto", editable: true, type: dojox.grid.cells.Cell},
                    {field: "category", name: labels.category, editable: true, type: dojox.grid.cells.ComboBox, options: [], hidden: true} //hidden until we get this implemented
				]]
			}]
        });
        var content = this.content = new dijit.layout.ContentPane({region: "center"});
        content.setContent(grid);
        win.addChild(content);
        win.show();
        grid.startup();
        setTimeout(dojo.hitch(grid, "setSortIndex", 0, true), 200);
    },
    newTask: function(){
        var labels = dojo.i18n.getLocalization("desktop.apps.Todo", "labels");
        this.store.newItem({
            id: (new Date()).toString(),
            complete: false,
            description: labels.newTask,
            category: ""
        });
    },
    removeTask: function(){
        this.grid.removeSelectedRows();
    },
    kill: function(){
        if(!this.win.closed)
            this.win.close();
    }
});
