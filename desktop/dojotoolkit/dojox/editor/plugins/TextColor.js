dojo.provide("dojox.editor.plugins.TextColor");

dojo.require("dojox.editor._Plugin");
dojo.require("dijit.ColorPalette");

dojo.declare("dojox.editor.plugins.TextColor",
	dojox.editor._Plugin,
	{
		//	summary:
		//		This plugin provides dropdown color pickers for setting text color and background color
		//
		//	description:
		//		The commands provided by this plugin are:
		//		* foreColor - sets the text color
		//		* hiliteColor - sets the background color

		buttonClass: dijit.form.DropDownButton,

//TODO: set initial focus/selection state?

		constructor: function(){
			this.dropDown = new dijit.ColorPalette();
			this.connect(this.dropDown, "onChange", function(color){
				this.editor.execCommand(this.command, color);
			});
		}
	}
);

dojo.subscribe(dijit._scopeName + ".Editor.getPlugin",null,function(o){
	if(o.plugin){ return; }
	switch(o.args.name){
	case "foreColor": case "hiliteColor":
		o.plugin = new dojox.editor.plugins.TextColor({command: o.args.name});
	}
});
