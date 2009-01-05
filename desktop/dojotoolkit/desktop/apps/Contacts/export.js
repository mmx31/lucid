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
	            onComplete: dojo.hitch(this, function(path){
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
                   var card = "BEGIN:VCARD\r\nVERSION:3.0\r\n";
                   for(var key in keys){
                       if(key == "address"){
                            var types = ["work", "home"];
                            for(var t in types){
                                var type = types[t];
                                //grab all the address fields, merge into one
                                var fields = ["pobox", "address", "city", "state", "zip", "country"];
                                var parts = [];
                                var labels = [];
                                for(var i in fields){
                                    var field = fields[i]+"-"+type;
                                    if(store.hasAttribute(item, field)){
                                        labels.push(type+" "+fields[i]);
                                        parts.push(store.getValue(item, field));
                                    }
                                }
                                card += "LABEL;TYPE="+type+":"+labels.join("\\n")+"\r\n";
                                card += keys[key]+";TYPE="+type.toUpperCase()+":";
                                card += parts.join(";");
                                card += "\r\n";
                            }
                       }
                       else if(key == "phone"){
                            var types=["work", "home", "mobile", "fax"];
                            for(var t in types){
                                var type = types[t];
                                var field = "phone-"+type;
                                var vcardFields = {
                                    work: "WORK,VOICE",
                                    home: "HOME,VOICE",
                                    mobile: "MOBILE,VOICE",
                                    fax: "WORK,FAX"
                                }
                                if(store.hasAttribute(item, field)){
                                    card += "TEL;TYPE="+vcardFields[type]+":"+store.getValue(item, field);
                                }
                            }
                       }
                       else if(store.hasAttribute(item, key) && store.getValue(item, key) != "")
                            card += keys[key]+":"+store.getValue(item, key)+"\r\n";
                   }
                   card += "END:VCARD";
                   data.push(card);
                },
                onComplete: function(){
                   desktop.filesystem.writeFileContents(path, data.join("\r\n\r\n"), onComplete, onError);
                }
            });
        }
    });
})();
