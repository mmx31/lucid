dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.form.Button");
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
}

this.getPerms = function()
{
	dojo.xhrGet({
		url: "./backend.php?action=checkpermissions",
		load: function(data, args)
		{
			var d = data.split("\n");
			delete d[d.length-1];
			var html = "";
			for(p in d)
			{
				q = d[p].split(":");
				html += "<b>"+q[0]+":</b>";
				if(q[1] == "ok") html += "<span style='color: green'>";
				else html += "<span style='color: red'>";
				html += q[1] + "</span>";
			}
			dojo.byId("perms").innerHTML = html;
			dojo.byId("next").setEnabled(install.currentPage);
		}
	});
}
}
dojo.addOnLoad(install.onLoad);