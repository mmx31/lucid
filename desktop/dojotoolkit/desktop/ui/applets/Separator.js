dojo.provide("desktop.ui.applets.Separator");
/*
 * Class: desktop.ui.applets.Separator
 * 
 * A basic Separator applet
 */
dojo.declare("desktop.ui.applets.Separator", desktop.ui.Applet, {
	dispName: "Separator",
	postCreate: function() {
		dojo.addClass(this.containerNode, "separator");
		dojo.style(this.handleNode, "background", "transparent none");
		dojo.style(this.handleNode, "zIndex", "100");
		dojo.style(this.containerNode, "zIndex", "1");
		this.inherited("postCreate", arguments);
	}
});