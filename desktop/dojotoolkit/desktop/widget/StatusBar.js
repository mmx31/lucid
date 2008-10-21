dojo.provide("desktop.widget.StatusBar");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.ProgressBar");

dojo.declare("desktop.widget.StatusBar", [dijit._Widget, dijit._Templated], {
	label: "&nbsp;",
	templateString: "<div class='desktopStatusBar'>"
	+"<div dojoAttachPoint='labelNode'>${label}</div>"
	+"<div dojoAttachPoint='progressBar' dojoType='dijit.ProgressBar' style='display: none;'></div>"
	+"</div>",
	widgetsInTemplate: true,
	// showProgress: Boolean
	//  Determines whether or not the progress bar should be shown
	showProgress: false,
	
	// progress: String (Percentage or Number)
	// 	initial progress value.
	// 	with "%": percentage value, 0% <= progress <= 100%
	// 	or without "%": absolute value, 0 <= progress <= maximum
	progress: "0",

	// maximum: Float
	// 	max sample number
	maximum: 100,

	// places: Number
	// 	number of places to show in values; 0 by default
	places: 0,

	// indeterminate: Boolean
	// 	If false: show progress.
	// 	If true: show that a process is underway but that the progress is unknown
	indeterminate: false,
	
	attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
		label: {node: "labelNode", type: "innerHTML"}
	}),
	postCreate: function() {
		dojo.setSelectable(this.domNode, false);
		this.update({progress: this.progress, maximum: this.maximum, places: this.places, indeterminate: this.indeterminate});
		dojo.connect(this.progressBar, "onChange", this, "onChange");
	},
	_setShowProgressAttr: function(value) {
        dojo.style(this.progressBar.domNode, "display", (value ? "block" : "none"));
	},
	update: function(/*Object?*/attributes){
		// summary: update progress information
		//
		// attributes: may provide progress and/or maximum properties on this parameter,
		//	see attribute specs for details.
		this.progressBar.update(attributes);
	},
	onChange: function(){
		// summary: User definable function fired when progress updates.
	}
})
