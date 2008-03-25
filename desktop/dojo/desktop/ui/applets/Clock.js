dojo.provide("desktop.ui.applets.Clock");
dojo.require("dijit._Calendar");
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
			var clock_time = new Date();
			var clock_hours = clock_time.getHours();
			var clock_minutes = clock_time.getMinutes();
			var clock_seconds = clock_time.getSeconds();
			var clock_suffix = "AM";
			if (clock_hours > 11){
				clock_suffix = "PM";
				clock_hours = clock_hours - 12;
			}
			if (clock_hours == 0){
				clock_hours = 12;
			}
			if (clock_hours < 10){
				clock_hours = "0" + clock_hours;
			}if (clock_minutes < 10){
				clock_minutes = "0" + clock_minutes;
			}if (clock_seconds < 10){
				clock_seconds = "0" + clock_seconds;
			}
			var p = clock_hours + ":" + clock_minutes + ":" + clock_seconds + " " + clock_suffix;
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