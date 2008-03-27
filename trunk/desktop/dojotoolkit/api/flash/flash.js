dojo.provide("api.flash.flash");
dojo.require("dojox.flash");
if (dojox.flash.info.capable == true) {
	dojox.flash.addLoadedListener(function() {
		console.log("js:flash loaded");
	});
	dojox.flash.Embed.prototype.width = 1;
	dojox.flash.Embed.prototype.height = 1;
	dojox.flash.setSwf("./dojotoolkit/api/flash/objManager.swf", false);
}
