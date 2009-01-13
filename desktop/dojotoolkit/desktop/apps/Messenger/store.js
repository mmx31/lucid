dojo.provide("desktop.apps.Messenger.store");

dojo.extend(desktop.apps.Messenger, {
    buddyStore: null,
    makeBuddyStore: function(){
        if(this.buddyStore) return this.buddyStore;
        var store = this.buddyStore = new desktop.Registry({
            name: "buddyList",
            appname: this.sysname,
            data: {
                identifier: "id",
                label: "username",
                items: [
                    //sample item:
                    //{id: 0, userid: 1, username: "admin"}
                ]
            }
        });
        return store;
    },
    addBuddy: function(info){
        if(!info.exists){
            return desktop.dialog.notify({type: "error", message: "User specified does not exist!"});
        }
        this.buddyStore.newItem({
            id: info.id,
            username: info.username,
            logged: info.logged
        });
        this.buddyStore.save();
    },
    updateStatus: function(){
        var store = this.buddyStore;
        store.fetch({
            query: {id: "*"},
            onItem: function(item){
                desktop.user.get({
                    id: store.getValue(item, "id"),
                    onComplete: function(info){
                        store.setValue(item, "logged", !!parseInt(info.logged));
                    }
                });
            }
        });
    }
});
