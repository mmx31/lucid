dojo.provide("desktop.rpc");
dojo.require("dojo.rpc.JsonService");
(function() {
	var root = "backend/index.php/rpc/smd/class/";
	desktop.rpc = {
		core: {
			bootstrap: new dojo.rpc.JsonService(root+"Core_Bootstrap")
		}
	}
})();
