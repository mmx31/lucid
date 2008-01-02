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
	time: 0,
	startTime: 0,
	timeInterval: 1000,
	postCreate: function() {
		var requiredVersion = new com.deconcept.PlayerVersion([8,0,0]);
		var installedVersion = com.deconcept.FlashObjectUtil.getPlayerVersion();
		this.flash=installedVersion.versionIsValid(requiredVersion);
	},
	play: function() {
		if (!this.flash) {
			if (this.domNode.innerHTML != "") 
				this.stop();
			this.time = 0;
			this.domNode.innerHTML = "<embed src=\"" + this.src + "\" hidden=\"true\" autoplay=\"true\" loop=\"" + (this.loop ? "true" : "false") + "\">";
			api.soundmanager.container.appendChild(this.domNode);
			this.timer = setInterval(dojo.hitch(this, this.fixtime), this.timeInterval);
		}
		else {
			//aflax
		}
	},
	pause: function() {
		if(!this.flash) {
			this.stop();
		}
		else {
			//aflax
		}
	},
	fixtime: function() {
		this.time += this.timeInterval;
	},
	stop: function() {
		if (!this.flash) {
			clearInterval(this.timer);
			this.domNode.innerHTML = "";
		}
		else {
			//aflax
		}
	},
	uninitialize: function() {
		api.soundmanager.container.removeChild(this.domNode);
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
