/*
 * Package: filearea
 * 
 * Summary:
 * 		The file area widget
 * 
 */
dojo.provide("api.filearea");
dojo.require("dijit.layout._LayoutWidget");

dojo.declare(
	"api.filearea",
	dijit.layout._LayoutWidget,
{
	path: "/",
	iconStyle: "list"
});
