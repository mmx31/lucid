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
	timer: null,
	position: 0,
	startTime: 0,
	timeInterval: 1000,
	postCreate: function() {
		var requiredVersion = new com.deconcept.PlayerVersion([8,0,0]);
		var installedVersion = com.deconcept.FlashObjectUtil.getPlayerVersion();
		this.flash=installedVersion.versionIsValid(requiredVersion);
		if(this.flash) {
			var aflax = new api.aflax();
			this.flSound = new api.aflax.FlashObject(aflax, this.id+"_Flash");
			this.flSound.exposeFunction("loadSound", this.flSound);		
			this.flSound.exposeFunction("start", this.flSound);		
			this.flSound.exposeFunction("stop", this.flSound);		
			this.flSound.exposeFunction("setVolume", this);		
			this.flSound.exposeProperty("position", this);
		
			this.flSound.mapFunction("addEventHandler");		
		
			this.flSound.addEventHandler("onLoad", dojo.hitch(this, this.ready));
		
			this.flSound.loadSound(this.src, true);
		}
	},
	ready: function() {
		this.flReady = true;
	},
	_startPos: 0,
	flReady: false,
	play: function() {
		if (!this.flash) {
			if (this.domNode.innerHTML != "") 
				this.stop();
			this.position = 0;
			this.domNode.innerHTML = "<embed src=\"" + this.src + "\" hidden=\"true\" autoplay=\"true\" loop=\"" + (this.loop ? "true" : "false") + "\">";
			api.soundmanager.container.appendChild(this.domNode);
			this.timer = setInterval(dojo.hitch(this, this.fixtime), this.timeInterval);
		}
		else {
			if(this.flReady) {
				this.flSound.start(this._startPos);
				this._startPos = 0;
			}
			else setTimeout(dojo.hitch(this, this.play), 100);
		}
	},
	pause: function() {
		if(!this.flash) {
			this.stop();
		}
		else {
			this._startPos = this.flSound.position;
			this.flSound.stop();
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
		api.soundmanager.container.removeChild(this.domNode);
		if(!this.flash) clearInterval(this.timer);
	}
});

/* 
 * Group: api
 * 
 * Package: soundmanager
 * 
 * Summary:
 * 		An API that allows an app to play audio content.
 */

 api.soundmanager = new function() {
 	this.draw = function() {
		this.container = document.createElement("div");
		this.container.style.position="absolute";
		this.container.style.left="-999px";
		this.container.style.top="-999px";
		document.body.appendChild(this.container);
	}
 }
