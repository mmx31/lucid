dojo.provide("desktop.apps.FeedReader");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.SplitContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Tree");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.Dialog");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojo.date.locale");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.validate.web");
dojo.require("dojox.encoding.digests.MD5");
dojo.requireLocalization("desktop", "common");
dojo.requireLocalization("desktop", "messages");
dojo.requireLocalization("desktop", "apps");
desktop.addDojoCss("dojox/grid/resources/Grid.css");
		
dojo.declare("desktop.apps.FeedReader", desktop.apps._App, {
	currentFeed: false,
	feedCounter: {},
	init: function(args)
	{
		var cm = dojo.i18n.getLocalization("desktop", "common");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		this.feedCounter = {};
	    this.win = new desktop.widget.Window({
	        title: app["Feed Reader"],
			iconClass: this.iconClass,
	        onClose: dojo.hitch(this, this.kill)
	    });
		var store = this.feedStore = new desktop.Registry({
			appname: this.sysname,
			name: "rssFeeds",
			data: {
				label: "label",
				identifier: "id",
				items: [
					{
						id: 0,
						label: "Feeds",
						title: "Feeds",
						category: true,
						children: [
							{
								id: 1,
								label: "Psych Desktop",
								title: "Psych Desktop",
								url: "http://www.psychdesktop.net/rss.xml",
								category: false
							},
							{
								id: 2,
								label: "Slashdot",
								title: "Slashdot",
								url: "http://rss.slashdot.org/Slashdot/slashdot",
								category: false
							},
							{
								id: 3,
								label: "Ajaxian",
								title: "Ajaxian",
								url: "http://feeds.feedburner.com/ajaxian",
								category: false
							},
							{
								id: 4,
								label: "Dojo Toolkit",
								title: "Dojo Toolkit",
								url: "http://dojotoolkit.org/rss.xml",
								category: false
							},
							{
								id: 5,
								label: "xkcd",
								title: "xkcd",
								url: "http://www.xkcd.com/rss.xml",
								category: false
							},
							{
								id: 6,
								label: "Psychcf's blog",
								title: "Psychcf's blog",
								url: "http://psychdesigns.net/blog/?feed=rss2",
								category: false
							}
						]
					}
				]
			}
		});
		this.hashStore = new desktop.Registry({
			appname: this.sysname,
			name: "feedItemHashes",
			data: {
				label: "label",
				identifier: "hash",
				items: []
			}
		});
	    this.toolbar = new dijit.Toolbar({
	        region: "top"
	    });
	    var button = new dijit.form.Button({
	        label: cm.refresh,
	        iconClass: "icon-22-actions-view-refresh",
	        onClick: dojo.hitch(this, this.refresh)
	
	    });
	    this.toolbar.addChild(button);
	    var button = new dijit.form.DropDownButton({
	        label: cm.add,
	        iconClass: "icon-22-actions-list-add",
	        dropDown: this.addFeedDialog()
	    });
	    this.toolbar.addChild(button);
	    var button = this.removeButton = new dijit.form.Button({
	        label: cm.remove,
	        iconClass: "icon-22-actions-list-remove",
	        onClick: dojo.hitch(this, this.removeFeed)
	
	    });
	    this.toolbar.addChild(button);
		var button = new dijit.form.Button({
	        label: cm.markAsRead,
	        onClick: dojo.hitch(this, "markAllRead")
	
	    });
	    this.toolbar.addChild(button);
		
		var load = this.loadNode = document.createElement("div");
		dojo.addClass(load, "icon-loading-indicator");
		dojo.style(load, {
			display: "none",
			position: "absolute",
			top: "0px",
			right: "0px",
			margin: "7px"
		});
		this.toolbar.domNode.appendChild(load);
		
	    this.win.addChild(this.toolbar);
	
	    this.hiddenBar = new dijit.layout.ContentPane({
	        region: "bottom",
	        style: "display: none; height: 0px;"
	
	    },
	    document.createElement("div"));
		
	    this.left = new dijit.Tree({
			store: this.feedStore,
			region: "left",
			splitter: true,
			query: {category: true},
			getIconClass: function(item){
				if(item != null && this.model.store.hasAttribute(item, "iconClass"))
					return this.model.store.getValue(item, "iconClass");
			}
	    });
		dojo.connect(this.left, "onClick", this, "changeFeeds");
	    this.left.startup();
	    this.win.addChild(this.left);
	
	    this.right = new dijit.layout.BorderContainer({
	        minSize: 50,
			region: "center",
            gutters: false
	    });
			this.gridStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "Guid",
					items: []
				}
			});
			var grid = this.grid = new dojox.grid.DataGrid({
				structure: [{
					cells: [[
						{field: "Date", name: cm.date, formatter: function(str){
							return dojo.date.locale.format(new Date(str));
						}},
						{field: "Title", name: cm.title, width: 15}
					]]
				}],
                store: this.gridStore,
                query: {Title: "*"},
				onStyleRow: dojo.hitch(this, function(inRow){
					if (!this.grid.getItem(inRow.index))
    					return;
					if(this.gridStore.getValue(this.grid.getItem(inRow.index), "Read"))
						inRow.customStyles = '';
					else
						inRow.customStyles = 'font-weight: bold;';
					dojox.grid.DataGrid.prototype.onStyleRow.apply(this.grid, arguments);
				})
			})
			dojo.connect(grid, "onRowClick", this, "showItem");
			var gridPane = new dijit.layout.ContentPane({region: "center"});
			var div = document.createElement("div");
			div.appendChild(grid.domNode);
			gridPane.setContent(grid.domNode);
            dojo.connect(gridPane, "resize", grid, "resize");
			this.right.addChild(gridPane);
			//this.right.addChild(grid);
			this.right.startup(); //hack
			var cpane = this.contentArea = new dijit.layout.ContentPane({region: "bottom", style: "height: 200px;", splitter: true});
			cpane.setContent("&nbsp;");
			this.right.addChild(cpane);
			this.right.layout();
	    this.win.addChild(this.right);
	
	    this.win.onClose = dojo.hitch(this, this.kill);
	    this.win.show();
	    this.win.startup();
		this.refresh();
		this.updateTimer = setInterval(dojo.hitch(this, "refresh"), 1000*60*5)
	},
	
	changeFeeds: function(e)
	{
		if(!this.feedStore.isItem(e)) return;
	    this.currentFeed = e;
		if(this.feedStore.getValue(e, "category") === true) return;
	    this.fetchFeed(e);
	},
	
	removeFeed: function(t){
		if(!this.feedStore.isItem(this.currentFeed)) return;
		if(this.feedStore.getValue(this.currentFeed, "category") == false){
			//delete any hashes
			this.hashStore.fetch({
				query: {feed: this.feedStore.getValue(this.currentFeed, "url")},
				onItem: dojo.hitch(this, function(item){
					this.hashStore.deleteItem(item);
				}),
				onComplete: dojo.hitch(this, function(){
					this.hashStore.save();
				})
			});
		}
        else {
            //delete any child feeds
            var children = this.feedStore.getValues(this.currentFeed, "children");
            dojo.forEach(children, function(item){ this.feedStore.deleteItem(item); }, this);
        }
		var name = this.feedStore.getValue(this.currentFeed, "title");
		this.feedCounter[name] = 0;
		this.fixWinTitle();
		this.feedStore.deleteItem(this.currentFeed);
		this.feedStore.save();
        //clear the grid
        this.gridStore.fetch({
            query: {Title: "*"},
            onItem: dojo.hitch(this.gridStore, function(item){
                this.deleteItem(item);
            })
        });
        this.contentArea.setContent("");
	},
	
	addFeedDialog: function()
	{
		var cm = dojo.i18n.getLocalization("desktop", "common");
	    var dialog = new dijit.TooltipDialog({});
	    this._form = {
	        title: new dijit.form.TextBox({required: true}),
		isCategory: new dijit.form.CheckBox({
			onChange: dojo.hitch(this, function(val){
				if(!this._form) return;
				this._form.url.setDisabled(val);
				this._form.category.setDisabled(val);
			})
		}),
		category: new dijit.form.FilteringSelect({
			store: this.feedStore,
			searchAttr: "title",
			query: {category: true}
		}),
	        url: new dijit.form.ValidationTextBox({
			isValid: function(isFocused){
				return dojox.validate.isUrl(this.textbox.value);
			}
		}),
		icon: new dijit.form.FilteringSelect({
			searchAttr: "name",
			labelAttr: "label",
			labelType: "html",
			store: new dojo.data.ItemFileReadStore({
				data: {identifier: "name", items: [
					{label: "", name: ""},
					{label: "<div class='icon-16-actions-go-home'></div>", name: "icon-16-actions-go-home"},
					{label: "<div class='icon-16-apps-internet-news-reader'></div>", name: "icon-16-apps-internet-news-reader"},
					{label: "<div class='icon-16-apps-internet-web-browser'></div>", name: "icon-16-apps-internet-web-browser"},
					{label: "<div class='icon-16-apps-internet-group-chat'></div>", name: "icon-16-apps-internet-group-chat"},
					{label: "<div class='icon-16-apps-accessories-text-editor'></div>", name: "icon-16-apps-accessories-text-editor"},
					{label: "<div class='icon-16-actions-system-search'></div>", name: "icon-16-actions-system-search"},
					{label: "<div class='icon-16-status-weather-clear'></div>", name: "icon-16-status-weather-clear"}
				]}
			})
		})
	    };
	    var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = cm.name+": ";
	    line.appendChild(p);
	    line.appendChild(this._form.title.domNode);
	    var line2 = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = cm.url+": ";
	    line2.appendChild(p);
	    line2.appendChild(this._form.url.domNode);
	
	    var line3 = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = cm.icon+": ";
	    line3.appendChild(p);
	    line3.appendChild(this._form.icon.domNode);
	
	    var line4 = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = cm.isCategory+": ";
	    line4.appendChild(p);
	    line4.appendChild(this._form.isCategory.domNode);
	
	
	    var line5 = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = cm.category+": ";
	    line5.appendChild(p);
	    line5.appendChild(this._form.category.domNode);
	
	    var button = new dijit.form.Button({
	        label: cm.add
	    });
		var div = document.createElement("div");
		dojo.style(div, "color", "red");
	    dojo.connect(button, "onClick", this, function(e){
			if(this._form.title.getValue() == "") return;
			if(!this._form.isCategory.checked){
				if(!this._form.url.isValid()) return;
				if(!this._form.category.isValid()) return;
			}
			if(!this._form.icon.isValid()) return;
			this.feedStore.fetch({query: {title: this._form.title.getValue()}, onComplete: dojo.hitch(this, function(f){
				if(typeof f[0] != "undefined"){
					var msg = dojo.i18n.getLocalization("desktop", "messages");
					div.innerHTML = msg.allreadyExists;
					return;
				}
				var makeItem = dojo.hitch(this, function(items){
					var maxID = this.feedStore._arrayOfAllItems.length; //feels hackish
					var item = this.feedStore.newItem({
						id: maxID,
						title: this._form.title.getValue(),
						label: this._form.title.getValue(),
						url: this._form.url.getValue(),
						iconClass: this._form.icon.getValue() || null,
						category: this._form.isCategory.checked
					}, (typeof items[0] != "undefined" ? {
						attribute: "children",
						parent: items[0]
					} : null));
					this.updateCount(item);
					this.feedStore.save();
				});
				if(!this._form.isCategory.checked){
					this.feedStore.fetch({
						query: {
							category: true,
							id: this._form.category.getValue()
						},
						onComplete: makeItem
					})
				}
				else makeItem([]);
		        this._form.title.setValue("");
		        this._form.url.setValue("");
		        this._form.icon.setValue("");
		        this._form.isCategory.setChecked(false);
		        div.innerHTML = "";
			})});
	
	    })
	    dialog.startup();
		dialog.containerNode.appendChild(div);
	    dialog.containerNode.appendChild(line);
	    dialog.containerNode.appendChild(line2);
	    dialog.containerNode.appendChild(line3);
	    dialog.containerNode.appendChild(line4);
	    dialog.containerNode.appendChild(line5);
	    dialog.containerNode.appendChild(button.domNode);
		return dialog;
	},
	
	kill: function()
	{
	    if (typeof(this.win) != "undefined"){
	        this.win.close();
	    }
		if(this.updateTimer) clearInterval(this.updateTimer);
	},
	refresh: function(){
		this.feedStore.fetch({
			query: {
				url: "*"
			},
			queryOptions: {
				deep: true
			},
			onItem: dojo.hitch(this, function(item){
				this.updateCount(item, true);
			})
		})
	},
	
	markAllRead: function(){
		/*this.feedStore.fetch({onItem: dojo.hitch(this, function(item){
			this.updateCount(item);
		})})*/
		this.hashStore.fetch({
			query: {feed: this.feedStore.getValue(this.currentFeed, "url")},
			onItem: dojo.hitch(this, function(item){
				this.hashStore.setValue(item, "read", true);
				console.log(item);
			})
		});
		this.hashStore.save();
		this.gridStore.fetch({
			query: {Title:"*"},
			onItem: dojo.hitch(this, function(item){
				this.gridStore.setValue(item, "Read", true);
			}),
			onComplete: dojo.hitch(this, function(){
				this.grid.update();
				this.updateCount(this.currentFeed, false);
			})
		});
	},
	
	updateCount: function(item, fetchFeed){
		var store = this.feedStore;
		var onComplete = dojo.hitch(this, function(){
			this.hashStore.fetch({
				query: {
					feed: store.getValue(item, "url"),
					read: false
				},
				onComplete: dojo.hitch(this, function(items){
					store.setValue(item, "label", store.getValue(item, "title")+(items.length > 0 ? " ("+items.length+")" : ""))
					this.feedCounter[store.getValue(item, "title")] = items.length;
					this.fixWinTitle();
					//store.save();
				})
			})
		})
		if(fetchFeed) this.fetchFeed(item, true); //fetchFeed will call updateCount when it's done
		else onComplete();
		
	},
	fixWinTitle: function(){
		var sum = 0;
		for(var key in this.feedCounter){
			sum += this.feedCounter[key];
		}
		var app = dojo.i18n.getLocalization("desktop", "apps");
		this.win.attr("title", app["Feed Reader"]+(sum > 0 ? " ("+sum+")" : ""));
	},
	fetchFeed: function(item, noGrid)
	{
        this.removeButton.attr("disabled", true);
		var FEED_URL = this.feedStore.getValue(item, "url");
		var url = FEED_URL;
		var FEED_ITEM = item;
		if(!noGrid){
			this.gridStore.close();
			this.gridStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "Title",
					items: []
				}
			});
			this.grid.setStore(this.gridStore);
            this.grid.setQuery({Title: "*"});
		}
		dojo.style(this.loadNode, "display", "block");
	    desktop.xhr({
	        url: url,
	        preventCache: true,
			xsite: true,
	        load: dojo.hitch(this, function(data, ioArgs){
	            var items = data.getElementsByTagName("item");
				var hashes = [];
				var newHashes = false;
	            dojo.forEach(items, function(item){
	                var title = desktop.textContent(item.getElementsByTagName("title")[0]);
	                var content = desktop.textContent(item.getElementsByTagName("description")[0]);
	                var url = desktop.textContent(item.getElementsByTagName("link")[0]);
	                var date = desktop.textContent((item.getElementsByTagName("pubDate")[0] ||
								item.getElementsByTagName("dc:date")[0] || {textContent: ""}));
	                var guid = desktop.textContent((item.getElementsByTagName("guid")[0] || {textContent: ""}));
					var dateObj = new Date(date);
					if(isNaN(dateObj.getDay())){
						//must be an ISO string
						dateObj = dojo.date.stamp.fromISOString(date);
					}
					date = dateObj;
					var hash = dojox.encoding.digests.MD5(guid||title);
					hashes.push(hash);
					this.hashStore.fetch({
						query: {hash: hash},
						onComplete: dojo.hitch(this, function(items){
							if(!noGrid) this.gridStore.newItem({
								Read: !(items.length == 0 || !this.hashStore.getValue(items[0], "read")),
								Title: title,
								Content: content,
								Date: date.toString(),
								Url: url,
								Guid: guid||title
							});
							if(items.length == 0){
								this.hashStore.newItem({
									hash: hash,
									feed: FEED_URL,
									read: false
								});
								newHashes = true;
							}
                            this.removeButton.attr("disabled", false);
						})
					});
	            }, this);
				//remove old hashes
				var change = false;
				this.hashStore.fetch({
					query: {feed: FEED_URL},
					onItem: dojo.hitch(this, function(item){
						for(var key in hashes){
							var hash = hashes[key];
							if(hash == this.hashStore.getValue(item, "hash")) return;
						}
						this.hashStore.deleteItem(item);
						change = true;
					}),
					onComplete: dojo.hitch(this, function(){
						if(change || newHashes) this.hashStore.save();
						this.updateCount(FEED_ITEM, false);
						dojo.style(this.loadNode, "display", "none");
					})
				})
	        }),
	        handleAs: "xml"
	
	    });
	
	},
	showItem: function(){
		var s = this.grid.selection.getSelected();
		var row = s[0];
		var title = this.gridStore.getValue(row, "Title");
		var url = this.gridStore.getValue(row, "Url");
		var content = this.gridStore.getValue(row, "Content");
		var guid = this.gridStore.getValue(row, "Guid");
		var hash = dojox.encoding.digests.MD5(guid || title);

		this.hashStore.fetch({
			query: {hash: hash},
			onComplete: dojo.hitch(this, function(items){
				if(this.hashStore.getValue(items[0], "read") == false){
					this.hashStore.setValue(items[0], "read", true);
					this.hashStore.save();
				}
			})
		});
		this.gridStore.fetch({
			query: {Title: title},
			onComplete: dojo.hitch(this, function(items){
				this.gridStore.setValue(items[0], "Read", true);
				this.updateCount(this.currentFeed, false);
			})
		});
		
		this.grid.update();
		
		var text = "<div style='background-color: #eee; padding: 3px;'><a href='"+url+"'>" + title + "</a></div><div style='padding: 15px;'>" + content + "</div>";
		
		this.contentArea.setContent(text);
		dojo.query("a", this.contentArea.domNode).forEach(function(node){
			dojo.connect(node, "onclick", node, function(e){
				if(!e.shiftKey
				&& !e.ctrlKey){
					desktop.app.launchHandler(null, {url: this.href}, "text/x-uri");
					e.preventDefault();
				}
			})
		});
	}
})
