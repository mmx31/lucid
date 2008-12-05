dojo.provide("desktop.widget.FileArea");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit.Menu");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.Tree");
dojo.requireLocalization("desktop", "common");
dojo.requireLocalization("desktop.widget", "filearea");
dojo.requireLocalization("desktop", "apps");

desktop.widget._fileareaClipboard = {
	type: "", // can be 'cut' or 'copy
	path: "", //the parent directory of the file
	name: "", //the name of the file
	mimetype: "", //the file's mimetype
	widgetRef: null //a reference to the widget
};

dojo.declare("desktop.widget.FileArea", dijit.layout._LayoutWidget, {
	//	path: String
	//		the path that the filearea should start at
	path: "file://",
	//	textShadow: boolean
	//		Should the items have text shadows
	textShadow: false,
	//	vertical: boolean
	//		should the icons be arranged vertically? if not, then they are placed horizontally.
	vertical: false,
	//	subdirs: boolean
	//		should the desktop navigate through subdirs?
	subdirs: true,
	menu: null,
	postCreate: function(){
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var nf = dojo.i18n.getLocalization("desktop.widget", "filearea");
		
		this.connect(this.domNode, "onmousedown", "_onClick");
		this.connect(this.domNode, "oncontextmenu", "_onRightClick");
		
		if(dojo.isIE){
			this.connect(this.domNode,'onresize',"layout");
		}
		this.connect(window,'onresize',"layout");
		
		var sNode = this.scrollNode = document.createElement("div");
		dojo.style(sNode, "position", "relative");
		this.domNode.appendChild(sNode);
		dojo.style(this.domNode, "overflow", "auto");
		
		var menu = this.menu = new dijit.Menu({});
		menu.addChild(new dijit.MenuItem({label: nf.createFolder, iconClass: "icon-16-actions-folder-new", onClick: dojo.hitch(this, this._makeFolder)}));
		menu.addChild(new dijit.MenuItem({label: nf.createLauncher, onClick: dojo.hitch(this, this._makeLauncher)}));
		menu.addChild(new dijit.MenuItem({label: nf.createFile, iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, this._makeFile)}));
		menu.addChild(new dijit.MenuSeparator({}));
		menu.addChild(new dijit.MenuItem({label: cm.refresh, iconClass: "icon-16-actions-view-refresh", onClick: dojo.hitch(this, this.refresh)}));
		menu.addChild(new dijit.MenuSeparator({}));
		menu.addChild(new dijit.MenuItem({
			label: nf.paste,
			iconClass: "icon-16-actions-edit-paste",
			onClick: dojo.hitch(this, function(){
				var clip = desktop._fileareaClipboard;
				if(!clip) return;
				if(clip.type == "") return;
				var isParent = dojo.hitch(this, function(target, clip){
						if(clip.mimetype != "text/directory") return false; //can't be a parent if we're not a dir!
						var tPath = target.split("://");
						var sPath = clip.path.split("://");
						//if we're not even using the same protocol we can't be a parent of the target
						if(sPath[0] != tPath[0]) return false;
						sPath[1] += clip.name;
						tPath = tPath[1].split("/");
						sPath = sPath[1].split("/");
						var sCount = 0;
						var tCount = 0;
						var sFixedPath = "/";
						var tFixedPath = "/";
						while(sCount <= sPath.length-1 && tCount <= tPath.length-1){
							while(sPath[sCount] == "") sCount++;
							while(tPath[tCount] == "") tCount++;
							if(typeof tPath[tCount] == "undefined") tPath[tCount] = "";
							if(typeof sPath[sCount] == "undefined") sPath[sCount] = "";
							sFixedPath += sPath[sCount]+"/";
							tFixedPath += tPath[tCount]+"/";
							sCount++;
							tCount++;
						}
						if(tFixedPath.indexOf(sFixedPath) == 0) return true;
						return false;
					})
				if(clip.type == "cut"){
					var name = this._fixDuplicateFilename(clip.name, clip.mimetype);
					if(isParent(this.path+name, clip)) return desktop.dialog.notify({message: nf.parentErr, type: "warning", duration: 5000});
					this._loadStart();
					if(clip.widgetRef && clip.widgetRef.getParent().path == this.path) return;
					desktop.filesystem.move(clip.path+clip.name, this.path+name, dojo.hitch(this, function(){
						var parentID;
						if(clip.widgetRef){
							var p = clip.widgetRef.getParent();
							parentID = p.id
							this.addChild(clip.widgetRef);
							clip.widgetRef.name = name;
							clip.widgetRef.label = clip.widgetRef._formatLabel(name);
							clip.widgetRef.fixStyle();
							this.layout();
							p.layout();
						}
						dojo.publish("filearea:"+this.path, [this.id, parentID]);
						if(parentID) dojo.publish("filearea:"+p.path, [this.id, parentID]);
						this._loadEnd();
					}))
				}
				if(clip.type == "copy"){
					var name = this._fixDuplicateFilename(clip.name, clip.mimetype);
					if(isParent(this.path+name, clip)) return desktop.dialog.notify({message: nf.parentErr, type: "warning", duration: 5000});
					this._loadStart();
					desktop.filesystem.copy(clip.path+clip.name, this.path+name, dojo.hitch(this, function(){
						this._loadEnd();
						this.refresh();
						dojo.publish("filearea:"+this.path, [this.id]);
					}))
				}
			})
		}));
	},
	_loadStart: function(){
		//	summary:
		//		a hook for when the filearea begins to fetch data.
	},
	_loadEnd: function(){
		//	summary:
		//		a hook for when the filearea finishes to fetch data.
	},
	checkForFile: function(/*String*/name){
		//	summary:
		//		checks for a file in this directory with the name provided
		//	name: the full name (NOT the path) of the file
		//	returns: true if the file does exist, false if not.
		var children = this.getChildren();
		for(var i=0; i < children.length; i++){
			if(!children[i]) continue;
			if(children[i].name == name) return true;
		}
		return false;
	},
	onItem: function(/*String*/path)
	{
		//	summary:
		//		Called when an item is open
		//		You can overwrite this with your own function.
		//		Defaults to opening the file
		//	path:
		//		the path to the file
		desktop.app.launchHandler(path);
	},
	setPath: function(/*String*/path){
		//	summary:
		//		sets the path of the filearea and shows that path's contents
		//	path:
		//		the path to display
		//	returns:
		//		a normalized path
		//normalize the path
		var parts = path.split("://");
		var protocol = parts[0];
		var loc = parts.slice(1, parts.length).join("");
		if(parts.length == 1){
			protocol = "file";
			loc=path;
		}
		while(loc.indexOf("//") != -1){
			loc = loc.replace("//", "/");
		}
		if(loc.charAt(loc.length-1) != "/")
			loc += "/";
		if(loc.charAt(0) == "/")
			loc=loc.substring(1, loc.length);
		path = protocol+"://"+loc;
		if (this.subdirs){
			this.path = path;
			this.refresh();
			this.onPathChange(path);
		}
		else desktop.app.launchHandler(path);
		return path;
	},
	onPathChange: function(path){
		//	summary:
		//		Called when the path changes
	},
	onHighlight: function(path){
		//	summary:
		//		Called when a file is highlighted
	},
	up: function(){
		//	summary:
		//		make the filearea go up one directory
		var path = this.path.split("://");
		if(typeof path[1] == "undefined"){
			path = path[0];
			var protocol = "file";
		}
		else {
			path = path[1];
			var protocol = this.path.split("://")[0];
		} 
		if (path != "/"){
			dirs = path.split("/");
			if(path.charAt(path.length-1) == "/") dirs.pop();
			if(path.charAt(0) == "/") dirs.shift();
			dirs.pop();
			if(dirs.length == 0) this.setPath(protocol+"://");
			else this.setPath(protocol+"://"+dirs.join("/")+"/");
		}
	},
	_onClick: function(e)
	{
		var w = dijit.getEnclosingWidget(e.target);
		if (w.declaredClass == "desktop.widget.FileArea._Icon"){
			w._dragStart(e);
			if (dojo.hasClass(e.target, "fileIcon")) 
				w._onIconClick(e);
			else 
				if (!(dojo.hasClass(e.target, "shadowFront") ||
				dojo.hasClass(e.target, "shadowBack") ||
				dojo.hasClass(e.target, "iconLabel"))) 
					w._onIconClick(e);
		}
		else {
			//we could put a dragbox selection hook here
			dojo.forEach(this.getChildren(), function(item){
				item.unhighlight(e);
			})
		}
	},
	_makeFolder: function(){
		//	summary:
		//		Makes a folder in the current dir
		
		//TODO: Alert the user if that dir allready exists
		var nf = dojo.i18n.getLocalization("desktop.widget", "filearea");
		desktop.dialog.input({
			title: nf.createFolder,
			message: nf.createFolderText,
			onComplete: dojo.hitch(this, function(dirname){
				if(dirname == "") return;
				dirname = this._fixDuplicateFilename(dirname, "text/directory");
				desktop.filesystem.createDirectory(this.path+dirname, dojo.hitch(this, function(){
					dojo.publish("filearea:"+this.path, [this.id]);
					this.refresh();
				}));
			})
		});
	},
	_makeLauncher: function(){
		var nf = dojo.i18n.getLocalization("desktop.widget", "filearea");
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var appNls = dojo.i18n.getLocalization("desktop", "apps");
		var win = new desktop.widget.Window({
			title: nf.createLauncher,
			width: "300px",
			height: "200px"
		});
		var cpane = new dijit.layout.ContentPane({
			region: "center"
		});
		var div = document.createElement("div");
		
		var row0 = document.createElement("div");
		desktop.textContent(row0, nf.name+": ");
		var nameBox = new dijit.form.TextBox({});
		row0.appendChild(nameBox.domNode);
		div.appendChild(row0);
		
		var row1 = document.createElement("div");
		desktop.textContent(row1, nf.application+": ");
		var appItems = [];
		dojo.forEach(desktop.app.appList, function(item){
			appItems.push({
				label: appNls[item.name] || item.name,
				value: item.sysname
			});
		})
		var appBox = new dijit.form.FilteringSelect({
			autoComplete: true,
			searchAttr: "label",
			store: new dojo.data.ItemFileReadStore({
				data: {
					identifier: "value",
					items: appItems
				}
			})
		});
		row1.appendChild(appBox.domNode);
		div.appendChild(row1);
		
		var row2 = document.createElement("div");
		desktop.textContent(row2, nf.arguments+": ");
		var argBox = new dijit.form.TextBox({});
		row2.appendChild(argBox.domNode);
		div.appendChild(row2);
		cpane.setContent(div);
		win.addChild(cpane);
		
		//make bottom part
		
		var cpane = new dijit.layout.ContentPane({
			region: "bottom"
		});
		var div = document.createElement("div");
		dojo.style(div, "cssFloat", "right");
		var cancelButton = new dijit.form.Button({
			label: cm.cancel,
			onClick: dojo.hitch(win, "close")
		});
		div.appendChild(cancelButton.domNode);
		var okButton = new dijit.form.Button({
			label: cm.ok,
			onClick: dojo.hitch(this, function(){
				win.close();
				var name = nameBox.getValue();
				var app = appBox.getValue();
				var args = {};
				dojo.forEach(argBox.getValue().split("--"), function(text){
					var parsedArg = dojo.trim(text).split("=");
					if(parsedArg[0])
						args[parsedArg[0]] = parsedArg[1] || true;
				});
				desktop.filesystem.writeFileContents(
					this.path+this._fixDuplicateFilename(name+".desktop", "text/plain"),
					app+"\n"+dojo.toJson(args),
					dojo.hitch(this, function(){
						dojo.publish("filearea:"+this.path, [this.id]);
						this.refresh();
						win.close();
					})
				);
			})
		});
		div.appendChild(okButton.domNode);
		cpane.setContent(div);
		win.addChild(cpane);
		
		win.show();
	},
	_makeFile: function(){
		//	summary:
		//		Makes a file in the current dir
		
		//TODO: Alert the user if that file allready exists
		var nf = dojo.i18n.getLocalization("desktop.widget", "filearea");
		desktop.dialog.input({
			title: nf.createFile,
			message: nf.createFileText,
			onComplete: dojo.hitch(this, function(filename){
				if(filename == "") return;
				filename = this._fixDuplicateFilename(filename, "text/plain");
				desktop.filesystem.writeFileContents(this.path+filename, "", dojo.hitch(this, function(){
					dojo.publish("filearea:"+this.path, [this.id]);
					this.refresh();
				}));
			})
		});
	},
	_onRightClick: function(e)
	{
		//	summary:
		//		Event Handler
		//		passes click event to the appropriate child widget
		//		if a widget wasn't clicked on, we open our own menu
		var w = dijit.getEnclosingWidget(e.target);
		if(w.declaredClass == "desktop.widget.FileArea._Icon")
		{
			w.menu._contextMouse();
			w.menu._openMyself(e);
		}
		else
		{
			this.menu._contextMouse();
			this.menu._openMyself(e);
		}
	},
	refresh: function(/*String?*/id, /*String?*/targetid){
		//	summary:
		//		refreshes the area
		//	id:
		//		the id of the filearea that was updated. Used when other fileareas are communicating which folders are updated.
		//	targetid:
		//		the other id of the filearea that was updated. Used when other fileareas are communicating which folders are updated.
		
		//if we're the filearea telling everyone that we've updated, or if we were updated already, ignore it
		if(id == this.id || targetid == this.id) return;
		//subscribe to any file updates
		if(this._subscription) dojo.unsubscribe(this._subscription);
		this._subscription  = dojo.subscribe("filearea:"+this.path, dojo.hitch(this, "refresh"));
		
		//clear the area
		dojo.forEach(this.getChildren(), function(item){
			item.destroy();
		});
		//cancel the current xhr if there is one
		if(this._lsHandle) this._lsHandle.cancel();
		//list the path
		this._loadStart();
		this._lsHandle = desktop.filesystem.listDirectory(this.path, dojo.hitch(this, function(array){
			this._lsHandle = null;
			//make a new widget for each item returned
			dojo.forEach(array, function(item){
				var name = item.name;
				var p = name.lastIndexOf(".");
				var ext = name.substring(p+1, name.length);
				var icon = desktop.config.filesystem.icons[ext.toLowerCase()];
				var wid = new desktop.widget.FileArea._Icon({
					label: name,
					name: name,
					path: item.path,
					type: item.type,
					iconClass: (item.type=="text/directory" ? "icon-32-places-folder" : (icon || "icon-32-mimetypes-text-x-generic"))
				});
				this.addChild(wid);
				wid.startup();
			}, this);
			//invoke a layout so that everything is positioned correctly
			this.layout();
			this._loadEnd();
		}));
	},
	layout: function(){
		//	summary:
		//		Lays out the icons vertically or horizontally depending on the value of the 'vertical' property
		var width = this.domNode.offsetWidth;
		var height = this.domNode.offsetHeight;
		var hspacing = 100;
		var vspacing = 70;
		var wc = 0; //width counter
		var hc = 0; //height counter
		var children = this.getChildren();
		for(var key in children){
			var w = children[key];
			if(!w.declaredClass) continue;
			dojo.style(w.domNode, {
				position: "absolute",
				top: (this.vertical ? wc : hc)+"px",
				left: (!this.vertical ? wc : hc)+"px"
			});
			wc += (this.vertical ? vspacing : hspacing);
			if(wc >= (this.vertical ? height : width)-(this.vertical ? vspacing : hspacing)){
				wc = 0;
				hc += (this.vertical ? vspacing : hspacing);
			}
		};
		dojo.style(this.scrollNode, (this.vertical ? "height" : "width"), hc+"px");
	},
	_fixDuplicateFilename: function(name, type){
		var i=2;
		var nameOrig = name;
		//TODO: this could be bad if the filearea hasn't been refreshed recently...
		var p = name.lastIndexOf(".");
		var ext = name.substring(p+1, name.length);
		var hideExt = (type != "text/directory" && p != -1);
		if(hideExt){
			nameOrig = name.substring(0, p);
		}
		while(this.checkForFile(name)){
			name = nameOrig + " "+i;
			if(hideExt){
				name += "."+ext;
			}
			i++;
		}
		return name;
	}
})

dojo.declare("desktop.widget.FileArea._Icon", [dijit._Widget, dijit._Templated, dijit._Contained], {
	templatePath: dojo.moduleUrl("desktop.widget", "templates/Filearea_Item.html"),
	//	label: string
	//		The label shown underneath the icon
	label: "File",
	//	path: string
	//		the full path to the file this icon represents
	path: "file://File",
	//	type: string
	//		the mimetype of this file
	type: "text/directory",
	//	iconClass: string
	//		the CSS class of the icon displayed
	iconClass: "icon-32-places-folder",
	//	highlighted: boolean
	//		is the file currently highlighted? (read-only)
	highlighted: false,
	//	name: string
	//		the file's full name
	name: "File.txt",
	//	_clickOrigin: object
	//		the origin of the mouse when we are clicked. Used for DnD.
	_clickOrigin: {x: 0, y: 0},
	//	_docNode: domNode
	//		the domNode that is on the document. Used for DnD.
	_docNode: null,
	//	_dragTopicPublished: Boolean
	//		set to true when the icon has been dragged more then five pixels
	//		and the drag start topic has been published
	_dragTopicPublished: false,
	postCreate: function(){
		var nc = dojo.i18n.getLocalization("desktop", "common");
		var nf = dojo.i18n.getLocalization("desktop.widget", "filearea");
		
		this.connect(this.iconNode, "ondblclick", "_onDblClick");
		this.connect(this.labelNode, "ondblclick", "rename");
		
		dojo.query("*", this.labelNode).forEach(function(node){
			dojo.setSelectable(node, false);
		})
		
		var con = {};
		
		this._subscriptions = [
			dojo.subscribe("filearea:dragStart", dojo.hitch(this, function(){
				con.over = dojo.connect(this.domNode, "onmouseover", this, function(){
					if(this.type=="text/directory"){
						dojo.removeClass(this.iconNode, this.iconClass);
						dojo.addClass(this.iconNode, "icon-32-status-folder-drag-accept");
					}
				})
				con.out = dojo.connect(this.domNode, "onmouseout", this, function(){
					if(this.type=="text/directory"){
						dojo.removeClass(this.iconNode, "icon-32-status-folder-drag-accept");
						dojo.addClass(this.iconNode, this.iconClass);
					}
				})
			})),
			dojo.subscribe("filearea:dragStop", dojo.hitch(this, function(){
				if(this.type=="text/directory"){
					dojo.disconnect(con.over);
					dojo.disconnect(con.out);
					dojo.removeClass(this.iconNode, "icon-32-status-folder-drag-accept");
					dojo.addClass(this.iconNode, this.iconClass);
				}
			}))
		]
		
		var menu = this.menu = new dijit.Menu({});
		menu.addChild(new dijit.MenuItem({label: nc.open, iconClass: "icon-16-actions-document-open", onClick: dojo.hitch(this, "_onDblClick")}));
        menu.addChild(new dijit.MenuItem({label: nf.openWith, onClick: dojo.hitch(this, "_openWith")}));
			var menuDl = new dijit.PopupMenuItem({iconClass: "icon-16-actions-document-open", label: nc.download});
			var menu2 = new dijit.Menu({parentMenu: menuDl});
			menu2.addChild(new dijit.MenuItem({label: nf.asFile, onClick: dojo.hitch(this, function(e){
				desktop.filesystem.download(this.getParent().path+this.name);
			})}));
			menu2.addChild(new dijit.MenuItem({label: nf.asZip ,onClick: dojo.hitch(this, function(e){
				desktop.filesystem.download(this.getParent().path+this.name, "zip");
			})}));
			menu2.addChild(new dijit.MenuItem({label: nf.asTgz, onClick: dojo.hitch(this, function(e){
				desktop.filesystem.download(this.getParent().path+this.name, "gzip");
			})}));
			menu2.addChild(new dijit.MenuItem({label: nf.asTbz2, onClick: dojo.hitch(this, function(e){
				desktop.filesystem.download(this.getParent().path+this.name, "bzip");
			})}));
			menu2.startup();
			menuDl.popup = menu2;
			menu.addChild(menuDl);
		menu.addChild(new dijit.MenuSeparator({}));
		menu.addChild(new dijit.MenuItem({
			label: nf.cut,
			iconClass: "icon-16-actions-edit-cut",
			onClick: dojo.hitch(this, function(){
				desktop._fileareaClipboard = {
					type: "cut",
					path: this.getParent().path,
					name: this.name,
					mimetype: this.type,
					widgetRef: this
				}
			})
		}));
		menu.addChild(new dijit.MenuItem({
			label: nf.copy,
			iconClass: "icon-16-actions-edit-copy",
			onClick: dojo.hitch(this, function(){
				desktop._fileareaClipboard = {
					type: "copy",
					path: this.getParent().path,
					name: this.name,
					mimetype: this.type,
					widgetRef: this
				}
			})
		}));
		menu.addChild(new dijit.MenuSeparator({}));
		menu.addChild(new dijit.MenuItem({label: nc.rename, iconClass: "icon-16-apps-preferences-desktop-font", onClick: dojo.hitch(this, "rename")}));
		menu.addChild(new dijit.MenuItem({label: nc["delete"], iconClass: "icon-16-actions-edit-delete", onClick: dojo.hitch(this, "deleteFile")}));
		menu.startup();
	},
	uninitialize: function(){
		dojo.forEach(this._subscriptions, dojo.unsubscribe);
        if(typeof this._win != "undefined" && !this._win.closed)
            this._win.close();
	},
	_dragStart: function(e){
		if(e.button != (dojo.isIE ? 1 : 0)) return;
		this._clickOrigin = {x: e.clientX, y: e.clientY};
		this._docMouseUpEvent = dojo.connect(document, "onmouseup", this, "_onRelease");
		this._onDragEvent = dojo.connect(document, "onmousemove", this, "_onMove");
		this._docEvents = [
			dojo.connect(document, "ondragstart", dojo, "stopEvent"),
			dojo.connect(document, "onselectstart", dojo, "stopEvent")
		];
		dojo.stopEvent(e);
	},
	_onMove: function(e){
		//if the mouse hasn't moved at least five pixels, don't do anything
		if((Math.abs(e.clientX - this._clickOrigin.x) < 5
		|| Math.abs(e.clientY - this._clickOrigin.y) < 5)
		|| ((Math.abs(e.clientX - this._clickOrigin.x) < 5
		&& Math.abs(e.clientY - this._clickOrigin.y) < 5))) return;
		if(!this._dragTopicPublished){
			dojo.publish("filearea:dragStart", [this]);
			this._dragTopicPublished = true;
		}
		//if we haven't copied ourselves to the document yet, let's do that now
		if(!this._docNode){
			this._docNode = dojo.clone(this.domNode);
			dojo.style(this._docNode, {
				zIndex: 1000,
				position: "absolute"
			})
			dojo.addClass(this._docNode, "ghost");
			document.body.appendChild(this._docNode);
			dojo.style(document.body, "cursor", "move");
		}
		this._docNode.style.top=(e.clientY+1)+"px";
		this._docNode.style.left=(e.clientX+1)+"px";
	},
	_onRelease: function(e){
		dojo.disconnect(this._docMouseUpEvent);
		dojo.disconnect(this._onDragEvent);
		dojo.forEach(this._docEvents, dojo.disconnect);
		dojo.style(document.body, "cursor", "default");
		if(this._dragTopicPublished){
			dojo.publish("filearea:dragStop", [this]);
			this._dragTopicPublished = false;
		}
		var newTarget = dijit.getEnclosingWidget(e.target);
		if(newTarget.declaredClass && (newTarget.declaredClass == "desktop.widget.FileArea" || newTarget.declaredClass == "desktop.widget.FileArea._Icon")) 
			var targetPath = (newTarget.declaredClass != "desktop.widget.FileArea"
				? (newTarget.type == "text/directory" ? newTarget.getParent().path+newTarget.name+"/" : newTarget.getParent().path)
				: newTarget.path);
		if (this._docNode){
			//Determine if we're the parent of what we're being dragged into
			var isParent = dojo.hitch(this, function(target){
				if(!target) return;
				if(this.type != "text/directory") return false; //can't be a parent if we're not a dir!
				var tPath = target.split("://");
				var sPath = this.getParent().path.split("://");
				//if we're not even using the same protocol we can't be a parent of the target
				if(sPath[0] != tPath[0]) return false;
				sPath[1] += this.name;
				tPath = tPath[1].split("/");
				sPath = sPath[1].split("/");
				var sCount = 0;
				var tCount = 0;
				var sFixedPath = "/";
				var tFixedPath = "/";
				while(sCount <= sPath.length-1 && tCount <= tPath.length-1){
					while(sPath[sCount] == "") sCount++;
					while(tPath[tCount] == "") tCount++;
					if(typeof tPath[tCount] == "undefined") tPath[tCount] = "";
					if(typeof sPath[sCount] == "undefined") sPath[sCount] = "";
					sFixedPath += sPath[sCount]+"/";
					tFixedPath += tPath[tCount]+"/";
					sCount++;
					tCount++;
				}
				if(tFixedPath.indexOf(sFixedPath) == 0) return true;
				return false;
			})
			var onEnd = dojo.hitch(this, function(){
				if (this._docNode.parentNode) 
					this._docNode.parentNode.removeChild(this._docNode);
				this._docNode = null;
			});
			if (desktop.config.fx > 0 &&
			(!(newTarget.declaredClass == "desktop.widget.FileArea" || newTarget.declaredClass=="desktop.widget.FileArea._Icon") || isParent(targetPath))){
				var l = dojo.coords(this.domNode);
				var anim = dojo.animateProperty({
					node: this._docNode,
					properties: {
						top: l.y,
						left: l.x
					}
				})
				anim.onEnd = onEnd;
				anim.play();
			}
			else 
				onEnd();
			
			var nf = dojo.i18n.getLocalization("desktop.widget", "filearea");
			if(isParent(targetPath)) desktop.dialog.notify({message: nf.parentErr, type: "warning", duration: 5000});
			if(((e.shiftKey && newTarget.type != "text/directory") || newTarget.id != this.getParent().id)
			&& newTarget.id != this.id
			&& !isParent(targetPath)
			&& (newTarget.declaredClass == "desktop.widget.FileArea" || newTarget.declaredClass == "desktop.widget.FileArea._Icon")){
				var _loadParent = this.getParent();
				_loadParent._loadStart();
				if (e.shiftKey){
					//copy the file
					if(newTarget.declaredClass == "desktop.widget.FileArea") 
						var name = newTarget._fixDuplicateFilename(this.name, this.type);
					else
						var name = (newTarget.type == "text/directory" ? 
									this.name : //TODO: fix the name server side? or at least show an error message...
									newTarget.getParent()._fixDuplicateFilename(this.name, this.type));
					desktop.filesystem.copy(this.getParent().path + "/" + this.name, targetPath + name, function(){
						_loadParent._loadEnd();
						if(newTarget.declaredClass == "desktop.widget.FileArea") newTarget.refresh();
						dojo.publish("filearea:"+targetPath, [newTarget.id]);
						//TODO: copy myself and add me to newTarget?
					});
				}
				else {
					//move the file
					if(newTarget.declaredClass == "desktop.widget.FileArea") 
						var name = newTarget._fixDuplicateFilename(this.name, this.type);
					else
						var name = (newTarget.type == "text/directory" ? 
									this.name : //TODO: fix the name server side? or at least show an error message...
									newTarget.getParent()._fixDuplicateFilename(this.name, this.type));
					desktop.filesystem.move(this.getParent().path + "/" + this.name, targetPath + name, dojo.hitch(this, function(){
						_loadParent._loadEnd();
						var p = this.getParent();
						p.removeChild(this);
						p.layout();
						this.name = name;
						this.label = this._formatLabel(name);
						if(newTarget.declaredClass == "desktop.widget.FileArea"){
							newTarget.addChild(this);
							newTarget.layout();
							this.fixStyle();
						}
						else this.destroy();
						dojo.publish("filearea:"+p.path, [p.id, newTarget.id]);
						dojo.publish("filearea:"+targetPath, [p.id, newTarget.id]);
					}));
				}
			}
		}
	},
	_formatLabel: function(name){
		var p = name.lastIndexOf(".");
		var ext = name.substring(p+1, name.length);
		if((desktop.config.filesystem.hideExt && this.type != "text/directory" && p != -1)
		|| ext == "desktop"){
			var label = name.substring(0, p);
		}
		return label || name;
	},
	_onDblClick: function(e){
		if(this.type=="text/directory"){
			this.getParent().setPath(this.getParent().path+this.name);
		}
		else {
			this.getParent().onItem(this.getParent().path+this.name);
		}
	},
	highlight: function(){
		//	summary:
		//		highlights the icon
		this.highlighted = true;
		dojo.addClass(this.labelNode, "selectedItem");
		dojo.addClass(this.iconNode, "fileIconSelected");
		var p = this.getParent();
		p.onHighlight(p.path+(p.path.charAt(p.path.length-1) == "/" ? "" : "/")+this.name);
	},
	_onIconClick: function(){
		dojo.forEach(this.getParent().getChildren(), function(item){
			item.unhighlight();
		});
		this.highlight();
	},
    _openWith: function(){
        if(this._win && !this._win.closed) return this._win.bringToFront();
        var nf = dojo.i18n.getLocalization("desktop.widget", "filearea");
        var cm = dojo.i18n.getLocalization("desktop", "common");
        var win = this._win = new desktop.widget.Window({
            title: nf.openWith,
            height: "350px",
            width: "300px"
        });
        var p = new dijit.layout.ContentPane({region: "top"});
        p.setContent(this.name);
        win.addChild(p);

        var p = new dijit.layout.ContentPane({region: "bottom"});
		var body = document.createElement("div");
        dojo.style(body, "textAlign", "right");
        var cancel = new dijit.form.Button({
            label: cm.cancel,
            onClick: dojo.hitch(win, "close")
        });
        var open = new dijit.form.Button({
            label: cm.open,
            onClick: dojo.hitch(this, "_handleOpenWith")
        });
		dojo.forEach([cancel.domNode, open.domNode], function(c){
			dojo.addClass(c, "dijitInline");
			body.appendChild(c);
		});
		p.setContent(body);
		win.addChild(p);
        this._makeAppTree(win);
        win.show();
    },
    _makeAppTree: function(win){
        this._selectedApp = false;
        var appList = dojo.clone(desktop.app.appList);
        var app = dojo.i18n.getLocalization("desktop", "apps");
        dojo.forEach(appList, function(e){
            e.label = app[e.name] || e.name;
        });
        var store = new dojo.data.ItemFileReadStore({
            data: {
                identifier: "sysname",
                label: "label",
                items: appList
            }
        });
        var tree = new dijit.Tree({
            store: store,
            onClick: dojo.hitch(this, function(item){
                this._selectedApp = store.getValue(item, "sysname");
            }),
            getIconClass: function(item, opened){
                var iconClass = "";
                if(item){
                    iconClass = store.getValue(item, "icon");
                    if(iconClass && iconClass.indexOf(".") !== -1)
                        iconClass = "icon-app-"+store.getValue(item, "sysname");
                }
                return (!item || this.model.mayHaveChildren(item)) ? (opened ? "dijitFolderOpened" : "dijitFolderClosed") : iconClass;
            }
        });
        var p = new dijit.layout.ContentPane({region: "center"});
        var div = document.createElement("div");
        div.appendChild(tree.domNode);
        p.setContent(div);
        win.addChild(p);
    },
    _handleOpenWith: function(){
        if(!this._selectedApp) return;
        desktop.app.launch(this._selectedApp, {file: this.getParent().path+this.name});
        this._win.close();
    },
	rename: function(){
		//	summary:
		//		show a textbox that renames the file
		var textbox = new dijit.form.TextBox({
			style: "width: 100%; height: 100%; position: absolute; top: 0px; left: 0px; z-index: 100;",
			value: this.name
		});
		this.labelNode.appendChild(textbox.domNode);
		textbox.focus();
		var evt = dojo.connect(document.body, "onmouseup", this, function(e){
			if(dijit.getEnclosingWidget(e.target).id == textbox.id) return;
			dojo.disconnect(evt);
			var value = textbox.getValue().replace("/", "").replace("\\", "");
			textbox.destroy();
			if(value == this.name) return;
			value = this.getParent()._fixDuplicateFilename(value, this.type);
			this.getParent()._loadStart();
			desktop.filesystem.move(this.getParent().path+this.name, value, dojo.hitch(this, function(){
				if(desktop.config.filesystem.hideExt){
					var pos = value.lastIndexOf(".");
					if(pos != -1){
						value = value.substring(0, pos-1);
					}
				}
				this.label = this._formatLabel(value);
				this.name = value;
				this.fixStyle();
				dojo.publish("filearea:"+this.getParent().path, [this.getParent().id]);
				this.getParent()._loadEnd();
			}));
		})
	},
	deleteFile: function(e)
	{
		//	summary:
		//		Delete the file on the filesystem this instance represents
		desktop.filesystem.remove(this.getParent().path+this.name, dojo.hitch(this, function(){
			var p = this.getParent();
			this.destroy();
			p.layout();
			dojo.publish("filearea:"+p.path, [p.id]);
		}));
	},
	unhighlight: function(){
		//	summary:
		//		unhighlights the icon
		this.highlighted = false;
		dojo.removeClass(this.labelNode, "selectedItem");
		dojo.removeClass(this.iconNode, "fileIconSelected");
	},
	startup: function(){
		this.label = this._formatLabel(this.label);
		this.fixStyle();
	},
	fixStyle: function(){
		if(!this.getParent().textShadow){
			dojo.removeClass(this.textFront, "shadowFront");
			dojo.addClass(this.textFront, "iconLabel");
			dojo.style(this.textBack, "display", "none");
			dojo.style(this.textHidden, "display", "none");
		}
		else {
			dojo.addClass(this.textFront, "shadowFront");
			dojo.removeClass(this.textFront, "iconLabel");
			dojo.style(this.textBack, "display", "block");
			dojo.style(this.textHidden, "display", "block");
		}
		dojo.forEach([
			this.textFront,
			this.textBack,
			this.textHidden
		], function(node){
			desktop.textContent(node, this.label);
		}, this);
	}
})
