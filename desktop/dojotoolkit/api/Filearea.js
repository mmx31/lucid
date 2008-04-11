dojo.provide("api.Filearea");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit.Menu");
dojo.require("dijit.form.TextBox");
dojo.requireLocalization("desktop", "common");
dojo.requireLocalization("api", "filearea");

dojo.declare("api.Filearea", dijit.layout._LayoutWidget, {
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
	postCreate: function() {
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var nf = dojo.i18n.getLocalization("api", "filearea");
		
		this.connect(this.domNode, "onclick", "_onClick");
		this.connect(this.domNode, "oncontextmenu", "_onRightClick");
		
		var menu = this.menu = new dijit.Menu({});
		menu.addChild(new dijit.MenuItem({label: nf.createFolder, iconClass: "icon-16-actions-folder-new", onClick: dojo.hitch(this, this._makeFolder)}));
		menu.addChild(new dijit.MenuItem({label: nf.createFile, iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, this._makeFile)}));
		menu.addChild(new dijit.MenuSeparator({}));
		menu.addChild(new dijit.MenuItem({label: cm.refresh, iconClass: "icon-16-actions-view-refresh", onClick: dojo.hitch(this, this.refresh)}));
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
	setPath: function(/*String*/path) {
		//	summary:
		//		sets the path of the filearea and shows that path's contents
		//	path:
		//		the path to display
		if (this.subdirs) {
			this.path = path;
			this.refresh();
			this.onPathChange(path);
		}
		else desktop.app.launchHandler(path);
	},
	onPathChange: function(path) {
		//	summary:
		//		Called when the path changes
	},
	up: function() {
		//	summary:
		//		make the filearea go up one directory
		var path = this.path.split("://");
		if(typeof path[1] == "undefined") {
			path = path[0];
			var protocol = "file";
		}
		else {
			path = path[1];
			var protocol = this.path.split("://")[0];
		} 
		if (path != "/") {
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
		if (w.declaredClass == "api.Filearea._Icon") {
			if (dojo.hasClass(e.target, "fileIcon")) 
				w._onIconClick();
			else 
				if (!(dojo.hasClass(e.target, "shadowFront") ||
				dojo.hasClass(e.target, "shadowBack") ||
				dojo.hasClass(e.target, "iconLabel"))) 
					w._onIconClick();
		}
		else {
			//we could put a dragbox selection hook here
			dojo.forEach(this.getChildren(), function(item) {
				item.unhighlight();
			})
		}
	},
	_makeFolder: function() {
		//	summary:
		//		Makes a folder in the current dir
		
		//TODO: Alert the user if that dir allready exists
		var nf = dojo.i18n.getLocalization("api", "filearea");
		api.ui.inputDialog({
			title: nf.createFolder,
			message: nf.createFolderText,
			callback: dojo.hitch(this, function(dirname) {
				if(dirname == "") return;
				api.fs.mkdir({
					path: this.path+"/"+escape(dirname),
					callback: dojo.hitch(this, this.refresh)
				});
			})
		});
	},
	_makeFile: function() {
		//	summary:
		//		Makes a file in the current dir
		
		//TODO: Alert the user if that file allready exists
		var nf = dojo.i18n.getLocalization("api", "filearea");
		api.ui.inputDialog({
			title: nf.createFile,
			message: nf.createFileText,
			callback: dojo.hitch(this, function(filename) {
				if(filename == "") return;
				api.fs.write({
					path: this.path+"/"+escape(filename),
					callback: dojo.hitch(this, this.refresh)
				});
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
		if(w.declaredClass == "api.Filearea._Icon")
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
	refresh: function() {
		//	summary:
		//		refreshes the area
		
		//clear the area
		dojo.forEach(this.getChildren(), function(item){
			item.destroy();
		});
		//list the path
		api.fs.ls({
			path: this.path,
			callback: dojo.hitch(this, function(array) {
				//make a new widget for each item returned
				dojo.forEach(array, function(item) {
					var name = item.name;
					var p = name.lastIndexOf(".");
					var ext = name.substring(p+1, name.length);
					var icon = desktop.config.filesystem.icons[ext.toLowerCase()];
					if(desktop.config.filesystem.hideExt && item.type!="text/directory" && p != -1) {
						var label = name.substring(0, p-1);
					}
					var wid = new api.Filearea._Icon({
						label: label || name,
						name: name,
						path: item.path,
						type: item.type,
						iconClass: (item.type=="text/directory" ? "icon-32-places-folder" : (icon || "icon-32-mimetypes-text-x-generic"))
					});
					this.addChild(wid);
				}, this);
				//invoke a layout so that everything is positioned correctly
				this.layout();
			})
		});
	},
	layout: function() {
		//	summary:
		//		Lays out the icons vertically or horizontally depending on the value of the 'vertical' property
		var width = this.domNode.offsetWidth;
		var height = this.domNode.offsetHeight;
		var hspacing = 100;
		var vspacing = 70;
		var wc = 0; //width counter
		var hc = 0; //height counter
		var children = this.getChildren();
		for(key in children) {
			var w = children[key];
			if(!w.declaredClass) continue;
			dojo.style(w.domNode, {
				position: "absolute",
				top: (this.vertical ? wc : hc)+"px",
				left: (!this.vertical ? wc : hc)+"px"
			});
			wc += (this.vertical ? vspacing : hspacing);
			if(wc >= (this.vertical ? height : width)-(this.vertical ? vspacing : hspacing)) {
				wc = 0;
				hc += (this.vertical ? vspacing : hspacing);
			}
		};
	}
})

dojo.declare("api.Filearea._Icon", [dijit._Widget, dijit._Templated, dijit._Contained], {
	templatePath: dojo.moduleUrl("api", "templates/Filearea_Item.html"),
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
	postCreate: function() {
		var nc = dojo.i18n.getLocalization("desktop", "common");
		var nf = dojo.i18n.getLocalization("api", "filearea");
		
		this.connect(this.iconNode, "ondblclick", "_onDblClick");
		this.connect(this.labelNode, "ondblclick", "rename");
		this.connect(this.domNode, "onmousedown", "_dragStart");
		
		var menu = this.menu = new dijit.Menu({});
		menu.addChild(new dijit.MenuItem({label: nc.open, iconClass: "icon-16-actions-document-open", onClick: dojo.hitch(this, this._onOpen)}));
			var menuDl = new dijit.PopupMenuItem({iconClass: "icon-16-actions-document-open", label: nc.download});
			var menu2 = new dijit.Menu({parentMenu: menuDl});
			if(!this.isDir) { menu2.addChild(new dijit.MenuItem({label: nf.asFile, onClick: dojo.hitch(this, function(e) {
				api.fs.download(this.path);
			})}));
			menu2.addChild(new dijit.MenuItem({label: nf.asZip ,onClick: dojo.hitch(this, function(e) {
				api.fs.compressDownload(this.path, "zip");
			})}));
			menu2.addChild(new dijit.MenuItem({label: nf.asTgz, onClick: dojo.hitch(this, function(e) {
				api.fs.compressDownload(this.path, "gzip");
			})}));
			menu2.addChild(new dijit.MenuItem({label: nf.asTbz2, onClick: dojo.hitch(this, function(e) {
				api.fs.compressDownload(this.path, "bzip");
			})}));
			}
			if(this.type == "text/directory") {
				menu2.addChild(new dijit.MenuItem({label: nf.asZip, onClick: dojo.hitch(this, function(e) {
					api.fs.downloadFolder(this.path, "zip");
				})}));
				menu2.addChild(new dijit.MenuItem({label: nf.asTgz, onClick: dojo.hitch(this, function(e) {
					api.fs.downloadFolder(this.path, "gzip");
				})}));
				menu2.addChild(new dijit.MenuItem({label: nf.asTbz2, onClick: dojo.hitch(this, function(e) {
					api.fs.downloadFolder(this.path, "bzip");
				})}));
			}
			menu2.startup();
			menuDl.popup = menu2;
			menu.addChild(menuDl);
		menu.addChild(new dijit.MenuSeparator({}));
		menu.addChild(new dijit.MenuItem({label: nc.rename, iconClass: "icon-16-apps-preferences-desktop-font", onClick: dojo.hitch(this, "rename")}));
		menu.addChild(new dijit.MenuItem({label: nc["delete"], iconClass: "icon-16-actions-edit-delete", onClick: dojo.hitch(this, "deleteFile")}));
		
	},
	_dragStart: function(e) {
		this._clickOrigin = {x: e.clientX, y: e.clientY};
		this._docMouseUpEvent = dojo.connect(document, "onmouseup", this, "_onRelease");
		this._onDragEvent = dojo.connect(document, "onmousemove", this, "_onMove");
		this._docEvents = [
			dojo.connect(document, "ondragstart", dojo, "stopEvent"),
			dojo.connect(document, "onselectstart", dojo, "stopEvent")
		];
		dojo.stopEvent(e);
	},
	_onMove: function(e) {
		//if the mouse hasn't moved at least five pixels, don't do anything
		if((Math.abs(e.clientX - this._clickOrigin.x) < 5
		|| Math.abs(e.clientY - this._clickOrigin.y) < 5)
		|| ((Math.abs(e.clientX - this._clickOrigin.x) < 5
		&& Math.abs(e.clientY - this._clickOrigin.y) < 5))) return;
		//if we haven't copied ourselves to the document yet, let's do that now
		if(!this._docNode) {
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
	_onRelease: function(e) {
		dojo.disconnect(this._docMouseUpEvent);
		dojo.disconnect(this._onDragEvent);
		dojo.forEach(this._docEvents, dojo.disconnect);
		dojo.style(document.body, "cursor", "default");
		var newTarget = dijit.getEnclosingWidget(e.target);
		
		if(this._docNode) {
			var onEnd = dojo.hitch(this, function() {
				if(this._docNode.parentNode) this._docNode.parentNode.removeChild(this._docNode);
				this._docNode = null;
			});
			if(desktop.config.fx > 0
			&& !(newTarget.declaredClass == "api.Filearea" || newTarget.declaredClass == "api.Filearea._Item")) {
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
			else onEnd();
		}
		//TODO: if I am dragged to one of my child directories, don't attempt to copy/move!
		if(newTarget.id != this.getParent().id
		&& newTarget.declaredClass == "api.Filearea") {
			if(e.keyCode == dojo.keys.SHIFT) {
				//copy the file
				api.fs.copy({
					path: this.getParent().path+"/"+this.name,
					newpath: newTarget.path+"/"+this.name,
					callback: function() {
						newTarget.refresh();
						//TODO: copy myself and add me to newTarget?
					}
				});
			}
			else {
				//move the file
				api.fs.rename({
					path: this.getParent().path+"/"+this.name,
					newpath: newTarget.path+"/"+this.name,
					callback:  dojo.hitch(this, function() {
						var p = this.getParent();
						p.removeChild(this);
						p.layout();
						newTarget.addChild(this);
						newTarget.layout();
						this.startup();
					})
				});
			}
		}
		//TODO: handle dragging a file into a folder
	},
	_onDblClick: function(e) {
		if(this.type=="text/directory") {
			this.getParent().setPath(this.getParent().path+"/"+this.name);
		}
		else {
			this.getParent().onItem(this.getParent().path+"/"+this.name);
		}
	},
	highlight: function() {
		//	summary:
		//		highlights the icon
		this.highlighted = true;
		dojo.addClass(this.labelNode, "selectedItem");
		dojo.addClass(this.iconNode, "fileIconSelected");
	},
	_onIconClick: function() {
		dojo.forEach(this.getParent().getChildren(), function(item) {
			item.unhighlight();
		});
		this.highlight();
	},
	rename: function() {
		//	summary:
		//		show a textbox that renames the file
		var textbox = new dijit.form.TextBox({
			style: "width: 100%; height: 100%; position: absolute; top: 0px; left: 0px; z-index: 100;",
			value: this.name
		});
		this.labelNode.appendChild(textbox.domNode);
		textbox.focus();
		var evt = dojo.connect(document, "onmousedown", this, function(e) {
			if(dijit.getEnclosingWidget(e.target).id == textbox.id) return;
			dojo.disconnect(evt);
			var value = textbox.getValue();
			api.fs.rename({
				path: this.getParent().path+"/"+this.name,
				newname: value,
				callback: dojo.hitch(this, function() {
					dojo.forEach([
						this.textFront,
						this.textBack,
						this.textHidden
					], function(node) {
						node.textContent = value;
					});
					this.name = value;
				})
			});
			textbox.destroy();
		})
	},
	deleteFile: function(e)
	{
		//	summary:
		//		Delete the file on the filesystem this instance represents
		api.fs.rm({path: this.getParent().path+"/"+this.name, callback: dojo.hitch(this, function() {
			var p = this.getParent();
			this.destroy();
			p.layout();
		})});
	},
	unhighlight: function() {
		//	summary:
		//		unhighlights the icon
		this.highlighted = false;
		dojo.removeClass(this.labelNode, "selectedItem");
		dojo.removeClass(this.iconNode, "fileIconSelected");
	},
	startup: function() {
		if(!this.getParent().textShadow) {
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
	}
})