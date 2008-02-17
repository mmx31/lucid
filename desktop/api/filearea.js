dojo.provide("api.filearea");
dojo.provide("api.filearea._item");
dojo.provide("api.filearea._Mover");
dojo.require("dijit._Widget");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.Menu");

/*
 * Class: filearea
 * 
 * Scope: api
 * 
 * Summary:
 * 		The file area widget
 * 
 */
dojo.declare(
	"api.filearea",
	[dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained],
{
	path: "/",
	operation: [],
	iconStyle: "list",
	overflow: "scroll",
	subdirs: true,
	forDesktop: false,
	templateString: "<div class='desktopFileArea' dojoAttachEvent='onclick:_onClick, oncontextmenu:_onRightClick' dojoAttachPoint='focusNode,containerNode' style='overflow-x: hidden; overflow-y: ${overflow};'></div></div>",
	postCreate: function() {
		this.menu = new dijit.Menu({});
		this.menu.addChild(new dijit.MenuItem({label: "Create Folder", iconClass: "icon-16-actions-folder-new", onClick: dojo.hitch(this, this._makeFolder)}));
		this.menu.addChild(new dijit.MenuItem({label: "Create File", iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, this._makeFile)}));
		this.menu.addChild(new dijit.MenuSeparator({}));
		this.menu.addChild(new dijit.MenuItem({label: "Refresh", iconClass: "icon-16-actions-view-refresh", onClick: dojo.hitch(this, this.refresh)}));
		this.source = new dojo.dnd.Source(this.domNode, {
			horizontal: !this.forDesktop,
			accept: ["dir", "item"],
			creator: function(item, hint){
				item.id = dojo.dnd.getUniqueId();
				var p = new api.filearea._item(item);
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
					var p = item.file.lastIndexOf(".");
					item.ext = item.file.substring(p+1, item.file.length);
					if(desktop.config.filesystem.hideExt && !item.isDir && p != -1)
					{
						item.fullFile = item.file;
						item.file = item.file.substring(0, p);
					}
					else { item.fullFile = item.file; }
					var icon = desktop.config.filesystem.icons[item.ext.toLowerCase()];
					var wid = {
						label: item.file,
						fileName: item.fullFile,
						iconClass: (item.isDir ? "icon-32-places-folder" : (icon || "icon-32-mimetypes-text-x-generic")),
						isDir: item.isDir,
						path: this.path+item.fullFile,
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
		api.fs.mkdir({
			path: this.path+"/New Folder",
			callback: dojo.hitch(this, this.refresh)
		});
		//TODO: this should numerate them if it exists allready, for example New Folder 1, New Folder 2, etc.
	},
	_makeFile: function() {
		api.fs.write({
			path: this.path+"/New File.txt",
			callback: dojo.hitch(this, this.refresh)
		});
		//TODO: this should numerate them if it exists allready, for example New File 1, New File 2, etc.
	},
	clearSelection: function()
	{
		this.source.selectNone();
		this.unhighlightChildren();
	},
	unhighlightChildren: function() {
		dojo.forEach(this.getChildren(), function(c) {
			c.unhighlight();
		});
	},
	up: function()
	{
		if (this.path != "/") {
			dirs = this.path.split("/");
			if(this.path.charAt(this.path.length-1) == "/") dirs.pop();
			if(this.path.charAt(0) == "/") dirs.shift();
			dirs.pop();
			if(dirs.length == 0) this.setPath("/");
			else this.setPath("/"+dirs.join("/")+"/");
		}
	},
	setPath: function(path)
	{
		if (this.subdirs) {
			this.path = path;
			this.refresh();
			this.onPathChange(path);
		}
		else desktop.app.launchHandler(path);
	},
	_onClick: function(e)
	{
		var w = dijit.getEnclosingWidget(e.target);
		if (w.declaredClass == "api.filearea._item") {
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
	_onRightClick: function(e)
	{
		var w = dijit.getEnclosingWidget(e.target);
		if(w.declaredClass == "api.filearea._item")
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
	onItem: function(path)
	{
		//this is a hook to use when an item is opened
		//this defaults to opening the file
		desktop.app.launchHandler(path);
	},
	onHighlight: function(path)
	{
		//hook for highlight
	},
	onPathChange: function(path)
	{
		//this is a hook to use when the path changes.
	},
	startup: function()
	{
		dojo.forEach(this.getChildren(), function(item){
			item.startup();
		});
	}
});

dojo.declare(
	"api.filearea._item",
	[dijit._Widget, dijit._Templated, dijit._Contained],
{
	iconClass: "",
	label: "file",
	highlighted: false,
	isDir: false,
	textShadow: false,
	floatLeft: false,
	_timeouts: [],
	templateString: "<div class='desktopFileItem' style='width: 80px; padding: 10px;' dojoAttachPoint='focusNode'><div class='desktopFileItemIcon ${iconClass}'></div><div class='desktopFileItemText' style='padding-left: 2px; padding-right: 2px; text-align: center;'><div dojoAttachPoint='textFront' class='desktopFileItemTextFront'>${label}</div><div dojoAttachPoint='textBack' class='desktopFileItemTextBack'>${label}</div></div></div>",
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
	},
	_delete_file: function(e)
	{
		var parent = this.getParent();
		if(this.isDir === true) api.fs.rmdir({path: this.path, callback: dojo.hitch(parent, parent.refresh)});
		else api.fs.rm({path: this.path, callback: dojo.hitch(parent, parent.refresh)});
	},
	_rename_file: function(e)
	{
		this.parent = this.getParent();
		api.ui.inputDialog({title: "Rename File/Folder", message: "Rename file/folder (currently \""+this.fileName+"\") to:", callback: dojo.hitch(this, function(newv) { api.fs.rename({path: this.path, newname: newv, callback: dojo.hitch(this, function() {this.parent.refresh();})}); })});
	},
	onClick: function()
	{
		this.getParent().unhighlightChildren();
		return this.getParent().onItem(this.path);
	},
	_onIconClick: function(e) {
		if(this.highlighted == false)
		{
			this.getParent().unhighlightChildren();
			this.highlight();
			this.getParent().onHighlight(this.path);
			this._timeouts.push(setTimeout(dojo.hitch(this, function() {
				this.unhighlight();
			}), 1000));
		}
		else
		{
			dojo.forEach(this._timeouts, function(e) {
				clearTimeout(e);
			});
			this._onOpen();
		}
	},
	_onOpen: function() {
		if (this.isDir) {
			this.getParent().setPath(this.path + "/");
		}
		else {
			this.getParent().onItem(this.path);
			this.unhighlight();
		}
	},
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
	highlight: function() {
		this.highlighted = true;
	},
	unhighlight: function() {
		this.highlighted = false;
	},
	startup: function() {
		this.menu = new dijit.Menu({});
	       	this.menu.addChild(new dijit.MenuItem({label: "Open", iconClass: "icon-16-actions-document-open", onClick: dojo.hitch(this, this._onOpen)}));
			menuDl = new dijit.PopupMenuItem({iconClass: "icon-16-actions-document-open", label: "Download"});
			this.menu2 = new dijit.Menu({parentMenu: menuDl});
			if(!this.isDir) { this.menu2.addChild(new dijit.MenuItem({label: "as file", onClick: dojo.hitch(this, function(e) {
				api.fs.download(this.path);
			})}));
			this.menu2.addChild(new dijit.MenuItem({label: "as ZIP (ZIP)",onClick: dojo.hitch(this, function(e) {
				api.fs.compressDownload(this.path, "zip");
			})}));
			this.menu2.addChild(new dijit.MenuItem({label: "as TGZ (GZIP)", onClick: dojo.hitch(this, function(e) {
				api.fs.compressDownload(this.path, "gzip");
			})}));
			this.menu2.addChild(new dijit.MenuItem({label: "as TBZ2 (BZIP)", onClick: dojo.hitch(this, function(e) {
				api.fs.compressDownload(this.path, "bzip");
			})}));
			}
			if(this.isDir) {
				this.menu2.addChild(new dijit.MenuItem({label: "as ZIP (ZIP)", onClick: dojo.hitch(this, function(e) {
					api.fs.downloadFolder(this.path, "zip");
				})}));
				this.menu2.addChild(new dijit.MenuItem({label: "as TGZ (GZIP)", onClick: dojo.hitch(this, function(e) {
					api.fs.downloadFolder(this.path, "gzip");
				})}));
				this.menu2.addChild(new dijit.MenuItem({label: "as TBZ2 (BZIP)", onClick: dojo.hitch(this, function(e) {
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