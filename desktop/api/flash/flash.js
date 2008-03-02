dojo.require("dojox.flash");
if (dojox.flash.info.commVersion != -1) {
	var basepath = "./api/flash/objManager";
	dojox.flash._visible = false;
	dojox.flash.addLoadedListener(function() {
		console.log("js:flash loaded");
	});
	dojox.flash.setSwf({
		flash6: basepath + "_version6.swf",
		flash8: basepath + "_version8.swf",
		visible: false
	});
}