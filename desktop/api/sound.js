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
	loop: false,
	autoStart: false,
	backend: null,
	postCreate: function() {
		this.domNode.style.position="absolute";
		this.domNode.style.left="-999px";
		this.domNode.style.top="-999px";
		document.body.appendChild(this.domNode);
		
		dojo.forEach(["html", "flash", "embed"], function(i) {
			if(api.sound[i].prototype.testCompat() === true) {
				this.backend = new api.sound[i]({
					src: this.src,
					loop: this.loop,
					autoStart: this.autoStart
				});
			}
		})
	},
	getId3: function() {
		return this.backend.getId3();
	},
	setVolume: function(val) {
		return this.volume.setVolume(val);
	},
	getVolume: function(val) {
		return this.backend.getVolume();
	},
	play: function() {
		return this.backend.play();
	},
	getPosition: function() {
		return this.backend.getPosition();
	},
	getDuration: function() {
		return this.backend.getDuration();
	},
	pause: function() {
		return this.backend.pause();
	},
	stop: function() {
		return this.backend.stop();
	},
	uninitialize: function() {
		this.backend.uninitialize();
		document.body.removeChild(this.domNode);
	}
});

dojo.declare("api.sound._backend", null, {
	src: "",
	loop: false,
	autoStart: false,
	capabilities: {
		play: true,
		pause: true,
		stop: true,
		duration: true,
		position: true,
		volume: true,
		id3: true
	},
	startup: function() {
		//do startup tasks here such as embedding an applet
	},
	constructor: function(args) {
		this.src = args.src;
		this.loop = args.loop || false;
		this.autoStart = args.autoStart || false;
		this.startup();
		if(this.autoStart) this.play();
	},
	play: function() {},
	pause: function() {},
	stop: function() {},
	uninitialize: function() {},
	getVolume: function() {},
	setVolume: function() {},
	getPosition: function() {},
	setPosition: function() {},
	getDuration: function() {},
	testCompat: function() {
		//test for compatiblility
		return true;
	}
});
	
dojo.declare("api.sound.html", api.sound._backend, {
	htmlSound: null,
	testCompat: function() {
		return typeof Audio != "undefined";
	},
	startup: function() {
		this.htmlSound = new Audio(this.src);
	},
	play: function() {
		this.htmlSound.play();
	}
});
	
dojo.declare("api.sound.flash", api.sound._backend, {
	_startPos: 0,
	flReady: false,
	play: function() {
		if(this.flReady) return this.flSound.getDuration();
	},
	pause: function() {
		this.flSound.stop();
		this._startPos = this.getPosition() / 1000;
	},
	stop: function() {
		this._startPos = 0;
		this.flSound.stop();
	},
	getPosition: function() {
		return this.flSound.getPosition();
	},
	getDuration: function() {
		if(this.flReady) return this.flSound.getDuration();
	},
	
	getId3: function() {
		if(this.flReady) return this.flSound.getId3();
	},
	setVolume: function(val) {
		if(this.flReady) return this.flSound.setVolume(val);
	},
	getVolume: function(val) {
		if(this.flReady) return this.flSound.getVolume(val);
	},
	checkCompat: function() {
		
	},
	startup: function() {
		
	}
});
	
dojo.declare("api.sound.embed", api.sound._backend, {
	capabilities: {
		play: true,
		pause: false,
		stop: true,
		duration: false,
		position: true,
		volume: false,
		id3: false
	},
	timeInterval: 1000,
	timer: null,
	play: function() {
		if (this.domNode.innerHTML != "") 
			this.stop();
		this.position = 0;
		this.domNode.innerHTML = "<embed src=\"" + this.src + "\" hidden=\"true\" autoplay=\"true\" loop=\"" + (this.loop ? "true" : "false") + "\">";
		this.timer = setInterval(dojo.hitch(this, this.fixtime), this.timeInterval);
	},
	fixtime: function() {
		this.position += this.timeInterval;
	},
	stop: function() {
		clearInterval(this.timer);
		this.domNode.innerHTML = "";
	},
	uninitialize: function() {
		clearInterval(this.timer);
	}
});
