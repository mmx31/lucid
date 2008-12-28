dojo.provide("desktop.apps.Contacts.ContactForm");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Form");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");

dojo.declare("desktop.apps.Contacts.ContactForm", dijit.form.Form, {
    widgetsInTemplate: true,
    templateString: null,
    templatePath: dojo.moduleUrl("desktop.apps.Contacts.templates", "ContactForm.html"),
    postCreate: function(){
        
    },
    onSubmit: function(){
        var values = this.getValues();
        for(var key in values){
            var value = values[key];
            this.store.setValue(this.item, key, value);
        }
        setTimeout(dojo.hitch(this.store, "save"), 200);
    },
    onCancel: function(){
    }
});
