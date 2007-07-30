dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.form.Button");

function selected(page){
	dijit.byId("previous").setDisabled(page.isFirstChild);
	dijit.byId("next").setDisabled(page.isLastChild);
}
dojo.subscribe("wizard-selectChild", selected);
dojo.addOnLoad(function() {
	selected(dijit.byId("start"));
});

function getPerms()
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
		}
	});
}