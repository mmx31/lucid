if(!dojo._hasResource["dojox.storage._common"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.storage._common"] = true;
dojo.provide("dojox.storage._common");
dojo.require("dojox.storage.Provider");
dojo.require("dojox.storage.manager");

if(djConfig.offlineProfile){
  dojo.require("dojox.storage.GearsStorageProvider");
}else{
  dojo.require("dojox.storage.GearsStorageProvider");
  dojo.require("dojox.storage.WhatWGStorageProvider");
  dojo.require("dojox.storage.FlashStorageProvider");
}

// now that we are loaded and registered tell the storage manager to
// initialize itself
dojox.storage.manager.initialize();

}
