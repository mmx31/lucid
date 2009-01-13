dojo.provide("desktop.apps.FileBrowser");
dojo.require("dijit.Toolbar");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.SplitContainer");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.Dialog");
dojo.require("dojox.form.FileUploader");
desktop.addDojoCss("dojox/form/resources/FileInput.css");
dojo.require("dojox.widget.FileInputAuto");
dojo.requireLocalization("desktop", "common");
dojo.requireLocalization("desktop", "apps");
dojo.requireLocalization("desktop", "places");
dojo.requireLocalization("desktop.widget", "filearea");

dojo.declare("desktop.apps.FileBrowser", desktop.apps._App, {
	windows: [],
	init: function(args)
	{
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		var places = dojo.i18n.getLocalization("desktop", "places");
		var sys = dojo.i18n.getLocalization("desktop", "system");
		this.win = new desktop.widget.Window({
			title: app["File Browser"],
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
		});
		this.fileArea = new desktop.widget.FileArea({path: (args.path || "file://"), region: "center"});
        this.updateTitle(this.fileArea.path);
        this.fileArea.refresh();
		this.pane = new dijit.layout.ContentPane({region: "left", splitter: true, minSize: 120, style: "width: 120px;"});
		var menu = new dijit.Menu({
			style: "width: 100%;"
		});
		dojo.forEach(desktop.config.filesystem.places, function(item){
			var item = new dijit.MenuItem({label: places[item.name] || item.name,
				iconClass: item.icon || "icon-16-places-folder",
				onClick: dojo.hitch(this.fileArea, "setPath", item.path)
			});
			menu.addChild(item);
		}, this);
		this.pane.setContent(menu.domNode);
		this.win.addChild(this.pane);
		this.win.addChild(this.fileArea);
		
		this.pathbar = new dijit.Toolbar({region: "center"});
		this.pathbox = new dijit.form.TextBox({
			style: "width: 90%;",
			value: args.path || "file://"
		});
		dojo.connect(this.fileArea, "onPathChange", this, function(){
			this.pathbox.setValue(this.fileArea.path);
			this.fixUploadPath(this.fileArea.path);
			this.statusbar.attr("label", "&nbsp;");
            this.updateTitle(this.fileArea.path);
		});
		this.pathbar.addChild(this.pathbox);
		this.goButton = new dijit.form.Button({
			label: cm.go,
			onClick: dojo.hitch(this, function(){
				this.fileArea.setPath(this.pathbox.getValue());
			})
		});
		this.pathbar.addChild(this.goButton);
		
		
		this.toolbar = new dijit.Toolbar({region: "top"});
			var button = new dijit.form.Button({
				onClick: dojo.hitch(this.fileArea, function(){
					this.setPath("file://");
				}),
				iconClass: "icon-16-places-user-home",
				label: places.Home
			});
			this.toolbar.addChild(button);
			var button = new dijit.form.Button({
				onClick: dojo.hitch(this.fileArea, this.fileArea.up),
				iconClass: "icon-16-actions-go-up",
				label: cm.up
			});
			this.toolbar.addChild(button);
			var button = new dijit.form.Button({
				onClick: dojo.hitch(this.fileArea, this.fileArea.refresh),
				iconClass: "icon-16-actions-view-refresh",
				label: cm.refresh
			});
			this.toolbar.addChild(button);
			this.quotabutton = new dijit.form.Button({
				onClick: dojo.hitch(this, "quotaNotice"),
				iconClass: "icon-16-devices-drive-harddisk",
				label: sys.quota
			});
			this.toolbar.addChild(this.quotabutton);
            this.makeUploadButton();
			var load = this.loadNode = document.createElement("div");
			dojo.addClass(load, "icon-loading-indicator");
			dojo.style(load, {
				display: "none",
				position: "absolute",
				top: "0px",
				right: "0px",
				margin: "7px"
			});
			this.toolbar.domNode.appendChild(load);
			
			dojo.connect(this.fileArea, "_loadStart", this, function(){
				dojo.style(load, "display", "block");
			});
			dojo.connect(this.fileArea, "_loadEnd", this, function(){
				dojo.style(load, "display", "none");
			});
		
		var bCont = new dijit.layout.BorderContainer({
			region: "top",
			gutters: false,
			style: "height: 42px;"	//This is really fucked up, since themes may use different heights for toolbars.
									//If BorderContainer ever supports more then one widget in one slot, please fix this.
		})
		bCont.addChild(this.toolbar);
		bCont.addChild(this.pathbar);
		this.win.addChild(bCont);
		// Status bar
		this.statusbar = new desktop.widget.StatusBar({region: "bottom"});
		this.win.addChild(this.statusbar);
		this.win.show();
		bCont.startup();
        this.win.resize();
		setTimeout(dojo.hitch(this, "makeUploader"), 1000);
	},
    updateTitle: function(path){
        var folders = path.split("/");
        var text = folders[folders.length-1] || folders[folders.length-2] || path;
        var app = dojo.i18n.getLocalization("desktop", "apps");
        this.win.attr("title", text + " - "+app["File Browser"]);
    },
	quotaNotice: function(){
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var sys = dojo.i18n.getLocalization("desktop", "system");
		if(typeof(this.quotaWin) != "undefined"){ if(!this.quotaWin.closed){ return; } }
		desktop.filesystem.getQuota(this.fileArea.path, dojo.hitch(this, function(values){
			values.total = Math.round(values.total / 1024); values.remaining = Math.round(values.remaining / 1024); values.used = Math.round(values.used / 1024); 
			this.quotaWin = new desktop.widget.Window({
				title: sys.quota,
				resizable: false,
				height: "75px",
				width: "175px"
			});
			this.windows.push(this.quotaWin);
			var content = new dijit.layout.ContentPane({});
			var central = document.createElement("div");
			central.innerHTML = cm.total+": "+values.total+"kb<br>";
			central.innerHTML += cm.used+": "+values.used+"kb<br>";
			central.innerHTML += cm.remaining+": "+values.remaining+"kb";
            // TODO: get a progress bar in here?
			content.setContent(central);
			this.quotaWin.addChild(content);
			this.quotaWin.show();
			this.quotaWin.startup();
		}));
	},
	makeUploader: function(){
	    this.uploader = new dojox.form.FileUploader({
		    button: this.upbutton,
		    degradable: true,
		    //uploadUrl: desktop.xhr("api.fs.io.upload")+"&path="+encodeURIComponent(this.fileArea.path),
            uploadUrl: desktop.xhr("api.fs.io.upload")+"?path="+encodeURIComponent(this.fileArea.path),
		    uploadOnChange: true,
            selectMultipleFiles: true
		});
        if(dojox.embed.Flash.available > 9){
            //fix button (workaround)
            this.fixButton();
            dojo.connect(this.uploader, "_connectInput", this, "fixButton");
        }
        this.doUploaderConnects();
	},
	
    fixButton: function(){
        var node = this.uploader.fileInputs[0];
        console.log(node);
        setTimeout(dojo.hitch(this, function(){
            var butNode = this.upbutton.domNode;
            var upNode = this.uploader._formNode;
            butNode.appendChild(upNode);
            dojo.style(butNode, "position", "relative");
            var right = node.offsetWidth-butNode.offsetWidth
            dojo.style(node, {
                top: "0px",
                left: "-"+right+"px",
                clip: "rect(0px, "+right-butNode.offsetWidth+"px, "+butNode.offsetHeight+"px, "+right+"px)"
            });
            dojo.style(node.parentNode, {position: "absolute", top: "0px", left: "0px"});
            dojo.query("span.dijitReset.dijitRight.dijitInline", this.upbutton.domNode).style("position", "relative");
        }), 500);
    },

    makeUploadButton: function(){
        if(this.upbutton)
            this.upbutton.destroy();
        var cm = dojo.i18n.getLocalization("desktop", "common");
        this.upbutton = new dijit.form.Button({
			iconClass: "icon-16-actions-mail-send-receive",
			label: cm.upload
		});
		this.toolbar.addChild(this.upbutton);
    },

	fixUploadPath: function(path){
	    var loc = window.location.href.split("/");
		loc.pop();
		loc = loc.join("/")+"/";
        //var newUrl = loc+desktop.xhr("api.fs.io.upload")+"&path="+encodeURIComponent(this.fileArea.path);
        var newUrl = loc+desktop.xhr("api.fs.io.upload")+"?path="+encodeURIComponent(this.fileArea.path);
		this.uploader.uploadUrl = newUrl;
		if(this.uploader.flashObject){
            this.uploader.destroy();
            this.makeUploadButton();
            this.makeUploader();
        }
	},
	
	doUploaderConnects: function(){
		var nls = dojo.i18n.getLocalization("desktop.widget", "filearea");
	    var uploader = this.uploader;
	    dojo.connect(uploader, "onChange", this, function(dataArray){
	       this.statusbar.attr({
	            label: nls.uploading.replace("%s", dataArray.length),
	            showProgress: true
	       });
	       this.statusbar.update({
	            indeterminate: true
	       });
	    });
	    dojo.connect(uploader, "onProgress", this, function(dataArray){
	        var progress = 0;
	        var total = 0;
	        dojo.forEach(dataArray, function(file){
	            progress += file.bytesLoaded;
	            total += file.bytesTotal;
	        });
	        this.statusbar.update({
	            indeterminate: false,
	            progress: progress,
	            maximum: total
	        });
            //workaround
            if(progress >= total) uploader.onComplete([{status: "success"}]);
	    });
	    uploader.onComplete = dojo.hitch(this, function(data){
	        if(data[data.length-1].status == "success"){
	           this.statusbar.attr({
	                label: nls.uploadingComplete,
	                showProgress: false
	           });
	           this.fileArea.refresh();
	        }else{
	           this.statusbar.attr({
	                label: "Error: "+data.details,
	                showProgress: false
	           });
	        }
	    });
        dojo.connect(uploader, "onError", this, function(data){
            this.statusbar.attr({
                label: "Error",
                showProgress: false
            });
        });
	},
	
	kill: function(){
		if(!this.win.closed){ this.win.close(); }
		dojo.forEach(this.windows, function(win){
			if(!win.closed) win.close();
		});
	}
})
