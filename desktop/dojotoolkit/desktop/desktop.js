dojo.provide("desktop._base");
dojo.require("api._base");
dojo.require("desktop.admin");
dojo.require("desktop.app");
dojo.require("desktop.config");
dojo.require("desktop.theme");
dojo.require("desktop.ui");
dojo.require("desktop.user");
(function() {
	var modules = [
		'api._base',
		'api.Console',
		"api.crosstalk",
		"api.Registry",
		"api.Filearea",
		"api.fs",
		"api.ide",
		"api.mail",
		"api.Sound",
		"api.ui",
		"api.Window",
	    'desktop.admin',
	    'desktop.app',
	    'desktop.config',
	    'desktop.theme',
		'desktop.ui',
	    'desktop.user'
	]
	var callIfExists = function(object, method) {
		object = dojo.getObject(object);
		if(dojo.isFunction(object[method]))
		{
			object[method]();
		}
		else if(object.prototype && dojo.isFunction(object.prototype.draw)) {
			object.prototype[method]();
		}
	}
	var link = function(file, id)
        {
            var element = document.createElement("link");
            element.rel = "stylesheet";
            element.type = "text/css";
            element.media = "screen";
            element.href = file;
            element.id = id;
            document.getElementsByTagName("head")[0].appendChild(element);
        }
        link("desktop.css", "corestyle");
        link("./dojotoolkit/dijit/themes/dijit.css", "dijit");
        link("./dojotoolkit/dijit/themes/dijit_rtl.css", "dijit_rtl");
	dojo.addOnLoad(function() {
		api.xhr({
			backend: "core.bootstrap.check.loggedin",
			load: function(data, ioArgs) {
				if(data == "0")
				{
					dojo.forEach(modules, function(module) {
						callIfExists(module, "draw");
					});
					dojo.forEach(modules, function(module) {
						callIfExists(module, "init");
					});
				}
				else
				{
					history.back();
					window.close();
					document.body.innerHTML = "Not Logged In";
				}
			}
		});
	});
})();
