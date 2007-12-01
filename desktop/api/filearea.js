/*
 * Package: filearea
 * 
 * Summary:
 * 		The file area widget
 * 
 */
dojo.provide("api.filearea");
dojo.provide("api.filearea._item");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");

dojo.declare(
	"api.filearea",
	[dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained],
{
	path: "/",
	iconStyle: "list",
	overflow: "scroll",
	subdirs: true,
	templateString: "<div class='desktopFileArea' dojoAttachPoint='focusNode,containerNode' style='overflow-x: hidden; overflow-y: ${overflow};'></div>",
	postCreate: function() {
		
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
					this.addChild(new api.filearea._item({
						label: item.file,
						iconClass: (item.isDir ? "icon-32-places-folder" : "icon-32-mimetypes-text-x-generic"),
						isDir: item.isDir
					}));
				}));
			})
		});
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
			if(dirs.length == 0) this.path = "/";
			else this.path = "/"+dirs.join("/")+"/";
			this.refresh();
		}
	},
	setPath: function(path)
	{
		if (this.subdirs) {
			this.path = path;
			this.refresh();
		}
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
	templateString: "<div class='desktopFileItem' style='float: left; padding: 10px;' dojoAttachPoint='focusNode'><center><div class='desktopFileItemIcon ${iconClass}' dojoAttachEvent='onclick:_onIconClick'></div></center><div class='desktopFileItemText' style='padding-left: 2px; padding-right: 2px;' dojoAttachEvent='onclick:_onTextClick' style='text-align: center;'>${label}</div></div>",
	onClick: function(e)
	{
		
	},
	_onIconClick: function(e) {
		if(this.highlighted == false)
		{
			this.getParent().clearSelection();
			this.highlight();
		}
		else
		{
			if (this.isDir) {
				this.getParent().setPath(this.label + "/");
			}
		}
	},
	_onTextClick: function(e) {
		if(this.highlighted == false)
		{
			this._onIconClick();
		}
		else
		{
			api.console("item renaming started");
		}
	},
	highlight: function() {
		dojo.addClass(this.domNode, "desktopFileItemHighlight");
		//this is temporary
		dojo.style(this.domNode, "backgroundColor", desktop.config.wallpaper.color);
		this.highlighted = true;
	},
	unhighlight: function() {
		dojo.removeClass(this.domNode, "desktopFileItemHighlight");
		//this is temporary
		dojo.style(this.domNode, "backgroundColor", "transparent");
		this.highlighted = false;
	}
});