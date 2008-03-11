dojo.require("dojox.flash");
if (dojox.flash.info.commVersion != -1) {
	dojox.flash._visible = false;
	dojox.flash.addLoadedListener(function() {
		console.log("js:flash loaded");
	});
	dojox.flash.setSwf("./api/flash/objManager.swf", false);
}