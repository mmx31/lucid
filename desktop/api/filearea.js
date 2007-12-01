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
	templateString: "<div class='desktopFileArea' dojoAttachPoint='focusNode,containerNode' style='overflow-x: hidden; overflow-y: scroll;'></div>",
	postCreate: function() {
		
	},
	refresh: function()
	{
		api.fs.ls({
			path: this.path,
			callback: dojo.hitch(this, function(array)
			{
				dojo.forEach(array, dojo.hitch(this, function(item) {
					this.addChild(new api.filearea._item({
						label: item.file,
						iconClass: (item.isDir == true ? "icon-32-places-folder" : "icon-32-mimetypes-text-x-generic")
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
	}
});

dojo.declare(
	"api.filearea._item",
	[dijit._Widget, dijit._Templated, dijit._Contained],
{
	iconClass: "",
	label: "file",
	highlighted: false,
	templateString: "<div class='desktopFileItem' style='float: left; padding: 10px;' dojoAttachPoint='focusNode'><center><div class='desktopFileItemIcon ${iconClass}' dojoAttachEvent='onclick:_onIconClick'></div></center><div class='desktopFileItemText' dojoAttachEvent='onclick:_onTextClick' style='text-align: center;'>${label}</div></div>",
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