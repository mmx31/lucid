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
            var parseType = function(params){
                var types = {
                    FAX: "fax",
                    HOME: "home",
                    WORK: "work",
                    MOBILE: "mobile"
                }
                var p = params.split(";");
                for(var i in p){
                    if(p[i] == "" || p[i].indexOf("=") === -1) continue;
                    var kv = p[i].split("=");
                    if(kv[0] != "TYPE") continue;
                    for(var t in types){
                        if(kv[1].indexOf(t) !== -1){
                            return types[t];
                        }
                    }
                    return "";
                }
            }
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
                    var params = info[2];
                    var value = info[3];
                    if(key == "BEGIN"){
                        vcard = {id: (new Date()).getTime().toString()+(counter++)}
                    }
                    else if(key == "END"){
                        vcards.push(vcard);
                    }
                    else if(keys[key] == "address"){
                        //import address
                        var type = "";
                        if(!params){
                            // just throw it in home I guess...
                            type = "home";
                        }else{
                            type = parseType(params);
                        }
                        if(type != ""){
                            // ok, now break out each part of the address
                            var parts = value.split(";");
                            var addrKeys = ["pobox", "", "address", "city", "state", "zip", "country"];
                            for(var i in parts){
                                if(addrKeys[i] == "") continue;
                                if(parts[i] != "")
                                    vcard[addrKeys[i]+"-"+type] = parts[i];
                            }
                        }
                    }
                    else if(keys[key] == "phone"){
                        //import phone
                        var type="";
                        if(!params){
                            type = "home";
                        }else{
                            type = parseType(params);
                        }
                        if(type != ""){
                            vcard["phone-"+type] = value;
                        }
                    }
                    else if(keys[key]){
                        vcard[keys[key]] = value;
                        lastKey = keys[key];
                    }
                });
                dojo.forEach(vcards, dojo.hitch(store, "newItem"));
                store.save();
            }, onError);
        }
    });
})();
