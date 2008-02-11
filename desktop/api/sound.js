/* 
 * Group: api
 * 
 * Package: sound
 * 
 * Summary:
 * 		An API that allows an app to play audio content.
 */
dojo.require("dijit._Widget");
dojo.provide("api.sound");
dojo.declare("api.sound", dijit._Widget, {
	src: "",
	method: "embed",
	htmlSound: null,
	loop: false,
	timer: null,
	position: 0,
	startTime: 0,
	timeInterval: 1000,
	autoStart: false,
	flash: false,
	_startPos: 0,
	flReady: false,
	flSound: {},
	_aflax: {},
	postCreate: function() {
		this.domNode.style.position="absolute";
		this.domNode.style.left="-999px";
		this.domNode.style.top="-999px";
		document.body.appendChild(this.domNode);
		if(typeof Audio != "undefined") {
			this.method = "sound";
			this.htmlSound = new Audio(this.src);
		}
		else if(this.flash) {
			this.method = "flash";
		}
		else {
			this.method = "embed";
		}
	},
	getId3: function() {
		if(this.flReady && this.flash) return this.flSound.getId3;
		else return false;
	},
	setVolume: function(val) {
		if(this.flReady && this.flash) return this.flSound.setVolume(val);
		else return false;
	},
	getVolume: function(val) {
		if(this.flReady && this.flash) return this.flSound.getVolume(val);
		else return false;
	},
	play: function() {
		if (this.method == "flash") {
		}
		else if(this.method == "html") {
			this.htmlSound.play();
		}
		else {
			if (this.domNode.innerHTML != "") 
				this.stop();
			this.position = 0;
			this.domNode.innerHTML = "<embed src=\"" + this.src + "\" hidden=\"true\" autoplay=\"true\" loop=\"" + (this.loop ? "true" : "false") + "\">";
			this.timer = setInterval(dojo.hitch(this, this.fixtime), this.timeInterval);
		}
		
	},
	getPosition: function() {
		if (this.method == "flash") {
			return this.flSound.getPosition();
		}
		else if(this.method == "html") {
			this.htmlSound
		}
		else {
			return this.position;
		}
	},
	getDuration: function() {
		if (this.flReady && this.flash) {
			return this.flSound.getDuration();
		}
		else {
			return 0;
		}
	},
	pause: function() {
		if(!this.flash) {
			this.stop();
		}
		else {
			this.flSound.stop();
			this._startPos = this.getPosition() / 1000;
		}
	},
	fixtime: function() {
		this.position += this.timeInterval;
	},
	stop: function() {
		if (!this.flash) {
			clearInterval(this.timer);
			this.domNode.innerHTML = "";
		}
		else {
			this._startPos = 0;
			this.flSound.stop();
		}
	},
	uninitialize: function() {
		document.body.removeChild(this.domNode);
		if(!this.flash) clearInterval(this.timer);
	}
});
	
