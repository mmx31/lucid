dojo.provide("desktop.ui.applets.Clock");
dojo.require("dijit._Calendar");
dojo.require("dojo.date");
dojo.declare("desktop.ui.applets.Clock", desktop.ui.Applet, {
	//	summary:
	//		A clock applet with a drop-down calendar
	dispName: "Clock",
	postCreate: function(){
        dojo.attr(this.containerNode, "aria-live", "off");
		var calendar = new dijit._Calendar({});
		this.button = new dijit.form.DropDownButton({
			label: "loading...",
			dropDown: calendar
		}, this.containerNode);
		var old = "";
		this.clockInterval = setInterval(dojo.hitch(this, function(){
			var p = dojo.date.locale.format(new Date());
			/*if(this.getParent().getOrientation() == "vertical"){
				var v = "";
				for(var i=0; i<p.length; i++){
					v += "<div style='text-align: center;'>" + p.charAt(i) + "</div>";
				}
				p = v;
			}*/
			if(p != old){
				old=p;
				this.button.setLabel(p);
			}
		}), 1000);
		this.inherited("postCreate", arguments);
	},
	uninitialize: function(){
		clearInterval(this.clockInterval);
		this.inherited("uninitialize", arguments);
	}
});
