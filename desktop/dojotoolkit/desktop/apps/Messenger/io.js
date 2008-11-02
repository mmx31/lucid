dojo.provide("desktop.apps.Messenger.io");

dojo.extend(desktop.apps.Messenger, {
    listener: null,
    setListener: function() {
        this.listener = desktop.crosstalk.subscribe("IM", dojo.hitch(this, "recieveMessage"), this.instance); 
    },
    removeListener: function() {
        desktop.crosstalk.unsubscrive(this.listener);
    },
    sendMessage: function(uid, msg) {
        this.pushMsg(uid, msg, true);
        desktop.crosstalk.publish("IM", {text: msg}, uid, this.sysname);
    },
    recieveMessage: function(msg) {
        var uid = msg._crosstalk.sender;        
        this.pushMsg(uid, msg.text, false);
    }
});
