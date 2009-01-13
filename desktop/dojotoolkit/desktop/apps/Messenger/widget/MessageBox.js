dojo.provide("desktop.apps.Messenger.widget.MessageBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.layout.BorderContainer");

dojo.declare("desktop.apps.Messenger.widget.MessageBox", [dijit._Widget, dijit._Templated, dijit._Contained], {
    templatePath: dojo.moduleUrl("desktop.apps.Messenger.widget.templates", "MessageBox.html"),
    widgetsInTemplate: true,
    postCreate: function(){
        this.inherited(arguments);
        dojo.connect(this.inputBox.domNode, "onkeyup", this, "_onKey");
    },
    onSend: function(value){
        
    },
    _onSend: function(value){
        if(value != "")
            this.onSend(value);
        this.inputBox.attr("value", "");
    },
    _onKey: function(e){
        if(e.keyCode == dojo.keys.ENTER)
            this._onSend(this.inputBox.attr("value"));
    },
    _onClick: function(){
        this._onSend(this.inputBox.attr("value"));
    }
});
