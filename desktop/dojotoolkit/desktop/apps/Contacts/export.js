dojo.provide("desktop.apps.Contacts.export");

(function(){
    var keys = {
        name: "FN",
        address: "ADR",
        phone: "TEL",
        email: "EMAIL"
    }
    dojo.extend(desktop.apps.Contacts, {
        doExport: function(){
            var msg = dojo.i18n.getLocalization("desktop", "messages");
            desktop.dialog.file({
	            title: msg.chooseFileSave,
	            callback: dojo.hitch(this, function(path){
                   this.exportData(path, function(){}, function(){}); //TODO: add notifications? 
	            })
	        });

        },
        exportData: function(path, onComplete, onError){
            var data = [];
            var store = this.contactStore;
            store.fetch({
                query: {id: "*"},
                onItem: function(item){
                   var card = "BEGIN:VCARD\nVERSION:3.0\n";
                   for(var key in keys){
                       if(store.hasAttribute(item, key) && store.getValue(item, key) != "")
                           card += keys[key]+":"+store.getValue(item, key)+"\n";
                   }
                   card += "END:VCARD";
                   data.push(card);
                },
                onComplete: function(){
                   desktop.filesystem.writeFileContents(path, data.join("\n\n"), onComplete, onError);
                }
            });
        }
    });
})();
