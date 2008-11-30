dojo.provide("desktop.apps.AppearanceConfig");

dojo.declare("desktop.apps.AppearanceConfig", desktop.apps._App, {
	init: function(args){
		//	summary:
		//		Shows the appearance configuration dialog
		var l = dojo.i18n.getLocalization("desktop.ui", "appearance");
		var win = this.wallWin = new desktop.widget.Window({
			title: l.appearancePrefs,
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
		});
		var tabs = new dijit.layout.TabContainer({region: "center"});
		var themes = this._themes(); //so we can get any theme wallpaper first
		tabs.addChild(this._wallpaper());
		tabs.addChild(themes);
		tabs.addChild(this._effects());
		win.addChild(tabs);
		win.show();
		win.startup();
	},
	kill: function(){
		if(!this.wallWin.closed) this.wallWin.close();
		desktop.config.save();
	},
	_wallpaper: function(){
		//	summary:
		//		Creates a BorderContainer with wallpaper configuration UI and returns it
		var l = dojo.i18n.getLocalization("desktop.ui", "appearance");
		var wallpaper = new dijit.layout.BorderContainer({title: l.wallpaper});
		var c = new dijit.layout.ContentPane({region: "center"});
		var cbody = document.createElement("div");
		dojo.style(cbody, "width", "100%");
		dojo.style(cbody, "height", "100%");
		dojo.style(cbody, "overflow", "auto");
		
		var makeThumb = function(item){
			if(item == "") return;
			if(item === true) item = "";
			var p = document.createElement("div");
			dojo.addClass(p, "floatLeft");
			dojo.style(p, "width", "150px");
			dojo.style(p, "height", "112px");
			dojo.style(p, "margin", "5px");
			dojo.style(p, "padding", "5px");
				if (item != ""){
					var img = document.createElement("img");
					dojo.style(img, "width", "100%");
					dojo.style(img, "height", "100%");
					img.src = item; //todo: thumbnails?
					img.name = item; //so we can look it up later, src resolves a local path to a hostname
					p.appendChild(img);
				}
			if(desktop.config.wallpaper.image == item) dojo.addClass(p, "selectedItem");
			dojo.connect(p, "onclick", null, function(){
				if(desktop.config.wallpaper.image != item){
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
		var color = new dijit.ColorPalette({value: desktop.config.wallpaper.color, onChange: dojo.hitch(this, function(value){
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
			onChange: function(val){
				if(typeof val == "undefined") return;
				desktop.config.wallpaper.style=val;
				desktop.config.apply();
			}
		});
		styleButton.setValue(desktop.config.wallpaper.style);
		var addButton = new dijit.form.Button({
			label: nc.add,
			iconClass: "icon-22-actions-list-add",
			onClick: function(){
				desktop.dialog.file({
					title: nc.chooseWall,
					onComplete: function(path){
						if(path){
							var p = desktop.filesystem.embed(path);
							for(var key in desktop.config.wallpaper.storedList){
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
			onClick: function(){
				var q = dojo.query("div.selectedItem img", c.domNode)
				if(q[0]){
					dojo.forEach(desktop.config.wallpaper.storedList, function(url, i){
						if(url == q[0].name) desktop.config.wallpaper.storedList.splice(i, 1);
					});
					q[0].parentNode.parentNode.removeChild(q[0].parentNode);
				}
			}
		});
		/*var closeButton = new dijit.form.Button({
			label: "Close",
			style: "position: absolute; right: 0px; top: 0px;",
			onClick: function(){
				win.close();
			}
		});*/
		var p = new dijit.layout.ContentPane({region: "bottom"});
		var body = document.createElement("div");
		dojo.forEach([colorButton.domNode, styleLabel, styleButton.domNode, addButton.domNode, removeButton.domNode/*, closeButton.domNode*/], function(c){
			dojo.addClass(c, "dijitInline");
			body.appendChild(c);
		});
		p.setContent(body);
		wallpaper.addChild(p);
		color.startup();
		return wallpaper;
	},
	_themes: function(){
		//	summary:
		//		generates a theme configuration pane and returns it
		var l = dojo.i18n.getLocalization("desktop.ui", "appearance");
		var p = new dijit.layout.BorderContainer({title: l.theme});
		var m = new dijit.layout.ContentPane({region: "center"});
		var area = document.createElement("div");
		var makeThumb = function(item){
			var p = document.createElement("div");
			dojo.addClass(p, "floatLeft");
			dojo.style(p, "width", "150px");
			dojo.style(p, "height", "130px");
			dojo.style(p, "margin", "5px");
			dojo.style(p, "padding", "5px");
			var img = document.createElement("img");
			dojo.style(img, "width", "100%");
			dojo.style(img, "height", "100%");
			img.src = dojo.moduleUrl("desktop.resources.themes."+item.sysname, item.preview);
			img.name = item.name;
			img.title = item.name;
			p.appendChild(img);
			var subtitle = document.createElement("div");
			desktop.textContent(subtitle, item.name);
			dojo.style(subtitle, "textAlign", "center");
			p.appendChild(subtitle);
			if(desktop.config.theme == item.sysname) dojo.addClass(p, "selectedItem");
			dojo.connect(p, "onclick", null, function(){
				if(desktop.config.theme != item.sysname){
					dojo.query(".selectedItem", m.domNode).removeClass("selectedItem");
					dojo.addClass(p, "selectedItem");
					desktop.config.theme = item.sysname;
					desktop.config.apply();
				}
			})
			area.appendChild(p);
			
			if(!item.wallpaper) return;
			var wallimg = dojo.moduleUrl("desktop.resources.themes."+item.sysname, item.wallpaper);
			for(var i in desktop.config.wallpaper.storedList){
				var litem = desktop.config.wallpaper.storedList[i];
				if(litem == wallimg.path) return;
			}
			desktop.config.wallpaper.storedList.push(wallimg.path);
		}
		desktop.theme.list(function(list){
			dojo.forEach(list, makeThumb);
		}, null, true);
		m.setContent(area);
		p.addChild(m);
		return p;
	},
	_effects: function(){
		//	summary:
		//		generates an effects configuration pane and returns it
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
					onClick: function(){
						desktop.config.fx = 3;
					}
				}
			}
		}
		var div = document.createElement("div");
		dojo.style(div, "padding", "20px");
		for(var key in rows){
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
	}
})
