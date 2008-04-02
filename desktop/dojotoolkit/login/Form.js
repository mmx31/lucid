dojo.provide("login.Form");
dojo.config.parseOnLoad=true;
dojo.require("dojo.parser");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dojox.validate.web");

dojo.declare("login.Form", dijit.form.Form, {
	templateString: null,
	templatePath: dojo.moduleUrl("login", "Form.html"),
	_popup: null,
	preload: true,
	postCreate: function() {
		this.inherited(arguments);
		new dijit.form.TextBox({
			name: "username"
		}, this.usernameInputNode);
		new dijit.form.TextBox({
			type: "password",
			name: "password"
		}, this.passwordInputNode);
		new dijit.form.RadioButton({
			name: "windowAct",
			checked: true,
			value: "new"
		}, this.newWindowNode);
		new dijit.form.RadioButton({
			name: "windowAct",
			value: "current"
		}, this.currentWindowNode);
		if(this.preloadDesktop) {
			var ontype = dojo.connect(this.domNode, "onkeydown", this, function() {
				dojo.disconnect(ontype);
				dojo.xhrGet({
					url: dojo.baseUrl+"../desktop/desktop.js"
				});
			})
		}
	},
	_winCheck: function() {
		if(this._popup.closed === false) {setTimeout(dojo.hitch(this, "_winCheck"), 500);}
		else {
			this.submitNode.disabled=false;
			this.errorNode.innerHTML = "";
		}
	},
	_popUp: function()
	{
		var URL=dojo.baseUrl+"../../index.html";
		var day=new Date();
		var id=day.getTime();
		this._popup=window.open(URL,id,"toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=1024,height=786,left = 0,top = 0");
		if(!this._popup)
			return false;
		else
			return true;
	},
	onSubmit: function(e) {
		dojo.stopEvent(e);
		var contents = this.getValues();
		this.errorNode.innerHTML = "";
		this.submitNode.disabled=true;
		if(contents.username && contents.password)
		{
		this.errorNode.innerHTML = "Logging in...";
			dojo.xhrPost({
				url: dojo.baseUrl+"../../../backend/core/user.php?section=auth&action=login",
				content: contents,
				load: dojo.hitch(this, function(data)
				{
					if(data == "0")
					{
						if(contents.windowAct == "current") {
							this.errorNode.innerHTML = "Logged in. Redirecting to desktop...";
							window.location = dojo.baseUrl+"../../index.html";
						}
						else {
							if (this._popUp()) {
								this._winCheck();
								this.domNode.username.value = "";
								this.domNode.password.value = "";
								this.errorNode.innerHTML = "Logged in. Window open.";
							}
							else {
								this.errorNode.innerHTML = "Your popup blocker is blocking the Psych Desktop window.";
								this.submitNode.disabled = false;
							}
						}
					}
					else if(data == "1")
					{
						this.errorNode.innerHTML = "Incorrect username or password.";
						this.submitNode.disabled=false;
					}
					else if(data == "4" || data == "5" || data == "6")
					{
						this.errorNode.innerHTML = "A database error occured. Check Psych Desktop is installed correctly or contact the Administrator.";
						this.submitNode.disabled=false;
					}
					else if(data == "7")
					{
						this.errorNode.innerHTML = "You do not have permission to login. Contact the Administrator.";
						this.submitNode.disabled=false;
					}
					else
					{
						this.errorNode.innerHTML = "Unknown Error occured. Check your installation.";
						this.submitNode.disabled=false;
					}
				})
			});
		}
		else
		{
			this.errorNode.innerHTML = "Please provide both a username and a password";
			this.submitNode.disabled=false;
		}
		return false;
	},
	_showRegister: function() {
		var form = new login._RegisterDialog({
			parentForm: this
		});
		form.show();
	},
	_showResetPass: function() {
		console.log("test");
		var form = new login._ResetPassDialog({
			parentForm: this
		});
		form.show();
	}
});

dojo.declare("login._RegisterDialog", dijit.Dialog, {
	title: "Register",
	templateString: null,
	templatePath: dojo.moduleUrl("login", "RegisterDialog.html"),
	parentForm: null,
	postCreate: function() {
		this.inherited(arguments);
		new dijit.form.TextBox({name: "username"}, this.usernameInputNode);
		new dijit.form.TextBox({name: "email"}, this.emailInputNode);
		new dijit.form.TextBox({name: "password", type: "password"}, this.passwordInputNode);
		new dijit.form.TextBox({name: "confPassword", type: "password"}, this.confPasswordInputNode);
	},
	onSubmit: function(e){
		dojo.stopEvent(e);
		var contents = this.getValues();
		this.submitNode.disabled=true;
		this.errorNode.innerHTML = "";
		if(contents.username && contents.email && contents.password && contents.confPassword)
		{
			if(contents.password == contents.confPassword)
			{
				if(dojox.validate.isEmailAddress(contents.email))
				{
					dojo.xhrPost({
						url: dojo.baseUrl+"../../../backend/core/user.php?section=auth&action=register",
						content: contents,
						load: dojo.hitch(this, function(data, ioArgs)
						{
							if(data == "User registration disabled")
							{
								this.hide();
								this.parentForm.errorNode.innerHTML = "Public registations are disabled";
							}
							if(data == "1")
							{
								this.errorNode.innerHTML = "Username allready exists";
								this.submitNode.disabled=false;
							}
							else if(data == "0")
							{
								this.hide();
								this.parentForm.errorNode.innerHTML = "You may now log in";
							}
						})
					});
				}
				else
				{
					this.errorNode.innerHTML = "Please enter a valid email";
					this.submitNode.disabled=false;
				}
			}
			else
			{
				this.errorNode.innerHTML = "Two passwords don't match";
				this.submitNode.disabled=false;
			}
		}
		else
		{
			this.errorNode.innerHTML = "Please fill in all fields";
			this.submitNode.disabled=false;
		}
		return false;
	}
});

dojo.declare("login._ResetPassDialog", dijit.Dialog, {
	title: "Reset Password",
	templateString: null,
	templatePath: dojo.moduleUrl("login", "ResetPassDialog.html"),
	parentForm: null,
	postCreate: function() {
		this.inherited(arguments);
		new dijit.form.TextBox({name: "user"}, this.userInputNode);
		new dijit.form.TextBox({name: "email"}, this.emailInputNode);
	},
	onSubmit: function(){
		var contents = this.getValues();
		this.submitNode.disabled=true;
		this.errorNode.innerHTML = "";
		if(contents.email && contents.user)
		{
			if(dojox.validate.isEmailAddress(contents.email))
			{
				dojo.xhrPost({
					url: dojo.baseUrl+"../../../backend/core/user.php?section=auth&action=resetpass",
					content: contents,
					load: dojo.hitch(this, function(data, ioArgs) {
						if(data == "2")
						{
							this.errorNode.innerHTML = "Email on file and username don't match";
							this.submitNode.disabled=false;
						}
						else if(data == "1")
						{
							this.errorNode.innerHTML = "No such user";
							this.submitNode.disabled=false;
						}
						else if(data == "0")
						{
							this.hide();
							this.parentForm.errorNode.innerHTML = "A new password has been sent"
						}
					})
				});
			}
			else
			{
				this.errorNode.innerHTML = "Please enter a valid email";
				this.submitNode.disabled=false;
			}
		}
		else
		{
			this.errorNode.innerHTML = "Please fill out all fields";
			this.submitNode.disabled=false;
		}
		return false;
	}
});
