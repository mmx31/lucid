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
                var lines = (data+"\r").split("\n");
                var vcard = {};
                var info;
                var lastKey;
                for(var i in lines){
                    var line = lines[i];
                    var re = /^([^:;]+)([^:]+:|\:)(.+)$/mg;
                    var info = re.exec(line);
                    if(!info){
                        vcard[lastKey]+= line;
                        continue;
                    }
                    var key = info[1];
                    lastKey = key;
                    var value = info[3];
                    if(key == "BEGIN")
                        vcard = {id: (new Date()).toString()}
                    else if(key == "END"){
                        console.log(vcard);
                        store.newItem(vcard);
                    }
                    else if(keys[key])
                        vcard[keys[key]] = value;
                };
            }, onError);
        }
    });
})();
