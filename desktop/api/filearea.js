/*
 * Package: filearea
 * 
 * Summary:
 * 		The file area widget
 * 
 */
dojo.provide("api.filearea");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");;

dojo.declare(
	"api.filearea",
	[dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained],
{
	path: "/",
	iconStyle: "list",
	templateString: "<div class='desktopFileArea' dojoAttachPoint='focusNode,containerNode' style='overflow-x: hidden; overflow-y: scroll;'></div>",
});

dojo.declare(
	"api.filearea._item",
	[dijit._Widget, dijit._Templated, dijit._Contained],
{
	iconClass: "",
	label: "file",
	templateString: "<div class='desktopFileItem' dojoAttachPoint='focusNode'><div class='desktopFileItemIcon ${iconClass}' dojoAttachEvent='ondijitclick:_onIconClick'></div><div class='desktopFileItemText' dojoAttachEvent='ondijitclick:_onTextClick' style='text-align: center;'>${label}</div></div>",
	onClick: function(e)
	{
		
	}
});