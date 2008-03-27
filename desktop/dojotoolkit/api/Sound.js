dojo.require("dijit._Widget");
dojo.provide("api.Sound");

/* 
 * Class: api.Sound
 * 
 * An API that allows an app to play audio content.
 * Abstracts between HTML5 audio tags, flash-based audio, and embed tags
 */
dojo.declare("api.Sound", dijit._Widget, {
	/*
	 * Property: src
	 * 
	 * The path to the sound file to play. (not on the filesystem, just a URL)
	 */
	src: "",
	/*
	 * Property: loop
	 * 
	 * Should the sound loop?
	 */
	loop: false,
	/*
	 * Property: autoStart
	 * 
	 * Should the sound start playing once it's loaded?
	 */
	autoStart: false,
	/*
	 * Property: capabilities
	 * 
	 * What can the current backend do/have access to?
	 */
	capabilities: {
		play: true,
		pause: true,
		stop: true,
		duration: true,
		position: true,
		volume: true,
		id3: true
	},
	/*
	 * Property: backend
	 * 
	 * The current backend being used. Meant to be used internally
	 */
	backend: null,
	postCreate: function() {
		this.domNode.style.position="absolute";
		this.domNode.style.left="-999px";
		this.domNode.style.top="-999px";
		document.body.appendChild(this.domNode);
		var backends = ["html", "flash", "embed"];
		for(k in backends) {
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
	/*
	 * Method: play
	 * 
	 * Play the sound
	 */
	play: function() {},
	/*
	 * Method: pause
	 * 
	 * Pause the sound
	 */
	pause: function() {},
	/*
	 * Method: stop
	 * 
	 * Stop the sound
	 */
	stop: function() {},
	/*
	 * Method: volume
	 * Set or get the volume
	 * 
	 * Arguments:
	 * 		volume - the new volume (1 being the highest, 0 being the lowest)
	 * 		
	 * 		When the volume argument is skipped, it will return the current volume
	 */
	volume: function(/*Integer?*/volume) {},
	/*
	 * Method: position
	 * Set or get the position
	 * 
	 * Arguments:
	 * 		position - the new position (in miliseconds)
	 * 		
	 * 		When the position argument is skipped, it will return the current position
	 */
	position: function(/*Integer?*/position) {},
	/*
	 * Method: duration
	 * Returns the duration of the file (in miliseconds)
	 */
	duration: function() {},
	/*
	 * Method: id3
	 * Returns id3 information
	 */
	id3: function() {},
	uninitialize: function() {
		this.backend.uninitialize();
		document.body.removeChild(this.domNode);
	}
});

/*
 * Class: api.Sound._backend
 * 
 * The base sound backend class
 */
dojo.declare("api.Sound._backend", null, {
	id: "",
	/*
	 * Property: domNode
	 * 
	 * A domNode that things like embed elements can be added to
	 */
	domNode: null,
	/*
	 * Property: src
	 * 
	 * The path to the sound file to play. (not on the filesystem, just a URL)
	 */
	src: "",
	/*
	 * Property: loop
	 * 
	 * Should the sound loop?
	 */
	loop: false,
	/*
	 * Property: autoStart
	 * 
	 * Should the sound start playing once it's loaded?
	 */
	autoStart: false,
	/*
	 * Property: capabilities
	 * 
	 * What can this backend do/have access to?
	 */
	capabilities: {
		play: true,
		pause: true,
		stop: true,
		duration: true,
		position: true,
		volume: true,
		id3: true
	},
	/*
	 * Method: startup
	 * 
	 * do startup tasks here such as embedding an applet
	 */
	startup: function() {
	},
	constructor: function(args) {
		this.src = args.src;
		this.loop = args.loop || false;
		this.autoStart = args.autoStart || false;
	},
	/*
	 * Method: play
	 * 
	 * Play the sound
	 */
	play: function() {},
	/*
	 * Method: pause
	 * 
	 * Pause the sound
	 */
	pause: function() {},
	/*
	 * Method: stop
	 * 
	 * Stop the sound
	 */
	stop: function() {},
	/*
	 * Method: uninitailize
	 * 
	 * cleanup for when the class is destroyed
	 */
	uninitialize: function() {},
	/*
	 * Method: volume
	 * Set or get the volume
	 * 
	 * Arguments:
	 * 		volume - the new volume (1 being the highest, 0 being the lowest)
	 * 		
	 * 		When the volume argument is skipped, it will return the current volume
	 */
	volume: function(/*Integer?*/volume) {},
	/*
	 * Method: position
	 * Set or get the position
	 * 
	 * Arguments:
	 * 		position - the new position (in miliseconds)
	 * 		
	 * 		When the position argument is skipped, it will return the current position
	 */
	position: function(/*Integer?*/position) {},
	/*
	 * Method: duration
	 * Returns the duration of the file (in miliseconds)
	 */
	duration: function() {},
	/*
	 * Method: id3
	 * Returns id3 information
	 */
	id3: function() {},
	/*
	 * Method: testCompat
	 * 
	 * test for compatiblility
	 * Returns:
	 * 		true - the backend is compatible with the environment (and will work)
	 * 		false - the backend is incompatible with the environment (and will not work)
	 */
	testCompat: function() {
		return true;
	}
});
	
/*
 * Class: api.Sound.html
 * 
 * Sound backend for the HTML5 audio tag
 * 
 * See:
 * 		<_backend>
 */
dojo.declare("api.Sound.html", api.Sound._backend, {
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
	
/*
 * Class: api.Sound.flash
 * 
 * Sound backend for a flash player
 * 
 * See:
 * 		<_backend>
 */
dojo.declare("api.Sound.flash", api.Sound._backend, {
	_startPos: 0,
	playing: false,
	play: function() {
		dojox.flash.comm.callFunction(this.id, "start", [this._startPos, this.loop]);
		this.playing = true;
	},
	pause: function() {
		dojox.flash.comm.callFunction(this.id, "stop");
		this._startPos = this.position();
		this.playing = false;
	},
	stop: function() {
		this._startPos = 0;
		dojox.flash.comm.callFunction(this.id, "stop");
		this.playing = false;
	},
	position: function(v) {
		if(v) {
			this._startPos = v;
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
		return dojox.flash.info.capable && typeof dojox.flash.comm.makeObj == "function";
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
	
/*
 * Class: api.Sound.embed
 * 
 * Sound backend for embed tags.
 * There is a known issue where XHRs are cut off when the embed tag is created.
 * We have no clue why this happens. If you know, please get in touch with us.
 * 
 * See:
 * 		<_backend>
 */
dojo.declare("api.Sound.embed", api.Sound._backend, {
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
