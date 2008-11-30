dojo.provide("desktop.apps.KatanaIDE._base");

dojo.declare("desktop.apps.KatanaIDE", desktop.apps._App, {
	files: [], //file information
	appInfo: {}, //application information
	metaUi: {}, //metadata form UI
	windows: [],
	init: function(args){
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var ideLocale = dojo.i18n.getLocalization("desktop.apps.KatanaIDE", "ide");
		this.windows = [];
		this.win = new desktop.widget.Window({
			title: app["Katana IDE"],
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
		});
		
		this.store = new desktop.Registry({
			name: "settings",
			appname: this.sysname,
			data: {
				identifier: "key",
				items: [
					{key: "useEditorLite", value: false}
				]
			}
		});
		
		var right = this.tabArea = new dijit.layout.TabContainer({
			region: "center"
		});
		dojo.connect(right, "selectChild", this, function(wid){
			if(!wid.ide_info) return;
			this.setMeta(this.appInfo[wid.ide_info.appName]);
		});
		desktop.app.list(dojo.hitch(this, function(apps){
			for(var i in apps){
				if(apps[i].filename) continue;
				this.appInfo[apps[i].sysname] = apps[i];
				var files = apps[i].files;
				apps[i].id = apps[i].sysname;
				delete apps[i].files;
				var makeChildren = function(files, parent){
					var children = [];
					for(var f in files){
						var fName = typeof files[f] == "object" ? f : files[f];
						var fileItem = {
							id: apps[i].sysname+(parent ? parent+"/" : "")+fName+(new Date()).toString(),
							name: fName,
							filename: (parent ? parent+"/" : "")+fName,
							appname: apps[i].sysname,
							folder: typeof files[f] == "object"
						}
						if(typeof files[f] == "object") fileItem.children = makeChildren(files[f], (parent ? parent+"/" : "")+fName)
						//apps.push(fileItem);
						children.push(fileItem);
					}
					return children;
				}
				apps[i].children = makeChildren(files);
			}
			var appStore = this.appStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "id",
					label: "name",
					items: apps
				}
			});
			//TODO: move files using DnD?
			var left = new dijit.Tree({
				store: appStore,
				query: {category: "*"},
				region: "left",
				splitter: true,
				style: "overflow: auto;",
				getIconClass: dojo.hitch(appStore, function(item, opened){
					if(item && this.hasAttribute(item, "sysname")) return "icon-16-categories-applications-other";
					if(item && this.getValue(item, "folder")) return (opened ? "icon-16-status-folder-open" : "icon-16-places-folder");
					return "icon-16-mimetypes-text-x-generic";
				})
			})
			this.makeMenu(left);
			dojo.connect(left, "onClick", this, "onItem");
			this.win.addChild(left);
			this.win.addChild(right);
		}));
		
		this.toolbar = new dijit.Toolbar({region: "top"});
			this.toolbar.addChild(new dijit.form.Button({label: cm["new"], iconClass: "icon-16-actions-document-new", onClick: dojo.hitch(this, "newApp", 1)}));
			this.toolbar.addChild(new dijit.form.Button({label: cm.save, iconClass: "icon-16-actions-document-save", onClick: dojo.hitch(this, "save")}));
			this.toolbar.addChild(new dijit.form.DropDownButton({label: cm.metadata, iconClass: "icon-16-actions-document-properties", dropDown: this._makeMetaDialog()}));
//			this.toolbar.addChild(new dijit.form.Button({label: cm.run, iconClass: "icon-16-actions-media-playback-start", onClick: dojo.hitch(this, "run")}));
//			this.toolbar.addChild(new dijit.form.Button({label: sys.kill, iconClass: "icon-16-actions-media-playback-stop", onClick: dojo.hitch(this, "killExec")}));
			this.store.fetchItemByIdentity({
				identity: "useEditorLite",
				onItem: dojo.hitch(this, function(item){
					var button;
					this.toolbar.addChild(button = new dijit.form.ToggleButton({
						label: ideLocale.syntaxHighlight,
						iconClass: "dijitCheckBoxIcon",
						onChange: dojo.hitch(this, function(v){
							this.store.setValue(item, "value", !v);
							this.store.save();
						})
					}));
					button.setAttribute("checked", !this.store.getValue(item, "value"));
				})
			});
			
		this.win.addChild(this.toolbar);
		this.win.show();
		this.win.startup();
	},
	makeMenu: function(tree){
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var nf = dojo.i18n.getLocalization("desktop.widget", "filearea");
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var menu = new dijit.Menu({});
		dojo.connect(menu, "_openMyself", this, function(e){
			this._contextItem = dijit.getEnclosingWidget(e.target).item || false;
			menu.getChildren().forEach(function(i){
				if(i.setDisabled)
					i.setDisabled(!(this._contextItem
									&& ((i.label == nf.createFolder || i.label == nf.createFile) ? 
											this.appStore.getValue(this._contextItem, "folder") :
											this.appStore.getValue(this._contextItem, "filename")
									 || i.label == cm["delete"])));
			}, this);
		});
		menu.bindDomNode(tree.domNode);
		//add menu items
		menu.addChild(new dijit.MenuItem({
			label: nf.createFolder,
			iconClass: "icon-16-actions-folder-new",
			onClick: dojo.hitch(this, function(){
				var nf = dojo.i18n.getLocalization("desktop.widget", "filearea");
				desktop.dialog.input({
					title: nf.createFolder,
					message: nf.createFolderText,
					onComplete: dojo.hitch(this, function(dirname){
						if(dirname == "") return;
						dirname = dirname.replace("..", "").replace("/", "");
						var path = this.appStore.getValue(this._contextItem, "filename");
						var appname = this.appStore.getValue(this._contextItem, "appname");
						this.appStore.fetch({
							query: {
								appname: appname,
								filename: path+"/"+dirname
							},
							queryOptions: {deep: true},
							onComplete: dojo.hitch(this, function(items){
								if(items.length != 0) return desktop.dialog.notify({
									type: "warning",
									message: nf.alreadyExists
								})
								desktop.app.createFolder(path+"/"+dirname);
								this.appStore.newItem({
									id: appname+"/"+path+"/"+dirname+(new Date()).toString(),
									name: dirname,
									filename: path+"/"+dirname,
									appname: appname,
									folder: true
								}, {
									parent: this._contextItem,
									attribute: "children"
								})
							})
						})
					})
				});
			})
		}))
		menu.addChild(new dijit.MenuItem({
			label: nf.createFile,
			iconClass: "icon-16-actions-document-new",
			onClick: dojo.hitch(this, function(){
				var nf = dojo.i18n.getLocalization("desktop.widget", "filearea");
				desktop.dialog.input({
					title: nf.createFile,
					message: nf.createFileText,
					onComplete: dojo.hitch(this, function(filename){
						if(filename == "") return;
						var path = this.appStore.getValue(this._contextItem, "filename");
						var appname = this.appStore.getValue(this._contextItem, "appname");
						var fileOrig = path+"/"+filename;
						filename = filename.replace("..", "").replace("/", "");
						this.appStore.fetch({
							query: {
								appname: appname,
								filename: path+"/"+filename
							},
							queryOptions: {deep: true},
							onComplete: dojo.hitch(this, function(items){
								if(items.length != 0) return desktop.dialog.notify({
									type: "warning",
									message: nf.alreadyExists
								})
								var defaultContent = "dojo"+".provide(\"desktop.apps."
									+fileOrig.substring(0, fileOrig.length-3)
									.replace(".", "")
									.replace("/", ".")
									+"\");\n\n";
								desktop.app.save({
									filename: path+"/"+filename,
									content: filename.match(".js$") ? defaultContent : " "
								});
								this.appStore.newItem({
									id: appname+"/"+path+"/"+filename+(new Date()).toString(),
									name: filename,
									filename: path+"/"+filename,
									appname: appname,
									folder: false
								}, {
									parent: this._contextItem,
									attribute: "children"
								})
							})
						})
					})
				});
			})
		}))
		menu.addChild(new dijit.MenuSeparator({}));
		menu.addChild(new dijit.MenuItem({
			label: cm.rename,
			onClick: dojo.hitch(this, function(){
				var nf = dojo.i18n.getLocalization("desktop.widget", "filearea");
				var cmn = dojo.i18n.getLocalization("desktop", "common");
				desktop.dialog.input({
					title: cmn.rename,
					initial: this.appStore.getValue(this._contextItem, "name"),
					onComplete: dojo.hitch(this, function(filename){
						if(filename == "") return;
						var path = this.appStore.getValue(this._contextItem, "filename");
						var appname = this.appStore.getValue(this._contextItem, "appname");
						var fileOrig = path+"/"+filename;
						filename = filename.replace("..", "").replace("/", "");
						var newPath = path.substring(0, path.lastIndexOf("/"))+"/"+filename;
						this.appStore.fetch({
							query: {
								appname: appname,
								filename: newPath
							},
							queryOptions: {deep: true},
							onComplete: dojo.hitch(this, function(items){
								if(items.length != 0) return desktop.dialog.notify({
									type: "warning",
									message: nf.alreadyExists
								})
								desktop.app.renameFile(
									this.appStore.getValue(this._contextItem, "filename"),
									newPath,
									dojo.hitch(this, function(s){
										if(!s) return;
										this.tabArea.getChildren().forEach(function(item){
											if(!item.ide_info) return;
											if(item.ide_info.fileName == this.appStore.getValue(this._contextItem, "filename")){
												item.setAttribute("title", filename);
												item.ide_info.fileName = newPath;
											}
										}, this);
										this.appStore.setValue(this._contextItem, "name", filename);
										this.appStore.setValue(this._contextItem, "filename", newPath);
										this.onItem(this._contextItem);
									})
								);
							})
						})
					})
				});
			})
		}))
		menu.addChild(new dijit.MenuItem({
			label: cm["delete"],
			iconClass: "icon-16-actions-edit-delete",
			onClick: dojo.hitch(this, function(){
				var fname = this.appStore.getValue(this._contextItem, "filename");
				var sname = this.appStore.getValue(this._contextItem, "sysname");
				var doDelete = dojo.hitch(this, function(){
					desktop.app.remove(fname ? null : sname, fname || null, dojo.hitch(this, function(result){
						if(!result) return;
						this.tabArea.getChildren().forEach(function(wid){
							if(wid.ide_info.appName == sname){
								this.tabArea.removeChild(wid);
								wid.destroy();
							}
						}, this);
						this.appStore.deleteItem(this._contextItem);
						this._contextItem = null;
					}));
				})
				if(!fname) 
					desktop.dialog.yesno({
						title: sys.appDelConfirm,
						message: sys.delFromSys.replace("%s", this.appStore.getValue(this._contextItem, "name")),
						onComplete: dojo.hitch(this, function(a){
							if(a) doDelete();
						})
					})
				else doDelete();
			})
		}))
	},
	makeTab: function(appname, filename, content){
		var div = dojo.doc.createElement("div");
		dojo.style(div, {
			width: "100%",
			height: "100%",
			overflow: "hidden"
		});
		this.store.fetch({
			query: {key:"useEditorLite"},
			onComplete: dojo.hitch(this, function(items){
			    var item = items[0];
				var pane = new dijit.layout.ContentPane({
				    closable: true,
				    style: "padding: 0px; overflow: hidden;",
					title: filename.substring(filename.lastIndexOf("/")+1) || filename
				});
				pane.setContent(div);
				this.tabArea.addChild(pane);
				this.tabArea.selectChild(pane);
				var editor = new desktop.apps.KatanaIDE[this.store.getValue(item, "value") ? "EditorLite" : "CodeTextArea"]({
				    plugins: "BlinkingCaret GoToLineDialog Bookmarks MatchingBrackets",
				    resizeTo: pane.id,
				    colorsUrl: dojo.moduleUrl("desktop.apps.KatanaIDE.data", "javascript_dojo_color.json"),
				    autocompleteUrl: dojo.moduleUrl("desktop.apps.KatanaIDE.data", "javascript_dojo_ac.json")
			    }, div);
			    pane.ide_info = {
				    fileName: filename,
				    appName: appname,
				    editor: editor
			    }
			    editor.startup();
				dojo.connect(pane, "onClose", function(){
				    pane.resize = function(){};
				    editor.destroy();
				});
				setTimeout(dojo.hitch(this, function(){
				    if(content != "")
					    editor.massiveWrite(content);
					editor.setCaretPosition(0,0);
                    this.tabArea.layout();
                    editor.startup();
				}), 200);
			})
		})
	},
	_makeMetaDialog: function(){
		var mnu = dojo.i18n.getLocalization("desktop.ui", "menus");
		var sys = dojo.i18n.getLocalization("desktop", "system");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		var div = document.createElement("div");
		
		var row = document.createElement("div");
		row.textContent = sys.id+": ";
		this.metaUi.sysname = new dijit.form.TextBox({value: "", disabled: true});
		row.appendChild(this.metaUi.sysname.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = sys.name+": ";
		this.metaUi.name = new dijit.form.TextBox({value: ""});
		row.appendChild(this.metaUi.name.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = sys.author+": ";
		this.metaUi.author = new dijit.form.TextBox({value: ""});
		row.appendChild(this.metaUi.author.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = sys.email+": ";
		this.metaUi.email = new dijit.form.TextBox({value: ""});
		row.appendChild(this.metaUi.email.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = sys.version+": ";
		this.metaUi.version = new dijit.form.TextBox({value: ""});
		row.appendChild(this.metaUi.version.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = sys.maturity+": ";
		this.metaUi.maturity = new dijit.form.TextBox({value: ""});
		row.appendChild(this.metaUi.maturity.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = sys.category+": ";
		this.metaUi.category = new dijit.form.FilteringSelect({
			autoComplete: true,
			searchAttr: "label",
			store: new dojo.data.ItemFileReadStore({
				data: {
					identifier: "value",
					items: [
						{ label: mnu.accessories, value: "Accessories" },
						{ label: mnu.development, value: "Development" },
						{ label: mnu.games, value: "Games" },
						{ label: mnu.graphics, value: "Graphics" },
						{ label: mnu.internet, value: "Internet" },
						{ label: mnu.multimedia, value: "Multimedia" },
						{ label: mnu.office, value: "Office" },
						{ label: mnu.system, value: "System" },
						{ label: mnu.administration, value: "Administration" },
						{ label: mnu.preferences, value: "Preferences" }
					]
				}
			}),
			onChange: dojo.hitch( this, function(val){
				if ( typeof val == "undefined" ) return;
			})
		});
		row.appendChild(this.metaUi.category.domNode);
		div.appendChild(row);
		
		var closeButton = new dijit.form.Button({
			label: cmn.save,
			onClick: dojo.hitch(this, "saveMeta")
		});
		div.appendChild(closeButton.domNode);
		
		var dialog = new dijit.TooltipDialog({}, div);
		return dialog;
	},
	saveMeta: function(){
		var data = {};
		for(var key in this.metaUi){
			data[key] = this.metaUi[key].getValue();
		}
		desktop.app.save(data);
	},
	setMeta: function(info){
		for(var key in this.metaUi){
			this.metaUi[key].setValue(info[key]);
		}
	},
	newApp: function(){
		var ideLocale = dojo.i18n.getLocalization("desktop.apps.KatanaIDE", "ide");
		var cmn = dojo.i18n.getLocalization("desktop", "common");
		
		var win = new desktop.widget.Window({
			title: ideLocale.createNewApp,
			width: "350px",
			height: "150px"
		});
		this.windows.push(win);
		var cpane = new dijit.layout.ContentPane({
			region: "center",
			style: "padding: 5px;"
		});
		var div = document.createElement("div");
		
		var row = document.createElement("div");
		row.textContent = ideLocale.sysname+": ";
		var sysBox = new dijit.form.ValidationTextBox({required: true, regExp: "[A-Za-z][\\w]+"});
		row.appendChild(sysBox.domNode);
		div.appendChild(row);
		
		var row = document.createElement("div");
		row.textContent = ideLocale.dispname+": ";
		var dispBox = new dijit.form.TextBox({required: true});
		row.appendChild(dispBox.domNode);
		div.appendChild(row);
		
		var saveButton = new dijit.form.Button({
			label: cmn.create,
			onClick: dojo.hitch(this, function(){
				if (dispBox.getValue() != "" && sysBox.isValid() && sysBox.getValue() != ""){
					this.appStore.fetch({
						query: {
							sysname: sysBox.getValue()
						},
						onComplete: dojo.hitch(this, function(items){
							var nf = dojo.i18n.getLocalization("desktop.widget", "filearea");
							if(items.length != 0) return desktop.dialog.notify({
								type: "warning",
								message: nf.alreadyExists
							})
							this._newApp({
								name: dispBox.getValue(),
								sysname: sysBox.getValue()
							})
							win.close();
						})
					})
				}
			})
		});
		div.appendChild(saveButton.domNode);
		
		cpane.setContent(div);
		win.addChild(cpane);
		win.show();
	},
	_newApp: function(info){
		this.appInfo[info.sysname] = dojo.mixin({
			sysname: "",
			name: "",
			author: "",
			email: "",
			version: "1.0",
			maturity: "Alpha",
			category: "Accessories"
		}, info);
		var defaultContent = "dojo"+".provide(\"desktop.apps."+info.sysname+"\");\r\n\r\n"
								+"dojo.declare(\"desktop.apps."+info.sysname+"\", desktop.apps._App, {\r\n"
								+"	init: function(args){\r\n"
								+"		/*Startup code goes here*/\r\n"
								+"	},\r\n"
								+"	kill: function(args){\r\n"
								+"		/*Cleanup code goes here*/\r\n"
								+"	}\r\n"
								+"});"
		this.makeTab(info.sysname, "/"+info.sysname+".js", defaultContent);
		desktop.app.save(dojo.mixin(dojo.clone(this.appInfo[info.sysname]), {
			filename: "/"+info.sysname+".js",
			content: defaultContent
		}));
		desktop.app.createFolder(info.sysname);
		//make the store item
		var root = this.appStore.newItem(dojo.mixin(dojo.clone(this.appInfo[info.sysname]), {
			id: info.sysname+(new Date()).toString()
		}));
		this.appStore.newItem({
			id: info.sysname+"/"+info.sysname+".js"+(new Date()).toString(),
			name: info.sysname+".js",
			filename: "/"+info.sysname+".js",
			appname: info.sysname,
			folder: false
		}, {
			parent: root,
			attribute: "children"
		})
		this.appStore.newItem({
			id: info.sysname+"/"+info.sysname+"/"+(new Date()).toString(),
			name: info.sysname,
			filename: "/"+info.sysname+"/",
			appname: info.sysname,
			folder: true
		}, {
			parent: root,
			attribute: "children"
		})
	},
	onItem: function(item){
		var store = this.appStore;
		if(!store.isItem(item)) return;
		var filename = store.getValue(item, "filename");
		if(!filename) return;
		if(store.getValue(item, "folder")) return;
		var app = store.getValue(item, "appname");
		var tac = this.tabArea.getChildren();
		for(var i in tac){
			if(typeof tac[i].ide_info != "object") continue;
			if(tac[i].ide_info.fileName == filename && tac[i].ide_info.appName == app){
				return this.tabArea.selectChild(tac[i]);
			}
		}
		desktop.app.get(app, filename, dojo.hitch(this, function(content){
			this.makeTab(app, filename, content);
		}))
	},
	save: function(){
		var pane = this.tabArea.selectedChildWidget;
		var content = pane.ide_info.editor.getContent();
		desktop.app.save({
			filename: pane.ide_info.fileName,
			content: content
		});
		//var lm = dojo._loadedModules;
		//for(var key in lm){
		//	if(key.indexOf("desktop.apps."+pane.ide_info.appName) == 0){
		//		delete lm[key];
		//	}
		//}
	},

	kill: function()
	{
		dojo.forEach(this.windows, function(win){
			if(!win.closed) win.close();
		});
		if(typeof this.loadwin != "undefined"){
			if(!this.loadwin.closed) this.loadwin.close();
		}
		if(!this.win.closed)this.win.close();
	}
});
