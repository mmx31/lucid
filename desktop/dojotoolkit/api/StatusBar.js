dojo.provide("api.StatusBar");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("api.StatusBar", [dijit._Widget, dijit._Templated], {
	label: "",
	templateString: "<div class='DesktopStatusBar'><div dojoAttachPoint='labelNode'>${label}</div></div>",
	attributeMap: {
		//uncomment for 1.2
		//label: {node: "labelNode", type: "innerHTML"}
		label: "labelNode"
	},
	setLabel: function(value) {
		//remove this function in 1.2
		this.setAttribute("label", value);
	}
})
