this.init = function(args) {
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.form.Slider");
	dojo.require("dijit.layout.LayoutContainer");
	dojo.require("dijit.layout.ContentPane");
	this.win = new api.Window({
		title: "Music Player",
		width: "500px",
		height: "150px",
		onClose: dojo.hitch(this, this.kill)
	});
	var toolbar = new dijit.Toolbar({layoutAlign: "top"});
	dojo.forEach([
		{
			label: "Open File",
			iconClass: "icon-16-actions-document-open",
			onClick: dojo.hitch(this, this.openFileDialog)
		},
		{
			label: "Open URL",
			iconClass: "icon-16-actions-document-open",
			onClick: dojo.hitch(this, this.openURLDialog)
		}
	], function(item) {
		toolbar.addChild(new dijit.form.Button(item));
	})
	this.win.addChild(toolbar);
	var volume = new dijit.form.VerticalSlider({
		onChange: dojo.hitch(this, function(val) {
			this.sound.volume(val);
			dojo.removeClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-high");
			dojo.removeClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-medium");
			dojo.removeClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-low");
			dojo.removeClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-muted");
			if(val == 0) {
				dojo.addClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-muted");
			}
			else if(val > 0 && val < 33) {
				dojo.addClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-low");
			}
			else if(val >= 33 && val <= 66) {
				dojo.addClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-medium");
			}
			else {
				dojo.addClass(this.ui.volume.iconNode, "icon-32-status-audio-volume-high");
			}
		}),
		value: 100,
		style: "height: 100px; background-color: white;"
	});
	this.ui = {
		play: new dijit.form.Button({
			iconClass: "icon-32-actions-media-playback-start",
			onClick: dojo.hitch(this, this.play),
			showLabel: false,
			label: "Play"
		}),
		stop: new dijit.form.Button({
			iconClass: "icon-32-actions-media-playback-stop",
			onClick: dojo.hitch(this, this.stop),
			showLabel: false,
			label: "Stop"
		}),
		ticker: document.createElement("div"),
		volume: new dijit.form.DropDownButton({
			dropDown: volume,
			label: "Volume",
			iconClass: "icon-32-status-audio-volume-high",
			showLabel: false
		}),
		slider: new dijit.form.HorizontalSlider({
			showButtons: false,
			style: "width: 100%;",
			onChange: dojo.hitch(this, this.skip)
		})
	};
	dojo.connect(this.ui.slider.domNode, "onmousedown", this, function() {
		this.stopTicker();
	});
	var ticker = this.ui.ticker;
	dojo.forEach([
		{p: "border", v: "1px solid gray"},
		{p: "backgroundColor", v: "black"},
		{p: "color", v: "gray"}
	], function(a){
		dojo.style(ticker, a.p, a.v);
	});
	ticker.innerHTML = "&nbsp;0:00/00:00&nbsp;";
	var client = new dijit.Toolbar({layoutAlign: "client"});
	for(name in this.ui) {
		var item = this.ui[name];
		if(item.declaredClass == "dijit.form.Button") {
			dojo.style(item.domNode, "width", "40px");
		}
		if (item.declaredClass) {
			client.addChild(item);
		}
		else {
			var box = this.box = new dijit.layout.ContentPane({}, item);
			client.addChild(box);
			dojo.removeClass(box.domNode, "dijitContentPane");
			dojo.addClass(box.domNode, "dijitInline");
		}
	}
	this.win.addChild(client);
	this.win.show();
	this.win.startup();
	if(args.file) this.open(args.file);
}
this.sound = false;
this.play = function() {
	if(this.sound) {
		this.is_playing=true;
		this.sound.play();
		if(this.sound.capabilities.pause) {
			dojo.removeClass(this.ui.play.iconNode, "icon-32-actions-media-playback-start");
			dojo.addClass(this.ui.play.iconNode, "icon-32-actions-media-playback-pause");
			this.ui.play.setLabel("Pause");
			this.ui.play.onClick = dojo.hitch(this, this.pause);
		}
		this.ui.play.startup();
		this.startTicker();
	}
}
this.pause = function() {
	if(this.sound && this.sound.capabilities.pause) {
		this.is_playing = false;
		this.sound.pause();
		dojo.removeClass(this.ui.play.iconNode, "icon-32-actions-media-playback-pause");
		dojo.addClass(this.ui.play.iconNode, "icon-32-actions-media-playback-start");
		this.ui.play.setLabel("Play");
		this.ui.play.onClick = dojo.hitch(this, this.play);
		this.stopTicker();
	}
}
this.skip = function(value) {
	if (!this.ignoreOnChange) {
		var d = this.sound.duration();
		this.sound.position((value / 100) * d);
		if(this.is_playing) {
			this.sound.play();
			this.startTicker();
		}
	}
}
this.stop = function() {
	if(this.sound) {
		this.is_playing = false;
		dojo.removeClass(this.ui.play.iconNode, "icon-32-actions-media-playback-pause");
		dojo.addClass(this.ui.play.iconNode, "icon-32-actions-media-playback-start");
		this.ui.play.setLabel("Play");
		this.ui.play.onClick = dojo.hitch(this, this.play);
		this.sound.stop();
		this.stopTicker();
		this.ui.slider.setValue(0);
	}
}
this.openURLDialog = function() {
	api.ui.inputDialog({
		title: "Open URL",
		callback: dojo.hitch(this, this.openURL)
	});
}
this.openURL = function(fileurl) {
	if ( fileurl) {
		this.sound = new api.Sound({
			src: fileurl
		});
		this.play();
		fileurl = fileurl.split("/");
		this.filename = fileurl.pop();
	}
}
this.openFileDialog = function() {
	api.ui.fileDialog({
		title: "Select audio file to open",
		callback: dojo.hitch(this, this.openFile)
	});
}
this.openFile = function(file) {
	if (file) {
		this.sound = new api.Sound({
			src: api.fs.embed(file)
		});
		this.play();
		file = file.split("/");
		this.filename = file.pop();
	}
}
this.startTicker = function() {
	if(!this.__ticker) this.__ticker = setInterval(dojo.hitch(this, "updateTicker"), 1000);
}
this.stopTicker = function() {
	clearInterval(this.__ticker);
	this.__ticker = false;
}
this.updateTicker = function() {
	var c = this.sound.capabilities;
	if(!(c.position && c.duration)) {
	this.box.domNode.innerHTML = "&nbsp;" + this.filename + "&nbsp;&nbsp;" + "?:??/?:??" + "&nbsp;";
	return;
	}
	var p = this.sound.position();
	var d = this.sound.duration();
	if(d==0) d = p+1;
	if(p == d) this.stop();
	this.ignoreOnChange=true;
	this.ui.slider.setValue(Math.floor((p/d)*100));
	this.ignoreOnChange=false;
	var pos = this.formatTime(p);
	var dur = this.formatTime(d);
	this.box.domNode.innerHTML = "&nbsp;" + this.filename + "&nbsp;&nbsp;" + pos + "/" + dur + "&nbsp;";
}
this.formatTime = function(ms) {
	var ts = ms/1000;
	var m = Math.floor((ts/60));
	var s = Math.floor(ts % 60);
	
	if (s == 60) { m++; s = 0; }
	return m+":"+(s < 10 ? "0"+s : s );
}
this.kill = function() {
	if(!this.win.closed) this.win.close();
	if(this.sound) this.sound.destroy();
	this.stopTicker();
}

