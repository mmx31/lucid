dojo.provide("desktop.apps.Contacts.import");

(function() {
    var keys = {
        FN: "name",
        ADDR: "address",
        TEL: "phone",
        EMAIL: "email"
    }
    dojo.extend(desktop.apps.Contacts, {
        doImport: function() {
            var msg = dojo.i18n.getLocalization("desktop", "messages");
            api.ui.fileDialog({
	            title: msg.chooseFileOpen,
	            callback: dojo.hitch(this, function(path) {
                   this.importData(path, function(){}, function(){}); //TODO: add notifications? 
	            })
	        });

        },
        importData: function(path, onComplete, onError) {
            api.filesystem.readFileContents(path, function(data) {
                var re = /([^\:\;\s]+)((;[\w=]+\:)|(\:))([\S ]+)/mgi;
                var matches = data.match(re);
                dojo.forEach(matches, function(match) {
                    console.log(match);
                    var info = re.exec(match);
                    if(!info) return;
                    var key = info[1];
                    var value = info[5];
                    console.log(key, value);
                });
            }, onError);
        }
    });
})();
