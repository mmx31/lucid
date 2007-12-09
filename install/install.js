dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.Form");
install = new function() {
this.selected = function(page){
	dijit.byId("previous").setDisabled(page.isFirstChild);
	dijit.byId("next").setDisabled(page.isLastChild);
	install.currentPage = page;
}
this.onLoad = function() {
	dojo.subscribe("wizard-selectChild", install.selected);
	install.selected(dijit.byId("start"));
	dijit.byId("next").setDisabled(install.currentPage);
	install.getPerms();
	setInterval(install.getPerms, 5000)
}

this.getPerms = function()
{
	dojo.xhrGet({
		url: "./backend.php?action=checkpermissions",
		load: function(data, args)
		{
			var html = "<ul>";
			var ready=true;
			for (key in data) {
				html += "<li>" + key.replace("../", "") + ": ";
				if (data[key] == "ok") 
					html += "<span style='color: green'>";
				else {
					html += "<span style='color: red'>";
					ready = false;
				}
				html += data[key] + "</span></li>";
			}
			html += "</ul>";
			dojo.byId("perms").innerHTML = html;
			dijit.byId("next").setDisabled(!ready);
		},
		handleAs: "json"
	});
}
}
dojo.addOnLoad(install.onLoad);