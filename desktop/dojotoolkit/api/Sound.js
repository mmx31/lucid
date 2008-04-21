dojo.require("dijit._Widget");
dojo.provide("api.Sound");

dojo.declare("api.Sound", dijit._Widget, {
	//	summary:
	//		An API that allows an app to play audio content.
	//		Abstracts between HTML5 audio tags, flash-based audio, and embed tags
	//	src: String
	//		The path to the sound file to play. (not on the filesystem, just a URL)
	src: "",
	//	loop: Boolean
	//		Should the sound loop?
	loop: false,
	//	autoStart: Boolean
	//		Should the sound start playing once it's loaded?
	autoStart: false,
	//	capabilities: Object
	//		What can the current backend do/have access to?
	capabilities: {
		play: true,
		pause: true,
		stop: true,
		duration: true,
		position: true,
		volume: true,
		id3: true
	},
	backend: null,
	postCreate: function() {
		this.domNode.style.position="absolute";
		this.domNode.style.left="-999px";
		this.domNode.style.top="-999px";
		document.body.appendChild(this.domNode);
		var backends = ["html", "flash", "embed"];
		for(var k in backends) {
			var i = backends[k];
			var backend = new api.Sound[i]({
				src: this.src,
				loop: this.loop,
				autoStart: this.autoStart
			});
			backend.id = this.id;
			if(backend.testCompat() === true) {
				this.backend = backend;
				this.capabilities = backend.capabilities;
				backend.domNode = this.domNode;
				this.backend.startup();
				break;
			}
		}
		dojo.forEach([
			"id3",
			"volume",
			"play",
			"pause",
			"stop",
			"position",
			"duration"
		], function(i) {
			this[i] = dojo.hitch(this.backend, i);
		}, this)
	},
	play: function() {
		//	summary:
		//		Play the sound
	},
	pause: function() {
		//	summary:
		//		Pause the sound
	},
	stop: function() {
		//	summary:
		//		Stop the sound
	},
	volume: function(/*Float|Int?*/volume) {
		//	summary:
		//		Set or get the volume
		//		When the volume argument is skipped, it will return the current volume
		//		Otherwise this function will set the volume.
		//	volume:
		//		the new volume (1 being the highest, 0 being the lowest)
	},
	position: function(/*Integer?*/position) {
		//	summary:
		//		Set or get the position
		//		When the position argument is skipped, it will return the current position
		//	position:
		//		the new position (in miliseconds)
	},
	duration: function() {
		//	summary:
		//		Returns the duration of the file (in miliseconds)
	},
	id3: function() {
		//	summary:
		//		Returns id3 information (if available)
	},
	uninitialize: function() {
		this.backend.uninitialize();
		document.body.removeChild(this.domNode);
	}
});

dojo.declare("api.Sound._backend", null, {
	//	summary:
	//		The base sound backend class
	//		Most of these properties are repeated in api.Sound, see that for more info
	id: "",
	//	domNode: domNode
	//	A domNode that things like embed elements can be added to
	domNode: null,
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
		//	summary:
		//		do startup tasks here such as embedding an applet
	},
	constructor: function(args) {
		this.src = args.src;
		this.loop = args.loop || false;
		this.autoStart = args.autoStart || false;
	},
	play: function() {},
	pause: function() {},
	stop: function() {},
	uninitialize: function() {
		//	summary:
		//		cleanup for when the class is destroyed
	},
	volume: function(/*Integer?*/volume) {},
	position: function(/*Integer?*/position) {},
	duration: function() {},
	id3: function() {},
	testCompat: function() {
		//	summary:
		//		test for compatibility
		//	returns:
		//		true when the backend is compatible with the environment (and will work)
		//		false when the backend is incompatible with the environment (and will not work)
		return true;
	}
});
	
dojo.declare("api.Sound.html", api.Sound._backend, {
	//	summary:
	//		Sound backend for the HTML5 audio tag
	//		See api.Sound._backend for more info
	htmlSound: null,
	testCompat: function() {
			return typeof Audio != "undefined";
	},
	startup: function() {
		this.htmlSound = new Audio(this.src);
		if(this.autoStart) this.htmlSound.autoPlay = true;
	},
	play: function() {
		this.htmlSound.play();
	},
	pause: function() {
		this.htmlSound.pause();
	},
	stop: function() {
		this.htmlSound.stop();
	},
	position: function(v) {
		if(v) this.htmlSound.currentTime = v;
		return this.htmlSound.currentTime;
	},
	duration: function() {
		return this.htmlSound.duration;
	},
	volume: function(l) {
		if(l) this.htmlSound.volume = l;
		return this.htmlSound.volume;
	},
	uninitialize: function() {
		this.stop();
	}
});
	
dojo.declare("api.Sound.flash", api.Sound._backend, {
	//	summary:
	//		Sound backend for adobe flash player
	//		See api.Sound._backend for more info
	_startPos: 0,
	playing: false,
	play: function() {
		dojox.flash.comm.callFunction(this.id, "start", [this._startPos, this.loop]);
		this.playing = true;
	},
	pause: function() {
		dojox.flash.comm.callFunction(this.id, "stop");
		this._startPos = this.position()/1000;
		this.playing = false;
	},
	stop: function() {
		this._startPos = 0;
		dojox.flash.comm.callFunction(this.id, "stop");
		this.playing = false;
	},
	position: function(v) {
		if(v) {
			this._startPos = v/1000;
			if(this.playing) this.play();
		}
		else {
			return dojox.flash.comm.getValue(this.id, "position");
		}
	},
	duration: function() {
		return dojox.flash.comm.getValue(this.id, "duration");
	},
	id3: function() {
		return dojox.flash.comm.getValue(this.id, "id3");
	},
	volume: function(val) {
		return dojox.flash.comm.callFunction(this.id, "setVolume", [val]);
	},
	checkCompat: function() {
		return dojox.flash.info.capable && typeof dojox.flash.comm.makeObj != "undefined";
	},
	startup: function() {
		dojox.flash.comm.makeObj(this.id, "Sound");
		dojox.flash.comm.callFunction(this.id, "loadSound", [this.src, true])
		//dojox.flash.comm.attachEvent(this.id, "onLoad");
	},
	uninitialize: function() {
		this.stop();
	}
});
	
dojo.declare("api.Sound.embed", api.Sound._backend, {
	//	summary:
	//		Sound backend for the embed tag
	//		There is a known issue where XHRs are cut off when the embed tag is created.
	//		We have no clue why this happens. If you know, please get in touch with us.
	//		See api.Sound._backend for more info
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
		this.stop();
	}
});
