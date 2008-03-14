dojo.require("dojox.flash");
if (dojox.flash.info.commVersion != -1) {
	dojox.flash.addLoadedListener(function() {
		console.log("js:flash loaded");
	});
	dojox.flash.Embed.prototype = {
		width: 1,
		height: 1
	};
	dojox.flash.setSwf("./api/flash/objManager.swf", false);
}