dojo.provide("desktop.ui");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dojo.fx");
dojo.require("dojox.validate.web");
/*
 * Class: desktop.ui
 * 
 * Summary:
 * 		Draws core UI for the desktop such as panels and wallpaper
 */
desktop.ui = {
	/*
	 * Method: draw
	 *  
	 * Summary:
	 * 		creates a desktop.ui.area widget and places it on the screen
	 */
	draw: function() {
		desktop.ui._area = new desktop.ui.area();
		desktop.ui.containerNode = desktop.ui._area.containerNode;
		document.body.appendChild(desktop.ui._area.domNode);
	},
	/*
	 * Method: init
	 *  
	 * Summary:
	 * 		subscribes to events, overwrites the autoscroll method in dojo.dnd
	 */
	init: function() {
		dojo.subscribe("configApply", this, this.makePanels);
		dojo.subscribe("configApply", this, function() {
			desktop.ui._area.updateWallpaper();
		});
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
			var p = new desktop.ui.panel(args);
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
			var wallpaper = new dijit.layout.LayoutContainer({title: "Wallpaper"});
			var c = new dijit.layout.ContentPane({layoutAlign: "client"});
			var cbody = document.createElement("div");
			dojo.style(cbody, "width", "100%");
			dojo.style(cbody, "height", "100%");
			dojo.style(cbody, "overflow", "auto");
			
			var makeThumb = function(item) {
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
			makeThumb("");
			dojo.forEach(desktop.config.wallpaper.storedList, makeThumb);
			c.setContent(cbody);
			wallpaper.addChild(c);
			
			//botom part -------------
			var color = new dijit.ColorPalette({value: desktop.config.wallpaper.color, onChange: dojo.hitch(this, function(value) {
				desktop.config.wallpaper.color = value;
				desktop.config.apply();
			})});
			var colorButton = new dijit.form.DropDownButton({
				dropDown: color,
				label: "Background Color"
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
							{label: "Centered", value: "centered"},
							{label: "Fill Screen", value: "fillscreen"},
							{label: "Tiled", value: "tiled"}
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
				label: "Add",
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
				label: "Remove",
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
			var p = new dijit.layout.LayoutContainer({title: "Theme"});
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
			var p = new dijit.layout.ContentPane({title: "Visual Effects"});
			var rows = {
				None: {
					desc: "Provides a desktop environment without any effects. Good for older computers or browsers.",
					params: {
						checked: desktop.config.fx == 0,
						onClick: function(){
							desktop.config.fx = 0;
						}
					}
				},
				Basic: {
					desc: "Provides basic transitional effects that don't require a fast computer.",
					params: {
						checked: desktop.config.fx == 1,
						onClick: function(){
							desktop.config.fx = 1;
						}
					}
				},
				Extra: {
					desc: "Provides a desktop environment with extra transitional effects that require a faster computer.",
					params: {
						checked: desktop.config.fx == 2,
						onClick: function(){
							desktop.config.fx = 2;
						}
					}
				},
				Insane: {
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
				desc.innerHTML = "<b>&nbsp;&nbsp;" +key + ":&nbsp;</b>" + rows[key].desc;
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
			if(this.wallWin) return this.wallWin.bringToFront();
			var win = this.wallWin = new api.window({
				title: "Appearance Preferences",
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
			var win = this.accountWin = new api.window({
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
			var win = this.passwordWin = new api.window({
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
}

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dojo.dnd.move");
dojo.require("dijit.ColorPalette");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.data.ItemFileReadStore");


/*
 * 
 * Class: desktop.ui.area
 *  
 * Summary:
 * 		the main UI area of the desktop. This is where panels, wallpaper, and most other things are drawn.
 */
dojo.declare("desktop.ui.area", [dijit._Widget, dijit._Templated, dijit._Container], {
	templateString: "<div class=\"uiArea\"><div dojoAttachPoint=\"containerNode\" style=\"position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 10;\"></div><div dojoAttachPoint=\"wallpaperNode\" class=\"wallpaper\" style=\"position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 1;\"></div></div>",
	drawn: false,
	postCreate: function() {
		var filearea = this.filearea = new api.filearea({path: "/Desktop/", forDesktop: true, subdirs: false, style: "position: absolute; top: 0px; left: 0px; width: 100%; height: 100%;", overflow: "hidden"});
		dojo.addClass(filearea.domNode, "mainFileArea");
		filearea.menu.addChild(new dijit.MenuSeparator({}));
		filearea.menu.addChild(new dijit.MenuItem({label: "Wallpaper", iconClass: "icon-16-apps-preferences-desktop-wallpaper", onClick: dojo.hitch(desktop.ui.config, "appearance")}));
		filearea.refresh();
		dojo.style(filearea.domNode, "zIndex", 1);
		this.containerNode.appendChild(filearea.domNode);
		
		if(dojo.isIE){
			dojo.connect(this.domNode,'onresize', this,"resize");
		}
		dojo.connect(window,'onresize',this,"resize");
	},
	/*
	 * Method: getBox
	 * 
	 * gets the ammount of space the panels are taking up on each side of the screen.
	 * Used to calculate the size of the windows when maximized.
	 */
	getBox: function() {
		var thicknesses = {BR: 0, BL: 0, BC: 0, TR: 0, TL: 0, TC: 0, LT: 0, LC: 0, LB: 0, RT: 0, RC: 0, RB: 0};
		dojo.query(".desktopPanel").forEach(function(panel, i) {
			var w = dijit.byNode(panel);
			if(w.span == 1) {
				var slot = w.placement.charAt(0);
				if(w.orientation == "horizontal") {
					thicknesses[slot+"L"] += w.thickness;
					thicknesses[slot+"R"] += w.thickness;
					thicknesses[slot+"C"] += w.thickness;
				}
				else {
					thicknesses[slot+"T"] += w.thickness;
					thicknesses[slot+"B"] += w.thickness;
					thicknesses[slot+"C"] += w.thickness;
				}
			}
			else thicknesses[w.placement] += w.thickness;
		}, this);
		var max = {B: 0, T: 0, L: 0, R: 0};
		for(k in thicknesses) {
			if(max[k.charAt(0)] < thicknesses[k]) {
				max[k.charAt(0)] = thicknesses[k];
			}
		}
		return max;
	},
	/*
	 * Method: resize
	 * 
	 * Event handler
	 * Does some cleanup when the window is resized. For example it moves the filearea.
	 * Also called when a panel is moved.
	 */
	resize: function(e) {
		var max = this.getBox();
		var viewport = dijit.getViewport();
		dojo.style(this.filearea.domNode, "top", max.T);
		dojo.style(this.filearea.domNode, "left", max.L);
		dojo.style(this.filearea.domNode, "width", viewport.w - max.R);
		dojo.style(this.filearea.domNode, "height", viewport.h - max.B);
		dojo.query("div.win", desktop.ui.containerNode).forEach(function(win) {
			var c = dojo.coords(win);
			if(c.t < max.T && max.T > 0) dojo.style(win, "top", max.T+c.t+"px");
			if(c.l < max.L && max.L > 0) dojo.style(win, "left", max.L+c.l+"px");
			if(c.l > viewport.w - max.R && ((max.R > 0 || e.type=="resize") || (max.R > 0 && e.type=="resize"))) dojo.style(win, "left", (viewport.w - 20  - max.R)+"px");
			if(c.t > viewport.h - max.B && ((max.B > 0 || e.type=="resize") || (max.B > 0 && e.type=="resize"))) dojo.style(win, "top", (viewport.h - 20 - max.B)+"px");
		}, this);
	},
	/*
	 * Method: updateWallpaper
	 * 
	 * Updates the wallpaper based on what's in desktop.config. Called when the configuration is applied.
	 */
	updateWallpaper: function() {
		var image = desktop.config.wallpaper.image;
		var color = desktop.config.wallpaper.color;
		var style = desktop.config.wallpaper.style;
		dojo.style(this.wallpaperNode, "backgroundColor", color);
		if(image == "") {
			if(this.wallpaperImageNode) {
				 this.wallpaperImageNode.parentNode.removeChild(this.wallpaperImageNode);
				 this.wallpaperImageNode = false;
			}
			dojo.style(this.wallpaperNode, "backgroundImage", "none");
			return;
		}
		else if(style == "centered" || style == "tiled")
			dojo.style(this.wallpaperNode, "backgroundImage", "url("+image+")");
			if(this.wallpaperImageNode) {
				 this.wallpaperImageNode.parentNode.removeChild(this.wallpaperImageNode);
				 this.wallpaperImageNode = false;
			}
		if(style == "centered")
			dojo.style(this.wallpaperNode, "backgroundRepeat", "no-repeat");
		else if(style == "tiled")
			dojo.style(this.wallpaperNode, "backgroundRepeat", "repeat");
		else if(style == "fillscreen") {
			dojo.style(this.wallpaperNode, "backgroundImage", "none");
			if(!this.wallpaperImageNode) {
				this.wallpaperImageNode = document.createElement("img");
				dojo.style(this.wallpaperImageNode, "width", "100%");
				dojo.style(this.wallpaperImageNode, "height", "100%");
				this.wallpaperNode.appendChild(this.wallpaperImageNode);
			}
			this.wallpaperImageNode.src = image;
		}
		var css = dojo.byId("corestyle").sheet;
		if (css.cssRules)
			var rules = css.cssRules
		else if (css.rules)
			var rules = css.rules
		rules[0].style.backgroundColor = desktop.config.wallpaper.color;
	}
});
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.Slider");
dojo.require("dijit.form.NumberSpinner");
/*
 * Class: desktop.ui.panel
 * 
 * A customizable toolbar that you can reposition and add/remove/reposition applets on
 */
dojo.declare("desktop.ui.panel", [dijit._Widget, dijit._Templated, dijit._Container], {
	templateString: "<div class=\"desktopPanel\" dojoAttachEvent=\"onmousedown:_onClick, oncontextmenu:_onRightClick\"><div class=\"desktopPanel-start\"><div class=\"desktopPanel-end\"><div class=\"desktopPanel-middle\" dojoAttachPoint=\"containerNode\"></div></div></div></div>",
	/*
	 * Property: span
	 * a number between 0 and 1 indicating how far the panel should span accross (1 being the whole screen, 0 being none)
	 */
	span: 1,
	/*
	 * Property: opacity
	 * a number between 0 and 1 indicating how opaque the panel should be (1 being visible, 0 being completely transparent)
	 */
	opacity: 1,
	/*
	 * Property: thickness
	 * how thick the panel should be in pixels
	 */
	thickness: 24,
	/*
	 * Property: locked
	 * are the applets and the panel itself be repositionable?
	 */
	locked: false,
	/*
	 * Property: placement
	 * where the panel should be placed on the screen. 
	 * acceptible values are "BL", "BR", "BC", "TL", "TR", "TC", "LT", "LB", "LC", "RT", "RB", or "RC".
	 * The first character indicates the side, the second character indicates the placement.
	 * R = right, L = left, T = top, and B = bottom.
	 * So LT would be on the left side on the top corner. 
	 */
	placement: "BL",
	/*
	 * Method: getOrientation
	 * 
	 * Gets the orientation of the panel
	 * Returns "horizontal" or "vertical"
	 */
	getOrientation: function() {
		var s = this.placement.charAt(0);
		return (s == "B" || s == "T") ? "horizontal" : "vertical";
	},
	/*
	 * Method: _onClick
	 * 
	 * Event handler for when the mouse is pressed. Makes various event connections.
	 */
	_onClick: function(e) {
		if(!this.locked) {
			this._docMouseUpEvent = dojo.connect(document, "onmouseup", this, "_onRelease");
			this._onOutEvent = dojo.connect(this.domNode, "onmouseout", this, function(){
				dojo.disconnect(this._onOutEvent);
				this._onDragEvent = dojo.connect(document, "onmousemove", this, "_onMove");
				this._docEvents = [
					dojo.connect(document, "ondragstart", dojo, "stopEvent"),
					dojo.connect(document, "onselectstart", dojo, "stopEvent")
				];
				this._docMouseUpEvent = dojo.connect(document, "onmouseup", this, "_onRelease");
			});
		}
		dojo.stopEvent(e);
	},
	/*
	 * Method: _onRightClick
	 * 
	 * Event handler for when the right mouse button is pressed. Shows the panel's context menu.
	 */
	_onRightClick: function(e) {
		if(this.menu) this.menu.destroy();
		this.menu = new dijit.Menu({});
		this.menu.addChild(new dijit.MenuItem({label: "Add to panel", iconClass: "icon-16-actions-list-add", onClick: dojo.hitch(this, this.addDialog)}));
		this.menu.addChild(new dijit.MenuItem({label: "Properties", iconClass: "icon-16-actions-document-properties", onClick: dojo.hitch(this, this.propertiesDialog)}));
		this.menu.addChild(new dijit.MenuItem({label: "Delete This Panel", iconClass: "icon-16-actions-edit-delete", disabled: (typeof dojo.query(".desktopPanel")[1] == "undefined"), onClick: dojo.hitch(this, function() {
			//TODO: animate?
			this.destroy();
		})}));
		this.menu.addChild(new dijit.MenuSeparator);
		if(this.locked) {
			this.menu.addChild(new dijit.MenuItem({label: "Unlock the Panel", onClick: dojo.hitch(this, this.unlock)}));
		}
		else {
			this.menu.addChild(new dijit.MenuItem({label: "Lock the Panel", onClick: dojo.hitch(this, this.lock)}));
		}
		this.menu.addChild(new dijit.MenuSeparator);
		this.menu.addChild(new dijit.MenuItem({label: "New Panel", iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, function() {
			var p = new desktop.ui.panel();
			desktop.ui._area.domNode.appendChild(p.domNode);
			p.startup();
		})}));
		this.menu._contextMouse();
		this.menu._openMyself(e);
		//TODO: destroy menu when blurred?
	},
	/*
	 * Method: propertiesDialog
	 * 
	 * Shows a small properties dialog for the panel.
	 */
	propertiesDialog: function() {
		if(this.propertiesWin) {
			this.propertiesWin.bringToFront();
			return;
		}
		var win = this.propertiesWin = new api.window({
			title: "Panel Properties",
			width: "180px",
			height: "200px",
			onClose: dojo.hitch(this, function() {
				this.propertiesWin = false;
			})
		});
		var client = new dijit.layout.ContentPane({layoutAlign: "client", style: "padding: 5px;"});
		var div = document.createElement("div");
		var rows = {
			Width: {
				widget: "HorizontalSlider",
				params: {
					maximum: 1,
					minimum: 0.01,
					value: this.span,
					showButtons: false,
					onChange: dojo.hitch(this, function(value) {
						this.span = value;
						this._place();
					})
				}
			},
			Thickness: {
				widget: "NumberSpinner",
				params: {
					constraints: {min: 20, max: 200},
					value: this.thickness,
					style: "width: 60px;",
					onChange: dojo.hitch(this, function(value) {
						this.thickness = value;
						dojo.style(this.domNode, this.getOrientation() == "horizontal" ? "width" : "height", this.thickness+"px");
						this._place();
					})
				}
			},
			Opacity: {
				widget: "HorizontalSlider",
				params: {
					maximum: 1,
					minimum: 0.1,
					value: this.opacity,
					showButtons: false,
					onChange: dojo.hitch(this, function(value) {
						this.opacity = value;
						dojo.style(this.domNode, "opacity", value);
					})
				}
			}
		};
		for(key in rows) {
			var row = document.createElement("div");
			dojo.style(row, "marginBottom", "5px");
			row.innerHTML = key+":&nbsp;";
			row.appendChild(new dijit.form[rows[key].widget](rows[key].params).domNode);
			div.appendChild(row);
		};
		client.setContent(new dijit.form.Form({}, div).domNode);
		win.addChild(client);
		var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom", style: "height: 40px;"});
		var button = new dijit.form.Button({label: "Close"});
		bottom.setContent(button.domNode);
		win.addChild(bottom);
		dojo.connect(button, "onClick", this, function() {
			this.propertiesWin.close();
		});
		win.show();
		win.startup();
	},
	/*
	 * Method: addDialog
	 * 
	 * Shows the "Add to panel" dialog so the user can add applets
	 */
	addDialog: function() {
		if(this.window) {
			this.window.bringToFront();
			return;
		}
		var win = this.window = new api.window({
			title: "Add to panel",
			onClose: dojo.hitch(this, function() {
				this.window = false;
			})
		});
		var client = new dijit.layout.ContentPane({layoutAlign: "client", style: "border: 1px solid black;"});
		this.addDialogSelected = "";
		this.addDialogIcons = [];
		var div = document.createElement("div");
		dojo.forEach([
			{k: "overflow", v: "auto"},
			{k: "width", v: "100%"},
			{k: "height", v: "100%"}
		], function(i) {
			dojo.style(div, i.k, i.v);
		});
		for(key in desktop.ui.appletList) {
			var header = document.createElement("h4");
			header.innerText = key;
			div.appendChild(header);
			for(applet in desktop.ui.appletList[key]) {
				var name = desktop.ui.appletList[key][applet];
				var iconClass = desktop.ui.applets[name].prototype.appletIcon;
				var dispName = desktop.ui.applets[name].prototype.dispName;
				c = document.createElement("div");
				c.name = name;
				dojo.addClass(c, "dijitInline");
				c.innerHTML = "<div class='"+iconClass+"'></div><span style='padding-top: 5px; padding-bottom: 5px;'>"+dispName+"</span>";
				div.appendChild(c);
				this.addDialogIcons.push(c);
			}
			div.appendChild(document.createElement("hr"));
		}
		client.setContent(div);
		win.addChild(client);
		dojo.forEach(this.addDialogIcons, function(c) {
			dojo.connect(c, "onclick", this, function(e) {
				dojo.forEach(this.addDialogIcons, function(icon) {
					dojo.removeClass(icon, "selectedItem");
				})
				dojo.addClass(c, "selectedItem");
				this.addDialogSelected = c.name;
			});
		}, this);
		var bottom = new dijit.layout.ContentPane({layoutAlign: "bottom", style: "height: 40px;"});
		var button = new dijit.form.Button({label: "Add to panel", style: "float: right;"});
		bottom.setContent(button.domNode);
		win.addChild(bottom);
		dojo.connect(button, "onClick", this, function() {
			if(dojo.isFunction(desktop.ui.applets[this.addDialogSelected])) {
				var applet = new desktop.ui.applets[this.addDialogSelected]();
				this.addChild(applet);
				applet.startup();
				desktop.ui.save();
			}
		});
		win.show();
		win.startup();
	},
	/*
	 * Method: _onRelease
	 * 
	 * Disconnects the event handlers that were created in _onClick
	 */
	_onRelease: function() {
		dojo.disconnect(this._onDragEvent);
		dojo.disconnect(this._docMouseUpEvent);
		dojo.disconnect(this._onOutEvent); //just to be sure...
		dojo.forEach(this._docEvents, dojo.disconnect);
	},
	/*
	 * Method: _onMove
	 * 
	 * Event handler for when the panel is being dragged.
	 * gets nearest edge, moves the panel there if we're not allready, and re-orients itself
	 * also checks for any panels allready placed on that edge
	 */
	_onMove: function(e) {
		var viewport = dijit.getViewport();
		var newPos;

		if(e.clientY < viewport.h/3 && e.clientX < viewport.w/3) {
			if(e.clientX / (viewport.w/3) > e.clientY / (viewport.h/3)) newPos = "TL";
			else newPos = "LT";
		}
		else if(e.clientY > (viewport.h/3)*2 && e.clientX < viewport.w/3) {
			if(e.clientX / (viewport.w/3) > ((viewport.h/3)-(e.clientY-(viewport.h/3)*2)) / (viewport.h/3))
				newPos = "BL";
			else
				newPos = "LB";
			
		}
		else if(e.clientY < viewport.h/3 && e.clientX > (viewport.w/3)*2) {
			if(((viewport.w/3)-(e.clientX-(viewport.w/3)*2)) / (viewport.w/3) > e.clientY / (viewport.h/3))
				newPos = "TR";
			else
				newPos = "RT";
		}
		else if(e.clientY > (viewport.h/3)*2 && e.clientX > (viewport.w/3)*2) {
			if((e.clientX - (viewport.w/3)*2) / (viewport.w/3) > (e.clientY - (viewport.h/3)*2) / (viewport.h/3)) newPos = "RB";
			else newPos = "BR";
		}
		else {
			if(e.clientY < viewport.h/3) newPos = "TC";
			else if(e.clientX < viewport.w/3) newPos = "LC";
			else if(e.clientY > (viewport.h/3)*2) newPos = "BC";
			else if(e.clientX > (viewport.w/3)*2) newPos = "RC";
			else newPos = this.placement;
		}
		if (this.placement != newPos) {
			this.placement = newPos;
			desktop.ui._area.resize();
			this._place();
		}
		dojo.stopEvent(e);
	},
	uninitialize: function() {
		dojo.forEach(this.getChildren(), function(item) {
			item.destroy();
		});
		setTimeout(dojo.hitch(desktop.ui._area, "resize"), 1000);
		if(this.window) this.window.destroy();
	},
	/*
	 * Method: _place
	 * 
	 * Updates the position and size of the panel
	 */
	_place: function() {
		var viewport = dijit.getViewport();
		var s = {};
		if(this.placement.charAt(0) == "T" || this.placement.charAt(0) == "B") {
			this._makeHorizontal();
			if(this.placement.charAt(1) == "R") 
				s.left = (viewport.w - this.domNode.offsetWidth);
			if(this.placement.charAt(1) == "L") 
				s.left = viewport.l;
			if(this.placement.charAt(1) == "C") {
				if(this.span != 1) {
					s.left = (viewport.w - (this.span*viewport.w)) / 2;
				}
				else 
					s.left = viewport.l;
			}
			
			if(this.placement.charAt(0) == "B") 
				s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight;
			else 
				if(this.placement.charAt(0) == "T") 
					s.top = viewport.t;
		}
		else {
			//we need a completely different layout algorytm :D
			this._makeVertical();
			if(this.placement.charAt(1) == "C") {
				if(this.span != 1) {
					var span = dojo.style(this.domNode, "height");
					s.top = (viewport.h - span)/2;
				}
			}
			else if(this.placement.charAt(1) == "B") {
				s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight;
			}
			else {
				s.top = viewport.t;
			}
			if(this.placement.charAt(0) == "L") {
				s.left = viewport.l;
			}
			else {
				s.left = (viewport.w + viewport.l) - this.domNode.offsetWidth;
			}
		}
		var sides = {
			T: "Top",
			L: "Left",
			R: "Right",
			B: "Bottom"
		}
		for(sk in sides) {
			dojo.removeClass(this.domNode, "desktopPanel"+sides[sk]);
		}
		dojo.addClass(this.domNode, "desktopPanel"+sides[this.placement.charAt(0)]);
		
		var count = 0;
		//check for other panels in the same slot as us
		dojo.query(".desktopPanel").forEach(dojo.hitch(this, function(panel) {
			var panel = dijit.byNode(panel);
			if(panel.id != this.id) {
				if(this.placement.charAt(0) == panel.placement.charAt(0) && (panel.span==1 || this.span==1)) count += panel.thickness;
				else if(panel.placement == this.placement)
					count += panel.thickness;
			}
		}));
		if(this.placement.charAt(0) == "L" || this.placement.charAt(0) == "T") s[this.getOrientation() == "horizontal" ? "top" : "left"] += count;
		else s[this.getOrientation() == "horizontal" ? "top" : "left"] -= count;
		if(desktop.config.fx) {
			var props = {};
			for(key in s) {
				props[key] = {end: s[key]};
			}
			dojo.animateProperty({
				node: this.domNode,
				properties: props,
				duration: desktop.config.window.animSpeed
			}).play();
		}
		else {
			for(key in s) {
				this.domNode.style[key] = s[key]+"px";
			}
		}
		dojo.forEach(this.getChildren(), function(item) {
			item.resize();
		});
		desktop.ui.save();
	},
	/*
	 * Method: resize
	 * 
	 * Called when the window is resized. Resizes the panel to the new window height
	 */
	resize: function() {
		var viewport = dijit.getViewport();
		dojo.style(this.domNode, (this.getOrientation() == "horizontal" ? "width" : "height"), this.span*viewport[(this.getOrientation() == "horizontal" ? "w" : "h")]);
		dojo.style(this.domNode, (this.getOrientation() == "vertical" ? "width" : "height"), this.thickness);
		dojo.forEach(this.getChildren(), function(item) {
			item.resize();
		});
	},
	/*
	 * Method: _makeVertical
	 * 
	 * Orients the panel's applets vertically
	 */
	_makeVertical: function() {
		dojo.removeClass(this.domNode, "desktopPanelHorizontal");
		dojo.addClass(this.domNode, "desktopPanelVertical");
		this.resize();
	},
	/*
	 * Method: _makeHorizontal
	 * 
	 * Orients the panel's applets horizontally
	 */
	_makeHorizontal: function() {
		dojo.removeClass(this.domNode, "desktopPanelVertical");
		dojo.addClass(this.domNode, "desktopPanelHorizontal");
		this.resize();
	},
	/*
	 * Method: lock
	 * 
	 * Locks the panel
	 */
	lock: function() {
		this.locked = true;
		dojo.forEach(this.getChildren(), function(item) {
			item.lock();
		});
	},
	/*
	 * Method: unlock
	 * 
	 * Unlocks the panel
	 */
	unlock: function() {
		this.locked = false;
		dojo.forEach(this.getChildren(), function(item) {
			item.unlock();
		});
	},
	/*
	 * Method: dump
	 * 
	 * Returns a javascript object that can be used to restore the panel using the restore method
	 */
	dump: function() {
		var applets = [];
		var myw = dojo.style(this.domNode, "width"), myh = dojo.style(this.domNode, "height");
		dojo.forEach(this.getChildren(), dojo.hitch(this, function(item) {
			var left=dojo.style(item.domNode, "left"), top=dojo.style(item.domNode, "top");
			var pos = (this.getOrientation() == "horizontal" ? left : top);
			pos = pos / (this.getOrientation() == "horizontal" ? myw : myh);
			var applet = {
				settings: item.settings,
				pos: pos,
				declaredClass: item.declaredClass
			};
			applets.push(applet);
		}));
		return applets;
	},
	/*
	 * Method: restore
	 * 
	 * Restores the panel's applets
	 * 
	 * Arguments:
	 * 		applets - an array of applets to restore (generated by the dump method)
	 */
	restore: function(/*Array*/applets) {
		var size = dojo.style(this.domNode, this.getOrientation() == "horizontal" ? "width" : "height");
		dojo.forEach(applets, dojo.hitch(this, function(applet) {
			var construct = eval(applet.declaredClass);
			var a = new construct({settings: applet.settings, pos: applet.pos});
			if(this.locked) a.lock();
			else a.unlock();
			this.addChild(a);
			a.startup();
		}));
	},
	startup: function() {
		if(desktop.config.fx) {
			//TODO: add to viewport when there are other panels around!
			var viewport = dijit.getViewport();
			if(this.placement.charAt(0) == "B") {
				dojo.style(this.domNode, "top", viewport.h + this.thickness);
			}
			else if(this.placement.charAt(0) == "T") {
				dojo.style(this.domNode, "top", -(this.thickness))
			}
			else if(this.placement.charAt(0) == "R") {
				dojo.style(this.domNode, "left", viewport.w + this.thickness);
			}
			else {
				dojo.style(this.domNode, "left", -(this.thickness));
			}
			
			if(this.placement.charAt(1) == "T") {
				dojo.style(this.domNode, "top", "0px");
			} else if(this.placement.charAt(1) == "B") {
				dojo.style(this.domNode, "top", (viewport.h - this.domNode.offsetHeight)+"px");
			} else if(this.placement.charAt(1) == "L") {
				dojo.style(this.domNode, "left", "0px");
			} else if(this.placement.charAt(1) == "R") {
				dojo.style(this.domNode, "left", (viewport.w - this.domNode.offsetWidth)+"px");
			}
			else {
				if(this.getOrientation() == "horizontal")
					dojo.style(this.domNode, "left", (( viewport.w - (viewport.w*this.span))/2)+"px");
				else
					dojo.style(this.domNode, "top", ((viewport.h - (this.span*viewport.h)) / 2)+"px");
			}
		}
		dojo.style(this.domNode, "zIndex", 9999*9999);
		dojo.style(this.domNode, "opacity", this.opacity);
		if(dojo.isIE){
			dojo.connect(this.domNode,'onresize', this,"_place");
		}
		dojo.connect(window,'onresize',this,"_place");
		this._place();
		//if(this.getOrientation() == "horizontal") this._makeHorizontal();
		//else this._makeVertical();
	}
});

/*
 * Class: desktop.ui._appletMoveable
 * 
 * A subclassed dojo.dnd.move.constrainedMoveable for desktop.ui.applet
 */
dojo.declare("desktop.ui._appletMoveable", dojo.dnd.move.constrainedMoveable, {
	onMove: function(/* dojo.dnd.Mover */ mover, /* Object */ leftTop){
		// summary: called during every move notification,
		//	should actually move the node, can be overwritten.
		var c = this.constraintBox;
		leftTop.l = leftTop.l < c.l ? c.l : c.r < leftTop.l ? c.r : leftTop.l;
		leftTop.t = leftTop.t < c.t ? c.t : c.b < leftTop.t ? c.b : leftTop.t;
		dojo.marginBox(mover.node, leftTop);
		this.onMoved(mover, leftTop);
	}
});
dojo.require("dijit.Menu");
/*
 * Class: desktop.ui.applet
 * 
 * An applet that can be added to a panel
 */
dojo.declare("desktop.ui.applet", [dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained], {
	templateString: "<div class=\"desktopApplet\" dojoAttachEvent=\"onmouseover:_mouseover,onmouseout:_mouseout\"><div class=\"desktopAppletHandle\" dojoAttachPoint=\"handleNode\"></div><div class=\"desktopAppletContent\" dojoAttachPoint=\"containerNode\"></div></div>",
	/*
	 * Property: settings
	 * 
	 * An object with settings for the applet. This is persistant.
	 */
	settings: {},
	/*
	 * Property: locked
	 * 
	 * Weather or not the applet is locked on the panel.
	 */
	locked: false,
	/*
	 * Property: pos
	 * 
	 * The position of the applet on the panel.
	 * Horizontally, 0 would be on the left, and 1 would be on the right.
	 * Vertically, 0 would be on the top, 1 would be on the bottom.
	 */
	pos: 0,
	/*
	 * Property: fullspan
	 * 
	 * When set to true, the applet will take up as much space as possible without overlapping the next applet.
	 */
	fullspan: false,
	/*
	 * Property: dispName
	 * 
	 * The name that is displayed on the "Add to panel" dialog.
	 */
	dispName: "Applet",
	/*
	 * Property: appletIcon
	 * 
	 * The applet's iconClass on the "Add to panel" dialog.
	 */
	appletIcon: "icon-32-categories-applications-other",
	postCreate: function() {
		this._moveable = new desktop.ui._appletMoveable(this.domNode, {
			handle: this.handleNode,
			constraints: dojo.hitch(this, function() {
				var c = {};
				if (this.getParent().getOrientation() == "horizontal") {
					var c = {
						t: 0,
						l: 0,
						w: dojo.style(this.getParent().domNode, "width") - (this.fullspan ? 0 : dojo.style(this.domNode, "width")),
						h: 0
					}
				}
				else {
					var c = {
						t: 0,
						l: 0,
						w: 0,
						h: dojo.style(this.getParent().domNode, "height") - (this.fullspan ? 0 : dojo.style(this.domNode, "height"))
					}
				}
				return c;
			})
		});
		this._moveable.onMoved = dojo.hitch(this, function(e, f) {
			var pos = dojo.style(this.domNode, (this.getParent().getOrientation() == "horizontal" ? "left" : "top"));
			var barSize = dojo.style(this.getParent().domNode, (this.getParent().getOrientation() == "horizontal" ? "width" : "height"));
			this.pos = pos/barSize;
			dojo.forEach(this.getParent().getChildren(), function(item) {
				item._calcSpan();
			});
			desktop.ui.save();
		});
		if(this.fullspan) dojo.addClass(this.domNode, "desktopAppletFullspan");
		var menu = this.menu = new dijit.Menu({});
		this.menu.bindDomNode(this.handleNode);
		dojo.forEach([
			{
				label: "Remove from panel",
				iconClass: "icon-16-actions-list-remove",
				onClick: dojo.hitch(this, function() {
					this.destroy();
					desktop.ui.save();
				})
			}
		], function(args) {
			var item = new dijit.MenuItem(args);
			menu.addChild(item);
		});
		//TODO: get it so that applets don't overlap eachother
	},
	/*
	 * Method: resize
	 * 
	 * fixes orientation and size of the applet
	 */
	resize: function() {
		var size = dojo.style(this.getParent().domNode, this.getParent().getOrientation() == "horizontal" ? "width" : "height");
		dojo.style(this.domNode, (this.getParent().getOrientation() == "horizontal" ? "left" : "top"), this.pos*size);
		dojo.style(this.domNode, (this.getParent().getOrientation() != "horizontal" ? "left" : "top"), 0);
		this._calcSpan(size);
	},
	/*
	 * Method: _calcSpan
	 * 
	 * If the fullspan property is true, this calculates the width or height of the applet,
	 * so that it is as big as possible without overlapping the next applet
	 * 
	 * Arguments:
	 * 		size - an optional argument to save an extra dojo.style call. This is the width/height of the parent panel (depending on orientation).
	 */
	_calcSpan: function(/*Integer*/size) {
		if(this.fullspan) {
			if(!size) size = dojo.style(this.getParent().domNode, this.getParent().getOrientation() == "horizontal" ? "width" : "height");
			var nextApplet = size;
			var children = this.getParent().getChildren();
			for(a in children) {
				var child = children[a];
				if(child.pos > this.pos) {
					nextApplet = child.pos*size;
					break;
				}
			}
			dojo.style(this.domNode, this.getParent().getOrientation() == "horizontal" ? "width" : "height", (nextApplet - (this.pos*size)) - 1);
			dojo.style(this.domNode, this.getParent().getOrientation() == "horizontal" ? "height" : "width", "100%");
		}
	},
	uninitalize: function() {
		this._moveable.destroy();
	},
	/*
	 * Method: _mouseover
	 * 
	 * Event handler for when the onmouseover event
	 * Shows the repositioning handle if the applet is unlocked
	 */
	_mouseover: function() {
		if(!this.locked) dojo.addClass(this.handleNode, "desktopAppletHandleShow");
	},
	/*
	 * Method: _mouseout
	 * 
	 * Event handler for the onmouseout event
	 * Hides the repositioning handle
	 */
	_mouseout: function() {
		dojo.removeClass(this.handleNode, "desktopAppletHandleShow");
	},
	/*
	 * Method: lock
	 * 
	 * Locks the applet
	 */
	lock: function() {
		this.locked=true;
	},
	/*
	 * Method: unlock
	 * 
	 * Unlocks the applet
	 */
	unlock: function() {
		this.locked=false;
	},
	/*
	 * Method: setOrientation
	 * 
	 * Add any special things you need to do in order to change orientation in this function.
	 * 
	 * Arguments:
	 * 		orientation - will either be "horizontal" or "vertical"
	 */
	setOrientation: function(/*String*/orientation) {
	}
});
/*
 * Property: desktop.ui.appletList
 * 
 * A object where the keys are applet categories, and their values are an array of applet names.
 * These are used when showing the "Add to panel" dialog
 */
desktop.ui.appletList = {
		"Accessories": ["clock"],
		"Desktop & Windows": ["taskbar"],
		"System & Hardware": ["netmonitor"],
		"Utilities": ["menu", "menubar", "seperator"]
}

/*
 * Class: desktop.ui.applets.seperator
 * 
 * A basic seperator applet
 */
dojo.declare("desktop.ui.applets.seperator", desktop.ui.applet, {
	dispName: "Seperator",
	postCreate: function() {
		dojo.addClass(this.containerNode, "seperator");
		dojo.style(this.handleNode, "background", "transparent none");
		dojo.style(this.handleNode, "zIndex", "100");
		dojo.style(this.containerNode, "zIndex", "1");
		this.inherited("postCreate", arguments);
	}
});
/*
 * Class: desktop.ui.applets.netmonitor
 * 
 * A network monitor applet that blinks when an xhr is made
 */
dojo.declare("desktop.ui.applets.netmonitor", desktop.ui.applet, {
	dispName: "Network Monitor",
	appletIcon: "icon-32-status-network-transmit-receive",
	postCreate: function() {
		dojo.addClass(this.containerNode, "icon-22-status-network-idle");
		this._xhrStart = dojo.connect(dojo,"_ioSetArgs",this,function(m)
		{
			this.removeClasses();
			var f = Math.random();
			if(f <= (1/3)) dojo.addClass(this.containerNode, "icon-22-status-network-receive");
			else if(f <= (2/3)) dojo.addClass(this.containerNode, "icon-22-status-network-transmit");
			else dojo.addClass(this.containerNode, "icon-22-status-network-transmit-receive");
		}); 
		this._xhrEnd = dojo.connect(dojo.Deferred.prototype,"_fire",this,function(m)
		{
			this.removeClasses();
			dojo.addClass(this.containerNode, "icon-22-status-network-idle");
		}); 
		this.inherited("postCreate", arguments);
	},
	/*
	 * Method: removeClasses
	 * 
	 * Removes all icon classes from the icon node
	 */
	removeClasses: function() {
		dojo.removeClass(this.containerNode, "icon-22-status-network-receive");
		dojo.removeClass(this.containerNode, "icon-22-status-network-transmit");
		dojo.removeClass(this.containerNode, "icon-22-status-network-transmit-receive");
		dojo.removeClass(this.containerNode, "icon-22-status-network-idle");
	},
	uninitialize: function() {
		dojo.disconnect(this._xhrStart);
		dojo.disconnect(this._xhrEnd);
		this.inherited("uninitialize", arguments);
	}
});

dojo.require("dijit.form.Button");
dojo.require("dijit._Calendar");
/*
 * Class: desktop.ui.applets.clock
 * 
 * A clock applet with a popup calendar
 */
dojo.declare("desktop.ui.applets.clock", desktop.ui.applet, {
	dispName: "Clock",
	postCreate: function() {
		var calendar = new dijit._Calendar({});
		this.button = new dijit.form.DropDownButton({
			label: "loading...",
			dropDown: calendar
		}, this.containerNode);
		this.clockInterval = setInterval(dojo.hitch(this, function(){
			var clock_time = new Date();
			var clock_hours = clock_time.getHours();
			var clock_minutes = clock_time.getMinutes();
			var clock_seconds = clock_time.getSeconds();
			var clock_suffix = "AM";
			if (clock_hours > 11){
				clock_suffix = "PM";
				clock_hours = clock_hours - 12;
			}
			if (clock_hours == 0){
				clock_hours = 12;
			}
			if (clock_hours < 10){
				clock_hours = "0" + clock_hours;
			}if (clock_minutes < 10){
				clock_minutes = "0" + clock_minutes;
			}if (clock_seconds < 10){
				clock_seconds = "0" + clock_seconds;
			}
			var p = clock_hours + ":" + clock_minutes + ":" + clock_seconds + " " + clock_suffix;
			if(this.getParent().getOrientation() == "vertical") {
				var v = "";
				dojo.forEach(p, function(e) {
					v += e + "<br />";
				})
				p = v;
			}
			this.button.setLabel(p);
		}), 1000);
		this.inherited("postCreate", arguments);
	},
	uninitialize: function() {
		clearInterval(this.clockInterval);
		this.inherited("uninitialize", arguments);
	}
});

/*
 * Class: desktop.ui.applets.taskbar
 * 
 * A window list applet that you can minimize windows to
 */
dojo.declare("desktop.ui.applets.taskbar", desktop.ui.applet, {
	dispName: "Window List",
	fullspan: true,
	postCreate: function() {
		dojo.addClass(this.containerNode, "desktopTaskbarApplet");
		this.inherited("postCreate", arguments);
	}
});
/*
 * Class: desktop.ui.task
 * 
 * A task button that is used in desktop.ui.applets.taskbar
 */
dojo.declare("desktop.ui.task", null, {
	constructor: function(params) {
		this.icon = params.icon;
		this.nodes = [];
		this.label = params.label;
		this.onClick = params.onClick;
		dojo.query(".desktopTaskbarApplet").forEach(function(item) {
			var p = dijit.byNode(item.parentNode);
			var div = this._makeNode(p.getParent().getOrientation());
			dojo.style(div, "opacity", 0);
			item.appendChild(div);
			dojo.connect(div, "onclick", null, this.onClick);
			dojo.fadeIn({ node: div, duration: 200 }).play();
			this.nodes.push(div);
		}, this);
	},
	/*
	 * Method: _makeNode
	 * 
	 * Makes a node for the task button based on the applet's orientation
	 */
	_makeNode: function(orientation) {
		domNode=document.createElement("div");
		dojo.addClass(domNode, "taskBarItem");
		if(orientation == "horizontal") dojo.addClass(domNode, "taskBarItemHorizontal");
		else dojo.addClass(domNode, "taskBarItemVertical");
		if(this.icon) domNode.innerHTML = "<img src='"+this.icon+"' />";
		var v = this.label;
		if(orientation == "vertical") {
			v = "<br />";
			dojo.forEach(this.label, function(s) {
				v += s + "<br />";
			});
		}
		domNode.innerHTML += v;
		return domNode;
	},
	/*
	 * Method: onClick
	 * 
	 * hook for onClick event
	 */
	onClick: function() {
	},
	destroy: function() {
		dojo.forEach(this.nodes, function(node){
			var onEnd = function() {
				node.parentNode.removeChild(node);
				node=null;
			}
			if (desktop.config.fx >= 1) {
				var fade = dojo.fadeOut({
					node: node,
					duration: 200
				});
				var slide = dojo.animateProperty({
					node: node,
					duration: 1000,
					properties: {
						width: {
							end: 0
						},
						height: {
							end: 0
						}
					}
				});
				var anim = dojo.fx.chain([fade, slide]);
				dojo.connect(slide, "onEnd", null, onEnd);
				anim.play();
			}
			else onEnd();
		});
	}
});

/*
 * Class: desktop.ui.applets.menu
 * 
 * A simple menu applet
 */
dojo.declare("desktop.ui.applets.menu", desktop.ui.applet, {
	dispName: "Main Menu",
	postCreate: function() {
		this._getApps();
		//this._interval = setInterval(dojo.hitch(this, this._getApps), 1000*60);
		dojo.addClass(this.containerNode, "menuApplet");
		this.inherited("postCreate", arguments);
	},
	uninitialize: function() {
		//clearInterval(this._interval);
		if(this._menubutton) this._menubutton.destroy();
		if(this._menu) this._menu.destroy();
		this.inherited("uninitialize", arguments);
	},
	/*
	 * Method: _makePrefsMenu
	 * 
	 * Creates a preferences menu and returns it
	 */
	_makePrefsMenu: function() {
		var pMenu = new dijit.Menu();
		dojo.forEach([
			{
				label: "Appearance",
				iconClass: "icon-16-apps-preferences-desktop-theme",
				onClick: function() { desktop.ui.config.appearance(); }
			},
			{
				label: "Account Information",
				iconClass: "icon-16-apps-system-users",
				onClick: function() { desktop.ui.config.account(); }
			}
		], function(args) {
			pMenu.addChild(new dijit.MenuItem(args));
		});
		return pMenu;
	},
	/*
	 * Method: _drawButton
	 * 
	 * Creates a drop down button for the applet.
	 */
	_drawButton: function() {
		dojo.require("dijit.form.Button");
		if (this._menubutton) {
			this._menubutton.destroy();
		}
		this._menu.addChild(new dijit.PopupMenuItem({
			label: "Preferences",
			iconClass: "icon-16-categories-preferences-desktop",
			popup: this._makePrefsMenu()
		}))
		this._menu.addChild(new dijit.MenuItem({
			label: "Log Out", 
			iconClass: "icon-16-actions-system-log-out",
			onClick: desktop.user.logout
		}));
		var div = document.createElement("div");
		this.containerNode.appendChild(div);
		var b = new dijit.form.DropDownButton({
			iconClass: "icon-16-places-start-here",
			label: "Applications",
			showLabel: false,
			dropDown: this._menu
		}, div);
		dojo.addClass(b.domNode, "menuApplet");
		dojo.style(b.focusNode, "border", "0px");
		b.domNode.style.height="100%";
		b.startup();
		this._menubutton = b;
	},
	/*
	 * Method: _getApps
	 * 
	 * Gets the app list from the server and makes a menu for them
	 */
	_getApps: function() {
		api.xhr({
			backend: "core.app.fetch.list",
			load: dojo.hitch(this, function(data, ioArgs){
				data = dojo.fromJson(data);
				if (this._menu) {
					this._menu.destroy();
				}
				var menu = new dijit.Menu({});
				this._menu = menu;
				var cats = {};
				for(item in data)
				{
					cats[data[item].category] = true;
				}
				list = [];
				for(cat in cats)
				{
					list.push(cat);
				}
				list.sort();
				for(cat in list)
				{
					var cat = list[cat];
					//cat.meow();
					var category = new dijit.PopupMenuItem({iconClass: "icon-16-categories-applications-"+cat.toLowerCase(), label: cat});
					var catMenu = new dijit.Menu({parentMenu: category});
					for(app in data)
					{
						if(data[app].category == cat)
						{
							var item = new dijit.MenuItem({
								label: data[app].name
							});
							dojo.connect(item, "onClick", desktop.app, 
							new Function("desktop.app.launch("+data[app].id+")") );
							catMenu.addChild(item);
						}
					}
					catMenu.startup();
					category.popup = catMenu;
					menu.addChild(category);
				}
				menu.domNode.style.display="none";
				menu.startup();
				this._drawButton();
			})
		});
	}
});
/*
 * Class: desktop.ui.applets.menubar
 * 
 * An extention of desktop.ui.applets.menu except it seperates the application, places, and system menus into their own buttons
 */
dojo.declare("desktop.ui.applets.menubar", desktop.ui.applets.menu, {
	dispName: "Menu Bar",
	/*
	 * Method: _makeSystemMenu
	 * 
	 * Makes the system menu
	 */
	_makeSystemMenu: function() {
		var m = new dijit.Menu();
		dojo.forEach([
			new dijit.PopupMenuItem({
				label: "Preferences",
				iconClass: "icon-16-categories-preferences-desktop",
				popup: this._makePrefsMenu()
			}),
			new dijit.MenuSeparator(),
			new dijit.MenuItem({
				label: "About Psych Desktop",
				iconClass: "icon-16-apps-help-browser",
				onClick: function() {
					api.ui.alertDialog({
						title: "About Psych Desktop",
						style: "width: 400px;",
						message: "<h2>Psych Desktop</h2><b>Version "+desktop.version+"</b><br /><br />Brought to you by:<ul style='padding: 0px;'><li>Will \"Psychcf\" Riley<div style=\"font-size: 10pt;\">Developer/Project Manager</div></li><li>Jay Macdonald<div style=\"font-size: 10pt;\">Developer/Assistant Project Manager</div></li><li>David \"mmx\" Clayton<div style=\"font-size: 10pt;\">UI Designer/Lead Artist</div></li></ul>"
					})
				}
			}),
			new dijit.MenuSeparator(),
			new dijit.MenuItem({
				label: "Log Out", 
				iconClass: "icon-16-actions-system-log-out",
				onClick: desktop.user.logout
			})
		], m.addChild, m);
		return m;
	},
	/*
	 * Method: _makePlacesMenu
	 * 
	 * Makes the places menu
	 */
	_makePlacesMenu: function() {
		var m = new dijit.Menu();
		dojo.forEach([
			new dijit.MenuItem({
				label: "Home",
				iconClass: "icon-16-places-user-home",
				onClick: function() {
					desktop.app.launchHandler("/", {}, "text/directory");
				}
			}),
			new dijit.MenuItem({
				label: "Desktop",
				iconClass: "icon-16-places-user-desktop",
				onClick: function() {
					desktop.app.launchHandler("/Desktop/", {}, "text/directory");
				}
			})
		], m.addChild, m);
		return m;
	},
	/*
	 * Method: _drawButton
	 * 
	 * Draws the button for the applet
	 */
	_drawButton: function() {
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.form.Button");
		var tbar = new dijit.Toolbar();
		this.addChild(tbar);
		dojo.forEach([
			{
				iconClass: "icon-16-places-start-here",
				label: "Applications",
				dropDown: this._menu
			},
			{
				label: "Places",
				dropDown: this._makePlacesMenu()
			},
			{
				label: "System",
				dropDown: this._makeSystemMenu()
			}
		], function(i) {
			var b = new dijit.form.DropDownButton(i);
			tbar.addChild(b);
			b.domNode.style.height="100%";
			b.startup();
		});
	}
});
