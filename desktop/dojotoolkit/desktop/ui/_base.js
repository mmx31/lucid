dojo.provide("desktop.ui._base");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dojo.fx");
dojo.require("dijit.ColorPalette");
dojo.require("dojox.validate.web");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.form.Slider");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.Menu");

dojo.require("desktop.ui._appletMoveable");
dojo.require("desktop.ui.Area");
dojo.require("desktop.ui.Applet");
dojo.require("desktop.ui.Panel");
dojo.require("desktop.ui.applets.Clock");
dojo.require("desktop.ui.applets.Menu");
dojo.require("desktop.ui.applets.Menubar");
dojo.require("desktop.ui.applets.Netmonitor");
dojo.require("desktop.ui.applets.Seperator");
dojo.require("desktop.ui.applets.Taskbar");

dojo.requireLocalization("desktop.ui", "appearance");
dojo.requireLocalization("desktop.ui", "accountInfo");
dojo.requireLocalization("desktop.ui", "common");

/*
 * Class: desktop.ui
 * 
 * Summary:
 * 		Draws core UI for the desktop such as panels and wallpaper
 */
dojo.mixin(desktop.ui, {
	/*
	 * Property: _drawn
	 * 
	 * true after the UI has been drawn
	 */
	_drawn: false,
	/*
	 * Method: _draw
	 *  
	 * creates a desktop.ui.Area widget and places it on the screen
	 * waits for the config to load so we can get the locale set right
	 */
	_draw: function() {
		if(this._drawn === true) return;
		this._drawn = true;
		dojo.locale = desktop.config.locale;
		this._area = new desktop.ui.Area({});
		this.containerNode = desktop.ui._area.containerNode;
		document.body.appendChild(desktop.ui._area.domNode);
		this._area.updateWallpaper();
		this.makePanels();
		dojo.subscribe("configApply", this, function() {
			this._area.updateWallpaper();
		});
	},
	/*
	 * Method: init
	 *  
	 * subscribes to events, overwrites the autoscroll method in dojo.dnd
	 */
	init: function() {
		dojo.subscribe("configApply", this, "_draw");
		dojo.require("dojo.dnd.autoscroll");
		dojo.dnd.autoScroll = function(e) {} //in order to prevent autoscrolling of the window
	},
	/*
	 * Property: drawn
	 *  
	 * Summary:
	 * 		have the panels been drawn yet?
	 */
    drawn: false,
	/*
	 * Method: makePanels
	 *  
	 * Summary:
	 * 		the first time it is called it draws each panel based on what's stored in the configuration,
	 * 		after that it cycles through each panel and calls it's _place(); method
	 */
	makePanels: function() {
        if(this.drawn) {
	        dojo.query(".desktopPanel").forEach(function(panel) {
		       var p = dijit.byNode(panel);
		       p._place();
	        }, this);
            return;
        }
        this.drawn = true;
        var panels = desktop.config.panels;
		dojo.forEach(panels, function(panel) {
			var args = {
				thickness: panel.thickness,
				span: panel.span,
				placement: panel.placement,
				opacity: panel.opacity
			}
			var p = new desktop.ui.Panel(args);
			if(panel.locked) p.lock();
			else p.unlock();
			p.restore(panel.applets);
			desktop.ui._area.domNode.appendChild(p.domNode);
			p.startup();
		});
		desktop.ui._area.resize();
	},
	/*
	 * Method: save
	 *  
	 * Summary:
	 * 		Cylces through each panel and stores each panel's information in desktop.config
	 * 		so it can be restored during the next login
	 */
	save: function() {
		desktop.config.panels = [];
		dojo.query(".desktopPanel").forEach(function(panel, i) {
			var wid = dijit.byNode(panel);
			desktop.config.panels[i] = {
				thickness: wid.thickness,
				span: wid.span,
				locked: wid.locked,
				placement: wid.placement,
				opacity: wid.opacity,
				applets: wid.dump()
			}
		});
	},
	/*
	 * Class: desktop.ui.config
	 *  
	 * contains some configuration dialogs
	 */
	config: {
		/*
		 * Method: _wallpaper
		 * 
		 * Creates a layoutContainer with wallpaper configuration UI and returns it
		 */
		_wallpaper: function() {
			var l = dojo.i18n.getLocalization("desktop.ui", "appearance");
			var wallpaper = new dijit.layout.LayoutContainer({title: l.wallpaper});
			var c = new dijit.layout.ContentPane({layoutAlign: "client"});
			var cbody = document.createElement("div");
			dojo.style(cbody, "width", "100%");
			dojo.style(cbody, "height", "100%");
			dojo.style(cbody, "overflow", "auto");
			
			var makeThumb = function(item) {
				if(item == "") return;
				if(item === true) item = "";
				var p = document.createElement("div");
				dojo.addClass(p, "floatLeft");
				dojo.style(p, "width", "150px");
				dojo.style(p, "height", "112px");
				dojo.style(p, "margin", "5px");
				dojo.style(p, "padding", "5px");
					if (item != "") {
						var img = document.createElement("img");
						dojo.style(img, "width", "100%");
						dojo.style(img, "height", "100%");
						img.src = item; //todo: thumbnails?
						img.name = item; //so we can look it up later, src resolves a local path to a hostname
						p.appendChild(img);
					}
				if(desktop.config.wallpaper.image == item) dojo.addClass(p, "selectedItem");
				dojo.connect(p, "onclick", null, function() {
					if(desktop.config.wallpaper.image != item) {
						dojo.query(".selectedItem", c.domNode).removeClass("selectedItem");
						dojo.addClass(p, "selectedItem");
						desktop.config.wallpaper.image = item;
						desktop.config.apply();
					}
				})
				cbody.appendChild(p);
			}
			makeThumb(true);
			dojo.forEach(desktop.config.wallpaper.storedList, makeThumb);
			c.setContent(cbody);
			wallpaper.addChild(c);
			
			var nc = dojo.i18n.getLocalization("desktop", "common");
			//botom part -------------
			var color = new dijit.ColorPalette({value: desktop.config.wallpaper.color, onChange: dojo.hitch(this, function(value) {
				desktop.config.wallpaper.color = value;
				desktop.config.apply();
			})});
			var colorButton = new dijit.form.DropDownButton({
				dropDown: color,
				label: l.bgColor
			});
			var styleLabel = document.createElement("span");
			styleLabel.innerHTML = " Style:";
			var styleButton = new dijit.form.FilteringSelect({
				autoComplete: true,
				searchAttr: "label",
				style: "width: 120px;",
				store: new dojo.data.ItemFileReadStore({
					data: {
						identifier: "value",
						items: [
							{label: l.centered, value: "centered"},
							{label: l.fillScreen, value: "fillscreen"},
							{label: l.tiled, value: "tiled"}
						]
					}
				}),
				onChange: function(val) {
					if(typeof val == "undefined") return;
					desktop.config.wallpaper.style=val;
					desktop.config.apply();
				}
			});
			styleButton.setValue(desktop.config.wallpaper.style);
			var addButton = new dijit.form.Button({
				label: nc.add,
				iconClass: "icon-22-actions-list-add",
				onClick: function() {
					api.ui.fileDialog({
						callback: function(path) {
							if(path) {
								var p = api.fs.embed(path);
								for(key in desktop.config.wallpaper.storedList) {
									var val = desktop.config.wallpaper.storedList[key];
									if(val == p) return;
								}
								makeThumb(p);
								desktop.config.wallpaper.storedList.push(p);
							}
						}
					});
				}
			});
			var removeButton = new dijit.form.Button({
				label: nc.remove,
				iconClass: "icon-22-actions-list-remove",
				onClick: function() {
					var q = dojo.query("div.selectedItem img", c.domNode)
					if(q[0]) {
						dojo.forEach(desktop.config.wallpaper.storedList, function(url, i) {
							if(url == q[0].name) desktop.config.wallpaper.storedList.splice(i, 1);
						});
						q[0].parentNode.parentNode.removeChild(q[0].parentNode);
					}
				}
			});
			/*var closeButton = new dijit.form.Button({
				label: "Close",
				style: "position: absolute; right: 0px; top: 0px;",
				onClick: function() {
					win.close();
				}
			});*/
			var p = new dijit.layout.ContentPane({layoutAlign: "bottom"});
			var body = document.createElement("div");
			dojo.forEach([colorButton.domNode, styleLabel, styleButton.domNode, addButton.domNode, removeButton.domNode/*, closeButton.domNode*/], function(c) {
				dojo.addClass(c, "dijitInline");
				body.appendChild(c);
			});
			p.setContent(body);
			wallpaper.addChild(p);
			color.startup();
			return wallpaper;
		},
		/*
		 * Method: _themes
		 * 
		 * generates a theme configuration pane and returns it
		 */
		_themes: function() {
			var l = dojo.i18n.getLocalization("desktop.ui", "appearance");
			var p = new dijit.layout.LayoutContainer({title: l.theme});
			var m = new dijit.layout.ContentPane({layoutAlign: "client"});
			var area = document.createElement("div");
			var makeThumb = function(item) {
				var p = document.createElement("div");
				dojo.addClass(p, "floatLeft");
				dojo.style(p, "width", "150px");
				dojo.style(p, "height", "130px");
				dojo.style(p, "margin", "5px");
				dojo.style(p, "padding", "5px");
				var img = document.createElement("img");
				dojo.style(img, "width", "100%");
				dojo.style(img, "height", "100%");
				img.src = "./themes/"+item.sysname+"/"+item.preview;
				img.name = item.name;
				img.title = item.name;
				p.appendChild(img);
				var subtitle = document.createElement("div");
				subtitle.textContent = item.name;
				dojo.style(subtitle, "textAlign", "center");
				p.appendChild(subtitle);
				if(desktop.config.theme == item.sysname) dojo.addClass(p, "selectedItem");
				dojo.connect(p, "onclick", null, function() {
					if(desktop.config.theme != item.sysname) {
						dojo.query(".selectedItem", m.domNode).removeClass("selectedItem");
						dojo.addClass(p, "selectedItem");
						desktop.config.theme = item.sysname;
						desktop.config.apply();
					}
				})
				area.appendChild(p);
				
				if(!item.wallpaper) return;
				var wallimg = "./themes/"+item.sysname+"/"+item.wallpaper;
				for(i in desktop.config.wallpaper.storedList){
					var litem = desktop.config.wallpaper.storedList[i];
					if(litem == wallimg) return;
				}
				desktop.config.wallpaper.storedList.push(wallimg);
			}
			desktop.theme.list(function(list) {
				dojo.forEach(list, makeThumb);
			}, true);
			m.setContent(area);
			p.addChild(m);
			return p;
		},
		/*
		 * Method: _effects
		 * 
		 * generates an effects configuration pane and returns it
		 */
		_effects: function() {
			var l = dojo.i18n.getLocalization("desktop.ui", "appearance");
			var p = new dijit.layout.ContentPane({title: l.effects});
			var rows = {
				none: {
					desc: "Provides a desktop environment without any effects. Good for older computers or browsers.",
					params: {
						checked: desktop.config.fx == 0,
						onClick: function(){
							desktop.config.fx = 0;
						}
					}
				},
				basic: {
					desc: "Provides basic transitional effects that don't require a fast computer.",
					params: {
						checked: desktop.config.fx == 1,
						onClick: function(){
							desktop.config.fx = 1;
						}
					}
				},
				extra: {
					desc: "Provides a desktop environment with extra transitional effects that require a faster computer.",
					params: {
						checked: desktop.config.fx == 2,
						onClick: function(){
							desktop.config.fx = 2;
						}
					}
				},
				insane: {
					desc: "Provides a desktop environment with full transitional effects. Requires a fast-rendering browser and a fast computer.",
					params: {
						checked: desktop.config.fx == 3,
						onClick: function() {
							desktop.config.fx = 3;
						}
					}
				}
			}
			var div = document.createElement("div");
			dojo.style(div, "padding", "20px");
			for(key in rows) {
				var row = document.createElement("div");
				dojo.style(row, "margin", "10px");
				rows[key].params.name = "visualeffects_picker";
				row.appendChild(new dijit.form.RadioButton(rows[key].params).domNode);
				var desc = document.createElement("span");
				desc.innerHTML = "<b>&nbsp;&nbsp;" + (l[key] || key) + ":&nbsp;</b>" + (l[key+"Desc"] || rows[key].desc);
				dojo.style(desc, "padding-left", "10px");
				row.appendChild(desc);
				div.appendChild(row);
			};
			p.setContent(new dijit.form.Form({}, div).domNode);
			return p;
		},
		/*
		 * Method: appearance
		 *  
		 * Shows the appearance configuration dialog
		 */
		appearance: function() {
			var l = dojo.i18n.getLocalization("desktop.ui", "appearance");
			if(this.wallWin) return this.wallWin.bringToFront();
			var win = this.wallWin = new api.Window({
				title: l.appearancePrefs,
				width: "600px",
				height: "500px",
				onClose: dojo.hitch(this, function() {
					this.wallWin = false;
				})
			});
			var tabs = new dijit.layout.TabContainer({layoutAlign: "client"});
			var themes = desktop.ui.config._themes(); //so we can get any theme wallpaper first
			tabs.addChild(desktop.ui.config._wallpaper());
			tabs.addChild(themes);
			tabs.addChild(desktop.ui.config._effects());
			win.addChild(tabs);
			win.show();
			win.startup();
		},
		/*
		 * Method: account
		 *  
		 * Shows the account configuration dialog
		 */
		account: function() {
			if(this.accountWin) return this.accountWin.bringToFront();
			var win = this.accountWin = new api.Window({
				title: "Account Information",
				width: "600px",
				height: "500px",
				onClose: dojo.hitch(this, function() {
					this.accountWin = false;
				})
			});
			var top = new dijit.layout.ContentPane({layoutAlign: "top", style: "padding-bottom: 5px;"});
			var picture = new dijit.form.Button({iconClass: "icon-32-apps-system-users", label: "Picutre", showLabel: false})
			var chpasswd = document.createElement("div");
			dojo.style(chpasswd, "position", "absolute");
			dojo.style(chpasswd, "top", "0px");
			dojo.style(chpasswd, "right", "0px");
			var topRow = document.createElement("div");
			topRow.innerHTML = "User name: ";
			var usernameSpan = document.createElement("span");
			topRow.appendChild(usernameSpan);
			var button = new dijit.form.Button({
				label: "Change Password...",
				onClick: desktop.ui.config.password
			});
			chpasswd.appendChild(topRow);
			chpasswd.appendChild(button.domNode);
			
			topContent = document.createElement("div");
			dojo.forEach([picture, chpasswd], function(item) {
				topContent.appendChild(item.domNode || item);
			}, this);
			top.setContent(topContent);
			
			var client = new dijit.layout.TabContainer({
				layoutAlign: "client"
			});
			
			var general = new dijit.layout.ContentPane({title: "General"});
			
			var rows = {
				Name: {
					widget: "TextBox",
					params: {}
				},
				Email: {
					widget: "ValidationTextBox",
					params: {
						isValid: function(blah) {
							return dojox.validate.isEmailAddress(this.textbox.value);
						}
					}
				}
			}
			var div = document.createElement("div");
			var elems = {};
			for(key in rows) {
				var row = document.createElement("div");
				dojo.style(row, "marginBottom", "5px");
				row.innerHTML = key+":&nbsp;";
				row.appendChild((elems[key] = new dijit.form[rows[key].widget](rows[key].params)).domNode);
				div.appendChild(row);
			};
			general.setContent(new dijit.form.Form({}, div).domNode);
			
			client.addChild(general);
			
			var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom"});
			var close = new dijit.form.Button({
				label: "Close",
				onClick: dojo.hitch(win, win.destroy)
			});
			var p=document.createElement("div");
			dojo.addClass(p, "floatRight");
			p.appendChild(close.domNode)
			bottom.setContent(p)
			
			dojo.forEach([top, client, bottom], function(wid) {
				win.addChild(wid);
				wid.startup();
			}, this);
			desktop.user.get({callback: function(info) {
				elems["Name"].setValue(info.name);
				elems["Email"].setValue(info.email);
				usernameSpan.textContent = info.username
			}});
			dojo.connect(win, "onClose", this, function() {
				var args = {};
				for(key in elems) {
					var elem = elems[key];
					if(typeof elem.isValid != "undefined") {
						if(!elem.isValid()) continue;
					}
					switch(key) {
						case "Name":
							args.name = elem.getValue();
						case "Email":
							args.email = elem.getValue();
					}
				}
				desktop.user.set(args);
			});
			
			win.show();
			win.startup();
		},
		/*
		 * Method: password
		 * 
		 * Shows the password change dialog
		 */
		password: function() {
			if(this.passwordWin) return this.passwordWin.bringToFront();
			var win = this.passwordWin = new api.Window({
				title: "Change password",
				width: "450px",
				height: "350px",
				onClose: dojo.hitch(this, function() {
					this.passwordWin = false;
					clearTimeout(this._authTimeout);
				})
			});
			var top = new dijit.layout.ContentPane({layoutAlign: "top", style: "padding: 20px;"});
			top.setContent("To change your password, enter your current password in the field below and click <b>Authenticate</b>.<br />"
						  +"After you have authenticated, enter your new password, retype it for verification and click <b>Change Password</b>")
			
			var client = new dijit.layout.ContentPane({layoutAlign: "client"});
			var row4 = document.createElement("div");
			dojo.style(row4, "textAlign", "center");
			var onChange = dojo.hitch(this, function() {
				if(this.newpasswd.getValue() == this.confpasswd.getValue()) {
					row4.textContent = "The two passwords match";
					this.chPasswdButton.setDisabled(false)
				}
				else {
					row4.textContent = "The two passwords do not match";
					this.chPasswdButton.setDisabled(true);
				}
			});
			var row2 = document.createElement("div");
			row2.innerHTML = "New password:&nbsp;";
			var newpasswd = this.newpasswd = new dijit.form.TextBox({type: "password", onChange: onChange, disabled: true});
			row2.appendChild(newpasswd.domNode)
			var row3 = document.createElement("div");
			row3.innerHTML = "Retype new password:&nbsp;";
			var confpasswd = this.confpasswd = new dijit.form.TextBox({type: "password", onChange: onChange, disabled: true});
			row3.appendChild(confpasswd.domNode);
			var row1 = document.createElement("div");
			row1.innerHTML = "Current password:&nbsp;";
			var current = new dijit.form.TextBox({type: "password", style: "width: 125px;"});
			row1.appendChild(current.domNode);
			var resetForm = dojo.hitch(this, function() {
					current.setValue("");
					newpasswd.setValue("");
					confpasswd.setValue("");
					current.setDisabled(false);
					this.authButton.setDisabled(false);
					newpasswd.setDisabled(true);
					confpasswd.setDisabled(true);
					this.chPasswdButton.setDisabled(true);
			});
			var authButton = this.authButton = new dijit.form.Button({
				label: "Authenticate",
				onClick: dojo.hitch(this, function() {
					current.setDisabled(true);
					this.authButton.setDisabled(true);
					
					desktop.user.authentication({
						permission: "core.user.set.password",
						action: "set",
						password: current.getValue(),
						callback: dojo.hitch(this, function(data) {
							current.setDisabled(data == "0");
							authButton.setDisabled(data == "0");
							newpasswd.setDisabled(data != "0");
							confpasswd.setDisabled(data != "0");
							row4.textContent = (data == "0" ? "Authentication was successful" : "Authentication failed");
							this._authTimeout = setTimeout(resetForm, 5*60*1000);
						})
					})
				})
			})
			row1.appendChild(authButton.domNode);
			
			
			var main = document.createElement("div");
			dojo.style(main, "padding", "10px");
			dojo.forEach([row1, row2, row3, row4], function(e){ main.appendChild(e); });
			client.setContent(main);
			
			var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom"});
			var div = document.createElement("div");
			dojo.addClass(div, "floatRight");
			div.appendChild((new dijit.form.Button({
				label: "Close",
				onClick: dojo.hitch(win, win.close)
			})).domNode);
			div.appendChild((this.chPasswdButton = new dijit.form.Button({
				label: "Change password",
				disabled: true,
				onClick: dojo.hitch(this, function() {
					row4.textContent = "Changing password...";
					current.setDisabled(true);
					this.authButton.setDisabled(true);
					newpasswd.setDisabled(true);
					confpasswd.setDisabled(true);
					this.chPasswdButton.setDisabled(true);
					
					desktop.user.set({
						password: newpasswd.getValue(),
						callback: function() {
							resetForm();
							row4.textContent = "Password change successful";
							clearTimeout(this._authTimeout);
						}
					})
				})
			})).domNode);
			bottom.setContent(div);
			
			dojo.forEach([top, bottom, client], function(e) {
				win.addChild(e);
			});
			win.show();
			win.startup();
		}
	}
});

/*
 * Class: desktop.ui.appletList
 * 
 * A object where the keys are applet categories, and their values are an array of applet names.
 * These are used when showing the "Add to panel" dialog
 */
desktop.ui.appletList = {
		"Accessories": ["Clock"],
		"Desktop & Windows": ["Taskbar"],
		"System": ["Netmonitor"],
		"Utilities": ["Menu", "Menubar", "Seperator"]
}
