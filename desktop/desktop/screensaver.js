/**
* Contains all the screensaver functions of the desktop
* 
* @classDescription	Contains all the screensaver functions of the desktop
* @memberOf desktop
* @constructor	
*/
desktop.screensaver = new function()
{
	this.box = document.createElement("div");
	dojo.forEach([
		{n: "backgroundColor", v: "black"},
		{n: "opacity", v: 0},
		{n: "width", v: "100%"},
		{n: "height", v: "100%"},
		{n: "position", v: "absolute"},
		{n: "top", v: "0px"},
		{n: "left", v: "0px"},
		{n: "zIndex", v: 9999*9999}
	], dojo.hitch(this, function(e) {
		dojo.style(this.box, e.n, e.v);
	}));
	this.timeout = setTimeout(dojo.hitch(this, this.run), 1000*60*1);
	dojo.connect(document.body, "onmousemove", this, function() {
		clearTimeout(this.timeout);
		this.timeout = setTimeout(dojo.hitch(this, this.run), 1000*60*1);
	})
	this.run = function() {
		clearTimeout(this.timeout);
		document.body.appendChild(this.box);
		var anim = dojo.fadeIn({
			node: this.box,
			duration: 200
		});
		dojo.connect(anim, "onEnd", this, function() {
			this.moveEvent = dojo.connect(document.body, "onmousemove", this, this.stop);
		});
		anim.play();
	}
	this.stop = function() {
		dojo.disconnect(this.moveEvent);
		var anim = dojo.fadeOut({
			node: this.box,
			duration: 200
		});
		dojo.connect(anim, "onEnd", this, function() {
			document.body.removeChild(this.box);
		});
		anim.play();
	}
}