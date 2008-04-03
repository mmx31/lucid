dojo.provide("desktop.ui.applets.Clock");
dojo.require("dijit._Calendar");
dojo.require("dojo.date");
/*
 * Class: desktop.ui.applets.Clock
 * 
 * A clock applet with a popup calendar
 */
dojo.declare("desktop.ui.applets.Clock", desktop.ui.Applet, {
	dispName: "Clock",
	postCreate: function() {
		var calendar = new dijit._Calendar({});
		this.button = new dijit.form.DropDownButton({
			label: "loading...",
			dropDown: calendar
		}, this.containerNode);
		this.clockInterval = setInterval(dojo.hitch(this, function(){
			var p = dojo.date.locale.format(new Date());
			if(this.getParent().getOrientation() == "vertical") {
				var v = "";
				dojo.forEach(p, function(e) {
					v += e + "<br />";
				})
				p = v;
			}
			this.button.setLabel(p);
		}), 1000);
		this.inherited("postCreate", arguments);
	},
	uninitialize: function() {
		clearInterval(this.clockInterval);
		this.inherited("uninitialize", arguments);
	}
});