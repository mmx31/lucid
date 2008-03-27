dojo.provide("desktop.ui.applets.Seperator");
/*
 * Class: desktop.ui.applets.Seperator
 * 
 * A basic seperator applet
 */
dojo.declare("desktop.ui.applets.Seperator", desktop.ui.Applet, {
	dispName: "Seperator",
	postCreate: function() {
		dojo.addClass(this.containerNode, "seperator");
		dojo.style(this.handleNode, "background", "transparent none");
		dojo.style(this.handleNode, "zIndex", "100");
		dojo.style(this.containerNode, "zIndex", "1");
		this.inherited("postCreate", arguments);
	}
});