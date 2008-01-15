/*
 * Package: filearea
 * 
 * Summary:
 * 		The file area widget
 * 
 */
dojo.provide("api.filearea");
dojo.provide("api.filearea._item");
dojo.provide("api.filearea._Mover");
dojo.require("dijit._Widget");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dojo.dnd.Moveable");
dojo.require("dijit.Menu");

dojo.declare(
	"api.filearea",
	[dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained],
{
	path: "/",
	operation: [],
	iconStyle: "list",
	overflow: "scroll",
	subdirs: true,
	textShadow: false,
	templateString: "<div class='desktopFileArea' dojoAttachEvent='onclick:_onClick, oncontextmenu:_onRightClick' dojoAttachPoint='focusNode,containerNode' style='overflow-x: hidden; overflow-y: ${overflow};'></div></div>",
	postCreate: function() {
		this.menu = new dijit.Menu({});
		this.menu.addChild(new dijit.MenuItem({label: "Create Folder", iconClass: "icon-16-actions-folder-new", onClick: dojo.hitch(this, this._makeFolder)}));
		this.menu.addChild(new dijit.MenuItem({label: "Create File", iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, this._makeFile)}));
		this.menu.addChild(new dijit.MenuSeparator({}));
		this.menu.addChild(new dijit.MenuItem({label: "Refresh", iconClass: "icon-16-actions-view-refresh", onClick: dojo.hitch(this, this.refresh)}));
	},
	refresh: function()
	{
		dojo.forEach(this.getChildren(), dojo.hitch(this, function(item){
			item.destroy();
		}));
		api.fs.ls({
			path: this.path,
			callback: dojo.hitch(this, function(array)
			{
				dojo.forEach(array, dojo.hitch(this, function(item) {
					var p = item.file.lastIndexOf(".");
					item.ext = item.file.substring(p+1, item.file.length);
					if(desktop.config.filesystem.hideExt && !item.isDir)
					{
						item.fullFile = item.file;
						item.file = item.file.substring(0, p);
					}
					else { item.fullFile = item.file; }
					var icon = desktop.config.filesystem.icons[item.ext.toLowerCase()];
					var wid = new api.filearea._item({
						label: item.file,
						fileName: item.fullFile,
						iconClass: (item.isDir ? "icon-32-places-folder" : (icon || "icon-32-mimetypes-text-x-generic")),
						isDir: item.isDir,
						path: this.path+item.fullFile,
						textshadow: this.textShadow
					});
					this.addChild(wid);
					wid.startup();
				}));
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
		dojo.forEach(this.getChildren(), dojo.hitch(this, function(item){
			item.unhighlight();
		}));
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
		else api.fs.launchApp(path, true);
	},
	_onClick: function(e)
	{
		var w = dijit.getEnclosingWidget(e.target);
		if (w.declaredClass == "api.filearea._item") {
			if (dojo.hasClass(e.target, "desktopFileItemIcon")) 
				w._onIconClick();
			else if(dojo.hasClass(e.target, "desktopFileItemTextFront")
					|| dojo.hasClass(e.target, "desktopFileItemTextBack")
					|| dojo.hasClass(e.target, "desktopFileItemText"))
				w._onTextClick();
			else
				this.clearSelection();
		}
		else this.clearSelection();
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
		api.fs.launchApp(path);
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
	},
	moveChild: function(item) {
		//moves an api.filearea._item from it's folder to our folder.
		this.addChild(item);
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
	templateString: "<div class='desktopFileItem' style='float: left; padding: 10px;' dojoAttachPoint='focusNode'><div class='desktopFileItemIcon ${iconClass}'></div><div class='desktopFileItemText' style='padding-left: 2px; padding-right: 2px;' style='text-align: center;'><div class='desktopFileItemTextFront'>${label}</div><div class='desktopFileItemTextBack'>${label}</div></div></div>",
	postCreate: function() {
		if(!this.textshadow)
		{
			dojo.query(".desktopFileItemTextBack", this.domNode).style("display", "none");
			dojo.query(".desktopFileItemTextFront", this.domNode).removeClass("desktopFileItemTextFront").addClass("desktopFileItemText");
		}
		/*this.movable = new api.filearea._movable(this.domNode, {
			mover: api.filearea._Mover
		});*/
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
		api.ui.inputDialog({title: "Rename File/Folder", message: "Rename file/folder (currently \""+this.fileName+"\") to:", callback: dojo.hitch(this, function(newv) { api.fs.rename({path: this.path, newname: newv}); this.parent.refresh(); })});
	},
	_replace_file: function(e)
	{
		this.parent = this.getParent();
        this.window = new api.window({
            title: "Move File",
              width: "300px",
         height: "200px"
		});
		this.form = {
            currentname: new dijit.form.TextBox({value: this.path, disabled: true, enabled: false}),
            newname: new dijit.form.TextBox({value: this.path})
		};
		var line = document.createElement("div");
        var p = document.createElement("span");
		p.innerHTML = "Current Location:";
		line.appendChild(p);
		line.appendChild(this.form.currentname.domNode);
		var line2 = document.createElement("div");
        var p = document.createElement("span");
		p.innerHTML = "New Location:";
		line2.appendChild(p);
		line2.appendChild(this.form.newname.domNode);
		var button = new dijit.form.Button({
          label: "Move",
		  onClick: dojo.hitch(this, function() {
			this.window.destroy();
			blah = this.form.newname.getValue();
			api.fs.move({path: this.path, newpath: blah});
			this.parent.refresh();
		  })
		});
		var button2 = new dijit.form.Button({
          label: "Cancel",
		  onClick: dojo.hitch(this, function() {
			this.window.destroy();
		  })
		});
		this.window.showClose = false;
		this.window.show();
		this.window.body.domNode.appendChild(line);
		this.window.body.domNode.appendChild(line2);
		this.window.body.domNode.appendChild(button.domNode);
		this.window.body.domNode.appendChild(button2.domNode);
		this.window.startup();
		},
	onClick: function()
	{
		this.getParent().onItem(this.path);
	},
	_onIconClick: function(e) {
		if(this.highlighted == false)
		{
			this.getParent().clearSelection();
			this.highlight();
			this.getParent().onHighlight(this.path);
		}
		else
		{
			this._onOpen();
		}
	},
	_onOpen: function() {
		if (this.isDir) {
			this.getParent().setPath(this.path + "/");
		}
		else {
			this.getParent().onItem(this.path);
		}
	},
	_onTextClick: function(e) {
		if(this.highlighted == false)
		{
			this._onIconClick();
		}
		else
		{
			api.log("item renaming started");
		}
	},
	highlight: function() {
		dojo.query(".desktopFileItemIcon", this.domNode).style("opacity", "0.8").addClass("desktopFileItemHighlight");
		dojo.query(".desktopFileItemText", this.domNode).style("backgroundColor", desktop.config.wallpaper.color).addClass("desktopFileItemHighlight");
		this.highlighted = true;
	},
	unhighlight: function() {
		dojo.query(".desktopFileItemIcon", this.domNode).style("opacity", "1").removeClass("desktopFileItemHighlight");
		dojo.query(".desktopFileItemText", this.domNode).style("backgroundColor", "transparent").removeClass("desktopFileItemHighlight");
		this.highlighted = false;
	},
	startup: function() {
		this.menu = new dijit.Menu({});
	       	this.menu.addChild(new dijit.MenuItem({label: "Open", iconClass: "icon-16-actions-document-open", onClick: dojo.hitch(this, this._onOpen)}));
			menuDl = new dijit.PopupMenuItem({iconClass: "icon-16-actions-document-open", label: "Download"});
			this.menu2 = new dijit.Menu({parentMenu: menuDl});
			if(!this.isDir) this.menu2.addChild(new dijit.MenuItem({label: "as file", onClick: dojo.hitch(this, function(e) {
				api.fs.download(this.path);
			})}));
			if(!this.isDir) this.menu2.addChild(new dijit.MenuItem({label: "as ZIP",onClick: dojo.hitch(this, function(e) {
				api.fs.compressDownload(this.path);
			})}));
			if(this.isDir) this.menu2.addChild(new dijit.MenuItem({label: "as ZIP", onClick: dojo.hitch(this, function(e) {
				api.fs.downloadFolder(this.path);
			})}));
			this.menu2.startup();
			menuDl.popup = this.menu2;
			this.menu.addChild(menuDl);
		this.menu.addChild(new dijit.MenuSeparator({}));
	       	this.menu.addChild(new dijit.MenuItem({label: "Move", iconClass: "icon-16-actions-edit-find-replace", onClick: dojo.hitch(this, this._replace_file)}));
		this.menu.addChild(new dijit.MenuItem({label: "Rename", iconClass: "icon-16-apps-preferences-desktop-font", onClick: dojo.hitch(this, this._rename_file)}));
		this.menu.addChild(new dijit.MenuItem({label: "Delete", iconClass: "icon-16-actions-edit-delete", onClick: dojo.hitch(this, this._delete_file)}));
	}
});

dojo.declare("api.filearea._Mover", dojo.dnd.Mover, {
	onFirstMove: function(){
		// summary: makes the node absolute; it is meant to be called only once\
		this._item_parentNode = this.node.parentNode;
		document.body.appendChild(this.node);
		dojo.style(this.node, "zIndex", 100000);
		console.log(this.host);
		this.node.style.position = "absolute";	// enforcing the absolute mode
		var m = dojo.marginBox(this.node);
		m.l -= this.marginBox.l;
		m.t -= this.marginBox.t;
		this.marginBox = m;
		this.host.onFirstMove(this);
		dojo.disconnect(this.events.pop());
	},
	onMouseMove: function(e){
		// summary: event processor for onmousemove
		// e: Event: mouse event
		if (this.node) {
			dojo.dnd.autoScroll(e);
			/*var m = this.marginBox;*/
			this.host.onMove(this, {
				l: /*m.l +*/ e.pageX+2,
				t: /*m.t +*/ e.pageY+2
			});
		}
	},
	_revertToParent: function(e) {
		this._item_parentNode.appendChild(this.node);
		this._fixPos(e);
	},
	_fixPos: function(e) {
		var t = e.layerY;
		var l = e.layerX;
		console.log([t,l]);
		dojo.style(this.node, "top", t);
		dojo.style(this.node, "left", l);
	},
	onMouseUp: function(e){
		if(this.mouseButton == e.button){
			p = dijit.getEnclosingWidget(e.target);
			this._fixPos(e);
			if(p.declaredClass == "api.filearea._item" && p.domNode.id != e.target.id) {
				if(p.isDir)
				{
					//move item
				}
				else this._revertToParent(e);
			}
			else if(p.declaredClass == "api.filearea") {
				p.moveChild(dijit.byId(this.node.id));
				this._fixPos(e);
			}
			else this._revertToParent(e);
			dojo.style(this.node, "zIndex", 1);
			this.destroy();
		}
	}
});

dojo.declare("api.filearea._mover", dojo.dnd.Moveable, {
	
});
