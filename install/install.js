dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Form");
install = new function() {
	this.selected = function(page){
		dijit.byId("previous").setDisabled(page.isFirstChild);
		dijit.byId("next").setDisabled(page.isLastChild);
		install.currentPage = page;
		if(page.title == "Start")
		{
			dijit.byId("next").setDisabled(true);
		}
		if(page.title == "installation type")
		{
			dijit.byId("next").setDisabled(true);
		}
	}
	this.onLoad = function() {
		dojo.subscribe("wizard-selectChild", install.selected);
		install.selected(dijit.byId("start"));
		dijit.byId("next").setDisabled(install.currentPage);
		install.getPerms();
		setInterval(install.getPerms, 2000);
		setInterval(install.checkDbInput, 1000);
		dojo.forEach(['installtype-new', 'installtype-cms', 'installtype-reset'], function(e)
		{
			dijit.byId(e)._clicked = install.onTypeRadioClick;
		});
	}
	this.checkDbInput = function() {
		if (install.currentPage.title == "Database") {
			var form = dijit.byId("form");
			
		}
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
				if (install.currentPage.title == "Start") {
					dijit.byId("next").setDisabled(!ready);
				}
			},
			handleAs: "json"
		});
	},
	this.onTypeRadioClick = function(e) {
		if(!this.checked) {
			this.setChecked(true);
			dijit.byId("next").setDisabled(false);
		}
	}
}
dojo.addOnLoad(install.onLoad);