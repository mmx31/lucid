dojo.provide("desktop.apps.Messenger.io");

dojo.extend(desktop.apps.Messenger, {
    listener: null,
    currentUsername: null,
    setListener: function(){
        this.listener = desktop.crosstalk.subscribe("IM", dojo.hitch(this, "recieveMessage"), this.instance); 
    },
    removeListener: function(){
        desktop.crosstalk.unsubscribe(this.listener);
    },
    sendMessage: function(uid, msg){
        this.pushMsg(uid, msg, true);
        desktop.crosstalk.publish("IM", {text: msg}, uid, this.sysname);
    },
    recieveMessage: function(msg){
        var uid = msg._crosstalk.sender;        
        this.pushMsg(uid, msg.text, false);
    },
    getCurrentUsername: function(cback){
        if(this.currentUsername) cback(this.currentUsername);
        desktop.user.get({callback: dojo.hitch(this, function(data) {
            this.currentUsername = data.username;
            cback(this.currentUsername);
        })});
    }
});
