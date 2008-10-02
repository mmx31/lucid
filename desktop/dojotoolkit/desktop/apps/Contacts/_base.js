dojo.provide("desktop.apps.Contacts._base");
dojo.require("dijit.Toolbar");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.cells.dijit");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
api.addDojoCss("dojox/grid/resources/Grid.css");
dojo.requireLocalization("desktop", "apps");
dojo.requireLocalization("desktop.apps.Contacts", "Contacts");
dojo.requireLocalization("desktop", "messages");

dojo.declare("desktop.apps.Contacts", desktop.apps._App, {
	init: function(args) {
        var nls = dojo.i18n.getLocalization("desktop.apps.Contacts", "Contacts");
        var app = dojo.i18n.getLocalization("desktop", "apps");
		this.windows = [];
		var win = new api.Window({
			title: app["Contacts"],
            iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
		});
		this.windows.push(win);
		
		var contactStore = this.contactStore = new api.Registry({
		    name: "contacts",
		    appname: this.sysname,
		    data: {
		        identifier: "id",
		        items: []
		    }
		});
		dojo.connect(contactStore, "onSet", function() { contactStore.save(); });
		
		var toolbar = new dijit.Toolbar({region: "top"});
		
		var newButton = new dijit.form.Button({
		    label: nls.newContact,
		    iconClass: "icon-16-actions-contact-new",
		    onClick: dojo.hitch(this, "newContact")
		});
		toolbar.addChild(newButton);
		
		var removeButton = new dijit.form.Button({
		    label: nls.removeContact,
		    iconClass: "icon-16-actions-edit-delete",
		    onClick: dojo.hitch(this, "removeContact")
		});
		toolbar.addChild(removeButton);
        
        var exportButton = new dijit.form.Button({
		    label: nls.export,
		    onClick: dojo.hitch(this, "doExport")
		});
		toolbar.addChild(exportButton);

        var importButton = new dijit.form.Button({
		    label: nls.import,
		    onClick: dojo.hitch(this, "doImport")
		});
		toolbar.addChild(importButton);

		win.addChild(toolbar);
		
		win.show();
		
		var grid = this.grid = new dojox.grid.DataGrid({
            store: contactStore,
            region: "center",
            structure: [{
		        cells: [[
			        {field: "name", name: nls.name, editable: true, type: dojox.grid.cells.Cell, width: "150px"},
	                {field: "email", name: nls.email, editable: true, type: dojox.grid.cells.Cell, width: "150px"},
	                {field: "phone", name: nls.phone, editable: true, type: dojox.grid.cells.Cell, width: "100px"},
	                {field: "address", name: nls.address, editable: true, type: dojox.grid.cells.Editor, editorToolbar: false, width: "auto"}
		        ]]
	        }]
        });
        win.addChild(grid);
        
	},
	newContact: function(e){
        var store = this.contactStore;
        var nls = dojo.i18n.getLocalization("desktop.apps.Contacts", "Contacts");
        store.newItem({
            id: (new Date()).toString(), //to prevent id collisions
            name: nls.newContact,
            email: "",
            phone: "",
            address: ""
        });
    },
    removeContact: function(e){
        this.grid.removeSelectedRows();
    },
	kill: function(args) {
		dojo.forEach(this.windows, function(win) {
            if(!win.closed)
                win.close();
        });
	}
});

dojo.require("desktop.apps.Contacts.import");
dojo.require("desktop.apps.Contacts.export");
