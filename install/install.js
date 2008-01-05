dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Form");
dojo.require("dijit.ProgressBar");
install = new function() {
	this.selected = function(page){
		dijit.byId("previous").setDisabled(page.isFirstChild);
		if(page.isLastChild)
		{
			dijit.byId("previous").setDisabled(true);
			dijit.byId("next").setDisabled(false);
			dijit.byId("next").onClick = function() {
				window.location = "../";
			}
		}
		install.currentPage = page;
		if(page.title == "Start" || 
		   page.title == "installation type" ||
		   page.title == "Database" ||
		   page.title == "Installing")
		{
			dijit.byId("next").setDisabled(true);
		}
		if(page.title == "Installing")
		{
			dijit.byId("previous").setDisabled(true);
			install.doInstall();
		}
	}
	this.onLoad = function() {
		dojo.subscribe("wizard-selectChild", install.selected);
		install.selected(dijit.byId("start"));
		dijit.byId("next").setDisabled(install.currentPage);
		install.getPerms();
		setInterval(install.getPerms, 2000);
		setInterval(install.checkDbInput, 1000);
		dojo.forEach(['installtype-new', 'installtype-cms'], function(e)
		{
			dijit.byId(e)._clicked = install.onTypeRadioClick;
		});
		dijit.byId("installtype-reset")._clicked = install.onResetRadioClick;
	}
	this.checkDbInput = function() {
		if (install.currentPage.title == "Database") {
			var form = dijit.byId("form").getValues();
			if(form.db_type != "" &&
			   form.db_name != "" &&
			   form.db_username != "" &&
			   form.db_password != "")
			{
				dijit.byId("next").setDisabled(false);
			}
			else if(form.db_url != "")
				dijit.byId("next").setDisabled(false);
			else
				dijit.byId("next").setDisabled(true);
		}
	}
	this.fixurlStr = function(e)
	{
		if(typeof e != "object") var e = {target: {id: ""}};
		if (e.target.id != "urlstr") {
			var p = dijit.byId("form").getValues();
			dijit.byId("urlstr").setValue(
				p.db_type+"://"+(p.db_type == "sqlite" ? "/" : "")+(p.db_username ? p.db_username+(p.db_password ? ":"+p.db_password : "")+"@" : "") + p.db_host + (p.db_type == "sqlite" ? "?mode=666" : "") + (p.db_name ? "/" + p.db_name : "")
			);
		}
	}
	this.getPerms = function()
	{
		if (install.currentPage.title == "Start") {
			dojo.xhrGet({
				url: "./backend.php?action=checkpermissions",
				load: function(data, args){
					var html = "<ul>";
					var ready = true;
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
	this.onTypeRadioClick = function(e) {
		if(!this.checked) {
			this.setChecked(true);
			dijit.byId("next").setDisabled(false);
			dijit.byId("next").onClick = function(e) {
				dijit.byId('wizard').forward();
			};
		}
	}
	this.onResetRadioClick = function(e) {
		if(!this.checked) {
			this.setChecked(true);
			dijit.byId("next").setDisabled(false);
			dijit.byId("next").onClick = function(e) {
				dijit.byId("wizard").selectChild("install-page");
				this.onClick = function(e) { dijit.byId('wizard').forward(); }
			};
		}
	}
	this.doInstall = function()
	{
		dojo.byId("taskList").innerHTML = "";
		form = dijit.byId("form").getValues();
		if (form.type == "reset") {
			this.tasks.apps(function(umm){
				if(umm) {
				dijit.byId("next").setDisabled(false);
				install.updateBar(100);
				}
				else {
				dijit.byId("next").setDisabled(true);
				dijit.byId("previous").setDisabled(false);
				install.updateBar(0);
				}
			});
		}
		else {
			this.tasks.database(form, function(nodberr){
				if (nodberr) {
					install.updateBar(33);
					install.tasks.apps(function(noerr){
						if (noerr) {
							install.updateBar(66);
							install.tasks.admin(form, function(umm){
								if (umm) {
									dijit.byId("next").setDisabled(false);
									install.updateBar(100);
								}
								else {
									install.Err();
								}
							});
						}
						else {
							install.Err();
						}
					});
				} else {
					install.Err();
				}
			});
		}
	},
	this.Err = function() {
		dijit.byId("next").setDisabled(true);
		dijit.byId("previous").setDisabled(false);
		install.updateBar(0);
	}
	this.updateBar = function(percent)
	{
		dijit.byId("progressBar").update({
			indeterminate: false,
			maximum: 100,
			progress: percent
		});
	}
	this.tasks = {
		apps: function(callback)
		{
			dojo.xhrGet({
				url: "./backend.php?action=installprograms",
				load: function(data, args){
					if (typeof data != "string") {
						var html = "<ul>";
						var ready = true;
						for (key in data) {
							html += "<li>" + key.replace("../", "") + ": ";
							if (data[key] == "...done") 
								html += "<span style='color: green'>";
							else {
								html += "<span style='color: red'>";
								ready = false;
							}
							html += data[key] + "</span></li>";
						}
						html += "</ul>";
						dojo.byId("taskList").innerHTML += html;
						callback(ready);
					}
					else {
						dojo.byId("taskList").innerHTML += "<span style='color: red'>A problem occurred:</span><br />"+data;
						callback(false);
						//TODO: once the output framework is used tell the user what went wrong.
					}
				},
				callback: callback,
				handleAs: "json"
			});
		},
		admin: function(form, callback) {
			dojo.xhrPost({
				url: "./backend.php?action=installadmin",
				content: {
					username: form.admin_user,
					password: form.admin_pass,
					email: form.admin_email
				},
				load: function(data, args){
					if (typeof data != "string") {
						var html = "<ul>";
						var ready = true;
						for (key in data) {
							html += "<li>" + key.replace("../", "") + ": ";
							if (data[key] == "...done") 
								html += "<span style='color: green'>";
							else {
								html += "<span style='color: red'>";
								ready = false;
							}
							html += data[key] + "</span></li>";
						}
						html += "</ul>";
						dojo.byId("taskList").innerHTML += html;
						callback(ready);
					}
					else {
						dojo.byId("taskList").innerHTML += "<span style='color: red'>A problem occurred:</span><br />"+data;
						callback(false);
						//TODO: once the output framework is used tell the user what went wrong.
					}
				},
				callback: callback,
				handleAs: "json"
			});
		},
		database: function(form, callback) {
		dojo.xhrGet({
				url: "./backend.php?action=installdatabase",
				content: {
					db_url: form.db_url,
					db_prefix: form.db_prefix
				},
				load: function(data, args){
					if (typeof data != "string") {
						var html = "<ul>";
						var ready = true;
						for (key in data) {
							html += "<li>" + key.replace("../", "") + ": ";
							if (data[key] == "...done") 
								html += "<span style='color: green'>";
							else {
								html += "<span style='color: red'>";
								ready = false;
							}
							html += data[key] + "</span></li>";
						}
						html += "</ul>";
						dojo.byId("taskList").innerHTML += html;
						callback(ready);
					}
					else {
						dojo.byId("taskList").innerHTML += "<span style='color: red'>A problem occurred:</span><br />"+data;
						callback(false);
						//TODO: once the output framework is used tell the user what went wrong.
					}
				},
				callback: callback,
				handleAs: "json"
			});
		}
	}
}
dojo.addOnLoad(install.onLoad);