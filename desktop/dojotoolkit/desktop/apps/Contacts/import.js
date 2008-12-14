dojo.provide("desktop.apps.Contacts.import");

(function(){
    var keys = {
        FN: "name",
        ADR: "address",
        TEL: "phone",
        EMAIL: "email"
    }
    dojo.extend(desktop.apps.Contacts, {
        doImport: function(){
            var msg = dojo.i18n.getLocalization("desktop", "messages");
            desktop.dialog.file({
	            title: msg.chooseFileOpen,
	            onComplete: dojo.hitch(this, function(path){
                   this.importData(path, function(){}, function(){}); //TODO: add notifications? 
	            })
	        });

        },
        importData: function(path, onComplete, onError){
            var store = this.contactStore;
            desktop.filesystem.readFileContents(path, function(data){ 
                var lines = (data+"\r\n").split("\n");
                var vcard = {};
                var vcards = [];
                var info;
                var lastKey;
                var counter = 0;
                dojo.forEach(lines, function(line){
                    if(line == "") return;
                    var re = new RegExp("^([^:;]+)([^:]+:|\:)(|.|.+)$", "mg");
                    var info = re.exec(line);
                    if(!info){
                        vcard[lastKey]+= line;
                        return;
                    }
                    var key = info[1];
                    var value = info[3];
                    if(key == "BEGIN"){
                        vcard = {id: (new Date()).getTime().toString()+(counter++)}
                    }
                    else if(key == "END"){
                        vcards.push(vcard);
                    }
                    else if(keys[key]){
                        vcard[keys[key]] = value;
                        lastKey = keys[key];
                    }
                });
                console.log(vcards);
                dojo.forEach(vcards, dojo.hitch(store, "newItem"));
                store.save();
            }, onError);
        }
    });
})();
