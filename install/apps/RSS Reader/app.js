this.currentFeed = false;
this.init = function(args)
 {
    dojo.require("dijit.layout.LayoutContainer");
    dojo.require("dijit.layout.SplitContainer");
    dojo.require("dijit.layout.ContentPane");
    dojo.require("dijit.Tree");
    dojo.require("dijit.Toolbar");
    dojo.require("dijit.form.TextBox");
    dojo.require("dijit.form.ValidationTextBox");
    dojo.require("dijit.form.Button");
    dojo.require("dojox.validate.web");


    this.win = new api.window({
        title: "RSS Reader",
        onClose: dojo.hitch(this, this.kill)
    });
	this.feedStore = new api.registry({
		appid: this.id,
		name: "rssFeeds",
		data: {
			identifier: "title",
			label: "label",
			items: [
				{
					label: "Psych Desktop",
					title: "Psych Desktop",
					url: "http://www.psychdesktop.net/rss.xml"
				},
				{
					label: "Slashdot",
					title: "Slashdot",
					url: "http://rss.slashdot.org/Slashdot/slashdot"
				},
				{
					label: "Ajaxian",
					title: "Ajaxian",
					url: "http://feeds.feedburner.com/ajaxian"
				},
				{
					label: "Dojo Toolkit",
					title: "Dojo Toolkit",
					url: "http://dojotoolkit.org/rss.xml"
				},
				{
					label: "xkcd",
					title: "xkcd",
					url: "http://www.xkcd.com/rss.xml"
				},
				{
					label: "Psychcf's blog",
					title: "Psychcf's blog",
					url: "http://psychdesigns.net/psych/rss.xml"
				},
				{
					label: "Jay's blog",
					title: "Jay's blog",
					url: "http://www.jaymacdesigns.net/feed/"
				}
			]
		}
	});
    this.toolbar = new dijit.Toolbar({
        layoutAlign: "top"
    });
    var button = new dijit.form.Button({
        label: "Refresh",
        iconClass: "icon-22-actions-view-refresh",
        onClick: dojo.hitch(this, this.refresh)

    });
    this.toolbar.addChild(button);
    var button = new dijit.form.Button({
        label: "Add Feed",
        iconClass: "icon-22-actions-list-add",
        onClick: dojo.hitch(this, this.addFeedDialog)

    });
    this.toolbar.addChild(button);
    var button = new dijit.form.Button({
        label: "Remove Feed",
        iconClass: "icon-22-actions-list-remove",
        onClick: dojo.hitch(this, this.removeFeed)

    });
    this.toolbar.addChild(button);
    this.win.addChild(this.toolbar);

    this.hiddenBar = new dijit.layout.ContentPane({
        layoutAlign: "bottom",
        style: "display: none; height: 0px;"

    },
    document.createElement("div"));

    var client = new dijit.layout.SplitContainer({
        orientation: "horizontal",
        layoutAlign: "client"
    },
    document.createElement("div"));

    this.left = new dijit.Tree({
        store: this.feedStore,
		labelAttr: "title",
		label: "Feeds"
    });
	dojo.connect(this.left, "onClick", this, "changeFeeds");
    this.left.startup();
    client.addChild(this.left);

    this.right = new dijit.layout.ContentPane({
        style: "overflow: auto;",
        minsize: 50,
        sizeShare: 30

    },
    document.createElement("div"));
    client.addChild(this.right);

    this.win.addChild(client);
    this.win.onClose = dojo.hitch(this, this.kill);
    this.win.show();
    this.win.startup();
	this.refresh();
}

this.changeFeeds = function(e)
{
	if(!this.feedStore.isItem(e)) return;
    this.fetchFeed(this.feedStore.getValue(e, "url"));
    this.currentFeed = e;
}

this.removeFeed = function(t) {
	if (this.currentFeed) this.feedStore.deleteItem(this.currentFeed);
	this.feedStore.save();
}

this.addFeedDialog = function()
 {
    if (typeof(this.addfeedwin) != "undefined") {
        this.addfeedwin.close();
    }
    this.addfeedwin = new api.window({
        title: "Add Feed",
        width: "300px",
        height: "200px"

    });
	dojox.regexp.integer = dojo.number._integerRegexp; //workaround, remove when dojo 1.1 comes
    this._form = {
        title: new dijit.form.TextBox({required: true}),
        url: new dijit.form.ValidationTextBox({
			isValid: function(isFocused) {
				return dojox.validate.isUrl(this.textbox.value);
			},
			invalidMessage: "Invalid URL"
		})
    };
    var line = document.createElement("div");
    var p = document.createElement("span");
    p.innerHTML = "Title: ";
    line.appendChild(p);
    line.appendChild(this._form.title.domNode);
    var line2 = document.createElement("div");
    var p = document.createElement("span");
    p.innerHTML = "URL: ";
    line2.appendChild(p);
    line2.appendChild(this._form.url.domNode);
    var button = new dijit.form.Button({
        label: "Add Feed"
    });
	var div = document.createElement("div");
	dojo.style(div, "color", "red");
    dojo.connect(button, "onClick", this, 
    function(e) {
		if(!(this._form.title.getValue() != "" && this._form.url.isValid())) return;
	this.feedStore.fetch({query: {title: this._form.title.getValue()}, onComplete: dojo.hitch(this, function(f) {
		if(typeof f[0] != "undefined") {
			div.innerHTML = "A feed with that name already exists";
			return;
		}
		var item = this.feedStore.newItem({title: this._form.title.getValue(), label: this._form.title.getValue(), url: this._form.url.getValue()});
		this.feedStore.save();
		this.updateCount(item);
        	this.addfeedwin.close();
	})});

    })
    this.addfeedwin.show();
    this.addfeedwin.containerNode.appendChild(div);
    this.addfeedwin.containerNode.appendChild(line);
    this.addfeedwin.containerNode.appendChild(line2);
    this.addfeedwin.containerNode.appendChild(button.domNode);
    this.addfeedwin.startup();

}

this.kill = function()
 {
    if (typeof(this.addfeedwin) != "undefined") {
        this.addfeedwin.close();
    }
    if (typeof(this.win) != "undefined") {
        this.win.close();
    }
}
this.refresh = function() {
	this.feedStore.fetch({onItem: dojo.hitch(this, function(item) {
		this.updateCount(item);
	})})
}

this.updateCount = function(item) {
	var store = this.feedStore
	api.xhr({
        url: store.getValue(item, "url"),
        preventCache: true,
		xsite: true,
        load: function(data) {
			var items = data.getElementsByTagName("item").length;
			store.setValue(item, "label", store.getValue(item, "title")+(items > 0 ? " ("+items+")" : ""))
		},
        handleAs: "xml"

    });	
}
this.fetchFeed = function(url)
 {
    api.xhr({
        url: url,
        preventCache: true,
		xsite: true,
        load: dojo.hitch(this, function(data, ioArgs) {
			if(data == "9") { api.ui.alertDialog({title: "Psych Desktop internal error", message: "cURL not supported by this server<br>enchanced web features disabled"}); return; }
            var items = data.getElementsByTagName("item");
            var text = "";
            dojo.forEach(items, 
            function(item) {
                var title = item.getElementsByTagName("title")[0].textContent;
                var content = item.getElementsByTagName("description")[0].textContent;
                var url = item.getElementsByTagName("link")[0].textContent;
                text += "<div style='border: 1px solid black;'><h4><a href='javascript:desktop.app.launch(2, {url: \"" + escape(url) + "\"})'>" + title + "</a></h4><p>" + content + "</p></div>";

            });
            this.right.setContent(text);

        }),
        handleAs: "xml"

    });

}