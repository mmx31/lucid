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
	iconStyle: "list"
});
