dojo.provide("api.Filearea");
dojo.provide("api.Filearea._Item");
dojo.provide("api.Filearea._Mover");
dojo.require("dijit._Widget");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.Menu");
dojo.requireLocalization("desktop", "common");
dojo.requireLocalization("api", "filearea");

/*
 * Class: api.Filearea
 * 
 * The file area widget
 * 
 * TODO:
 * 		The DnD code in this should be completely redone, and shouldn't really use dojo's DnD system
 * 		Also this whole thing is just a mess. I think I should redo it some time.
 */
dojo.declare(
	"api.Filearea",
	[dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained],
{
	//	summary:
	//		a filesystem navigation widget
	templatePath: dojo.moduleUrl("api", "templates/Filearea.html"),
	//	path: String
	//		The current path. You can set this during creation, but not afterword.
	path: "/",
	//	operation: Array
	// I forgot what this does. Oh noes.
	operation: [],
	//	overflow: String
	//		What should be done when the area is full. Values are just like in CSS (auto, scroll, none, etc.
	overflow: "scroll",
	//	subdirs: boolean
	//		Can the user navigate through subdirectories? if not then they open in new browser windows
	subdirs: true,
	//	forDesktop: boolean
	//		Is this filearea on the desktop?
	forDesktop: false,
	postCreate: function() {
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var nf = dojo.i18n.getLocalization("api", "filearea");
		this.menu = new dijit.Menu({});
		this.menu.addChild(new dijit.MenuItem({label: nf.createFolder, iconClass: "icon-16-actions-folder-new", onClick: dojo.hitch(this, this._makeFolder)}));
		this.menu.addChild(new dijit.MenuItem({label: nf.createFile, iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, this._makeFile)}));
		this.menu.addChild(new dijit.MenuSeparator({}));
		this.menu.addChild(new dijit.MenuItem({label: cm.refresh, iconClass: "icon-16-actions-view-refresh", onClick: dojo.hitch(this, this.refresh)}));
		this.source = new dojo.dnd.Source(this.domNode, {
			horizontal: !this.forDesktop,
			accept: ["dir", "item"],
			creator: function(item, hint){
				item.id = dojo.dnd.getUniqueId();
				var p = new api.Filearea._Item(item);
				p.startup();
				return {node: p.domNode, data: p, type: [p.isDir ? "dir" : "item"]};
			}
		});
		this.source.startup();
		dojo.connect(this.source, "onDndDrop", this.source, function(source, nodes, copy, target){
			if(source != target && target == this) {
				var t = dijit.byNode(target.node);
				dojo.forEach(nodes, function(node){
					var c = dijit.byNode(node);
					console.log([c.domNode, node, (c.domNode == node)]);
					api.fs.move({
						path: c.path,
						newpath: t.path + c.fileName,
						callback: function(){
							t.refresh();
						}
					})
				});
			}
		});
	},
	refresh: function()
	{
		//	summary:
		//		Refreshes the file list
		this.source.selectAll().deleteSelectedNodes();
		dojo.forEach(this.getChildren(), dojo.hitch(this, function(item){
			item.destroy();
		}));
		api.fs.ls({
			path: this.path,
			callback: dojo.hitch(this, function(array)
			{
				var widList = [];
				dojo.forEach(array, function(item) {
					var p = item.name.lastIndexOf(".");
					item.ext = item.name.substring(p+1, item.name.length);
					if(desktop.config.filesystem.hideExt && item.type!="text/directory" && p != -1)
					{
						item.fullName = item.name;
						item.name = item.name.substring(0, p);
					}
					else { item.fullName = item.name; }
					var icon = desktop.config.filesystem.icons[item.ext.toLowerCase()];
					var wid = {
						label: item.name,
						fileName: item.fullName,
						iconClass: (item.type=="text/directory" ? "icon-32-places-folder" : (icon || "icon-32-mimetypes-text-x-generic")),
						isDir: item.type=="text/directory",
						path: this.path+(this.path.charAt(this.path.length-1) == "/" ? "" : "/")+item.name,
						textShadow: this.forDesktop,
						floatLeft: !this.forDesktop
					};
					widList.push(wid);
				}, this);
				this.source.insertNodes(false, widList);
			})
		});
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
		
		//TODO: Alert the user if that dir allready exists
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
	clearSelection: function()
	{
		//	summary:
		//		Clears the current selection
		this.source.selectNone();
		this.unhighlightChildren();
	},
	unhighlightChildren: function() {
		//	summary:
		//		unhilight the widget's children
		dojo.forEach(this.getChildren(), function(c) {
			c.unhighlight();
		});
	},
	up: function()
	{
		//	summary:
		//		Navigates up one directory
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
			if(dirs.length == 0) this.setPath("/");
			else this.setPath(protocol+"://"+dirs.join("/")+"/");
		}
	},
	setPath: function(path)
	{
		//	summary:
		//		Sets the current path
		if (this.subdirs) {
			this.path = path;
			this.refresh();
			this.onPathChange(path);
		}
		else desktop.app.launchHandler(path);
	},
	_onClick: function(e)
	{
		//	summary:
		//		Event handler
		//		passes click event to the appropriate child widget's event
		var w = dijit.getEnclosingWidget(e.target);
		if (w.declaredClass == "api.Filearea._Item") {
			if (dojo.hasClass(e.target, "desktopFileItemIcon")) 
				w._onIconClick();
			else 
				if (dojo.hasClass(e.target, "desktopFileItemTextFront") ||
				dojo.hasClass(e.target, "desktopFileItemTextBack") ||
				dojo.hasClass(e.target, "desktopFileItemText")) 
					w._onTextClick();
				else 
					w._onIconClick();
		}
		else {
			//we could put a dragbox selection hook here
			this.clearSelection();
		}
	},
	/*
	 * Method: _onRightClick
	 * 
	 * Event handler
	 * passes click event to the appropriate child widget
	 * if a widget wasn't clicked on, we open our own menu
	 */
	_onRightClick: function(e)
	{
		//	summary:
		//		Event handler
		//		passes click event to the appropriate child widget
		//		if a widget wasn't clicked on, we open our own menu
		var w = dijit.getEnclosingWidget(e.target);
		if(w.declaredClass == "api.Filearea._Item")
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
	onHighlight: function(/*String*/path)
	{
		//	summary:
		//		hook for when an icon is highlighted
		//	path:
		//		the path to the file
	},
	onPathChange: function(/*String*/path)
	{
		//	summary:
		//		Event hook for when the path changes
		//	path:
		//		the path to the file
	},
	startup: function()
	{
		dojo.forEach(this.getChildren(), function(item){
			item.startup();
		});
	}
});

/*
 * Class: api.Filearea._Item
 * 
 * A file icon that is used in the filearea widget
 */
dojo.declare(
	"api.Filearea._Item",
	[dijit._Widget, dijit._Templated, dijit._Contained],
{
	//	iconClass: String
	//		the icon class to use
	iconClass: "",
	//	label: String
	//		The label to be shown underneath the icon
	label: "file",
	//	highlighted: Boolean
	//		readonly property that is true if the item is highlighted
	//		This is actually used for double click handling, not visual highlighting (I know, it's confusing)
	highlighted: false,
	/*
	 * Property: isDir
	 * 
	 * will be true if this file is a directory
	 */
	isDir: false,
	/*
	 * Property: textShadow
	 * 
	 * Should there be a shadow behind the label?
	 */
	textShadow: false,
	/*
	 * Property: floatLeft
	 * 
	 * Should the files be floating left?
	 */
	floatLeft: false,
	/*
	 * Property: _timeouts
	 * 
	 * An array of setTimeout handles for when the icon is clicked on (to handle double-clicking)
	 */
	_timeouts: [],
	templatePath: dojo.moduleUrl("api", "templates/Filearea_Item.html"),
	postCreate: function() {
		/*if(!this.textShadow)
		{
			dojo.style(this.textBack, "display", "none");
			dojo.removeClass(this.textFront, "desktopFileItemTextFront")
			dojo.addClass(this.textFront, "desktopFileItemText")
			dojo.addClass(this.textFront, "usedToBeDesktopFileItemTextFront");
		}
		if(this.floatLeft) {
			dojo.addClass(this.domNode, "desktopFileItemInline");
		}*/
		dojo.connect(this.iconNode, "ondblclick", this, "_onOpen");
	},
	/*
	 * Method: _delete_file
	 * 
	 * Delete the file on the filesystem this instance represents
	 */
	_delete_file: function(e)
	{
		var parent = this.getParent();
		if(this.isDir === true) api.fs.rmdir({path: this.path, callback: dojo.hitch(parent, parent.refresh)});
		else api.fs.rm({path: this.path, callback: dojo.hitch(parent, parent.refresh)});
	},
	/*
	 * Method: _rename_file
	 * 
	 * Rename the file on the filesystem this instance represents
	 */
	_rename_file: function(e)
	{
		this.parent = this.getParent();
		api.ui.inputDialog({title: "Rename File/Folder", message: "Rename file/folder (currently \""+this.fileName+"\") to:", callback: dojo.hitch(this, function(newv) { api.fs.rename({path: this.path, newname: newv, callback: dojo.hitch(this, function() {this.parent.refresh();})}); })});
	},
	/*
	 * Method: onClick
	 * 
	 * Event handler
	 * called when the icon is double-clicked
	 */
	onClick: function()
	{
		this.getParent().unhighlightChildren();
		return this.getParent().onItem(this.path);
	},
	/*
	 * Method: _onIconClick
	 * 
	 * Event handler
	 * called when the icon is clicked on
	 */
	_onIconClick: function(e) {
			this.getParent().unhighlightChildren();
			this.getParent().onHighlight(this.path);
	},
	/*
	 * Method: _onOpen
	 * 
	 * Called when the file is opened
	 */
	_onOpen: function() {
		if (this.isDir) {
			this.getParent().setPath(this.path + "/");
		}
		else {
			this.getParent().onItem(this.path);
			this.unhighlight();
		}
	},
	/*
	 * Method: _onTextClick
	 * 
	 * Called when the label of the widget is clicked on
	 */
	_onTextClick: function(e) {
		if(this.highlighted == false)
		{
			this.getParent().unhighlightChildren();
			this._onIconClick();
		}
		else
		{
			api.log("item renaming started");
		}
	},
	/*
	 * Method: highlight
	 * 
	 * Highlight the icon
	 * 
	 * Note:
	 * 		This is actually used for double click handling, not visual highlighting (I know, it's confusing)
	 */
	highlight: function() {
		this.highlighted = true;
	},
	/*
	 * Method: unhighlight
	 * 
	 * Unhighlight the icon
	 * 
	 * Note:
	 * 		This is actually used for double click handling, not visual highlighting (I know, it's confusing)
	 */
	unhighlight: function() {
		this.highlighted = false;
	},
	startup: function() {
		var nc = dojo.i18n.getLocalization("desktop", "common");
		var nf = dojo.i18n.getLocalization("api", "filearea");
		this.menu = new dijit.Menu({});
	       	this.menu.addChild(new dijit.MenuItem({label: nc.open, iconClass: "icon-16-actions-document-open", onClick: dojo.hitch(this, this._onOpen)}));
			menuDl = new dijit.PopupMenuItem({iconClass: "icon-16-actions-document-open", label: nc.download});
			this.menu2 = new dijit.Menu({parentMenu: menuDl});
			if(!this.isDir) { this.menu2.addChild(new dijit.MenuItem({label: nf.asFile, onClick: dojo.hitch(this, function(e) {
				api.fs.download(this.path);
			})}));
			this.menu2.addChild(new dijit.MenuItem({label: nf.asZip ,onClick: dojo.hitch(this, function(e) {
				api.fs.compressDownload(this.path, "zip");
			})}));
			this.menu2.addChild(new dijit.MenuItem({label: nf.asTgz, onClick: dojo.hitch(this, function(e) {
				api.fs.compressDownload(this.path, "gzip");
			})}));
			this.menu2.addChild(new dijit.MenuItem({label: nf.asTbz2, onClick: dojo.hitch(this, function(e) {
				api.fs.compressDownload(this.path, "bzip");
			})}));
			}
			if(this.isDir) {
				this.menu2.addChild(new dijit.MenuItem({label: nf.asZip, onClick: dojo.hitch(this, function(e) {
					api.fs.downloadFolder(this.path, "zip");
				})}));
				this.menu2.addChild(new dijit.MenuItem({label: nf.asTgz, onClick: dojo.hitch(this, function(e) {
					api.fs.downloadFolder(this.path, "gzip");
				})}));
				this.menu2.addChild(new dijit.MenuItem({label: nf.asTbz2, onClick: dojo.hitch(this, function(e) {
					api.fs.downloadFolder(this.path, "bzip");
				})}));
			}
			this.menu2.startup();
			menuDl.popup = this.menu2;
			this.menu.addChild(menuDl);
		this.menu.addChild(new dijit.MenuSeparator({}));
		this.menu.addChild(new dijit.MenuItem({label: "Rename", iconClass: "icon-16-apps-preferences-desktop-font", onClick: dojo.hitch(this, this._rename_file)}));
		this.menu.addChild(new dijit.MenuItem({label: "Delete", iconClass: "icon-16-actions-edit-delete", onClick: dojo.hitch(this, this._delete_file)}));
	}
});