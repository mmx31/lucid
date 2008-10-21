dojo.provide("desktop.apps.Contacts.import");

(function() {
    var keys = {
        FN: "name",
        ADR: "address",
        TEL: "phone",
        EMAIL: "email"
    }
    dojo.extend(desktop.apps.Contacts, {
        doImport: function() {
            var msg = dojo.i18n.getLocalization("desktop", "messages");
            desktop.dialog.file({
	            title: msg.chooseFileOpen,
	            callback: dojo.hitch(this, function(path) {
                   this.importData(path, function(){}, function(){}); //TODO: add notifications? 
	            })
	        });

        },
        importData: function(path, onComplete, onError) {
            var store = this.contactStore;
            desktop.filesystem.readFileContents(path, function(data) {
                var re = /^([^\:;\r\n]+)(([^:]+\:)|(\:))(.+)$/mg;
                var vcard = {};
                var info;
                while(info = re.exec(data)) {
                    var key = info[1];
                    var value = info[5];
                    if(key == "BEGIN")
                        vcard = {id: (new Date()).toString()}
                    else if(key == "END")
                        store.newItem(vcard);
                    else if(keys[key])
                        vcard[keys[key]] = value;
                    console.log(info, key, value);
                };
                //last END:VCARD doesn't seem to match, so...
                store.newItem(vcard);
            }, onError);
        }
    });
})();
