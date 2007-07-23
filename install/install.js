dojo.require("dojo.parser");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.StackContainer");

function selected(page)
{
	var widget=dijit.byId("wizard");
	if(page.title=="Start") dijit.byId("previous").setDisabled(true);
	else dijit.byId("previous").setDisabled(false);
	if(page.title=="Finish") dijit.byId("next").setDisabled(true);
	else dijit.byId("next").setDisabled(false);
}
dojo.subscribe("wizard-selectChild", selected);
dojo.addOnLoad(function() { selected({title: "Start"}); });