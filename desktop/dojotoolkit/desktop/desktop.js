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
	
	dojo.addOnLoad(function() {
		dojo.forEach(modules, function(module) {
			callIfExists(module, "draw");
		});
		dojo.forEach(modules, function(module) {
			callIfExists(module, "init");
		});
	});
})();
