dojo.provide("dojox.widget._codeTextArea.plugins.Bookmarks");
dojo.require("dijit.Menu");
dojo.require("dijit.Dialog");

dojox.widget._codeTextArea.plugins.Bookmarks.startup = function(args){
	var targetLine = 0;
	var targetBookmark = {};
	var bookmarks = [];
	
    var source = args.source;
	var lineHeight = source.lineHeight;
	var _action = "add";
	// right bar
	var bookmarksBar = dojo.byId("bookmarksBar") || document.createElement("div");
	bookmarksBar.className = "codeTextAreaBookmarksBar";
	with(bookmarksBar.style){
		height = source.getHeight() + "px";
	}

	// dialog
	var _bookmarkDialogNode = document.createElement("div");
	var _caption = document.createElement("span");
	_caption.appendChild(document.createTextNode("Enter Bookmark name: "));
	var _bookmarkField = document.createElement("input");
	_bookmarkField.type = "text";
	_bookmarkField.name = "bookmarkName";
	_bookmarkField.value = "";
	_caption.className = "codeTextAreaDialogCaption";
	_bookmarkDialogNode.appendChild(_caption)
	_bookmarkDialogNode.appendChild(_bookmarkField);

	var _self = this;
	dojo.connect(source, "resize", function(){
		bookmarksBar.style.height = source.getHeight() + "px";
	});

	var bookmarkDialog = new dijit.Dialog({
	        title: "Add Bookmark",
	        duration: 40
	    }, _bookmarkDialogNode
    );	
    dojo.connect(bookmarkDialog, "hide", 
		function(){ 
			bookmarkDialog.domNode.getElementsByTagName("input")[0].blur();  
			source._blockedEvents = false;
            document.body.focus();
	});
    dojo.connect(bookmarkDialog.titleBar, "focus", function(){
            _bookmarkField.focus();  
            _bookmarkField.select();  
    });

	var showBookmarkDialog = function(index){
		source._blockedEvents = true;
		_bookmarkField.value = source.getLineContent(source.linesCollection[index]);
		_action = "add";
		bookmarkDialog.show();
	};

	var normalizePosition = function(params){
		var signum = params.signum;
		for(var i = 0; i < bookmarks.length; i++){
			var placeholder = bookmarks[i].placeholder;
			if(params.position <= bookmarks[i].index || (params.position == bookmarks[i].index + 1 && source.x == 0)){
				bookmarks[i].index += (signum*params.rows);
			}
			bookmarks[i].bookmark.style.top = bookmarks[i].index*lineHeight + "px";
			placeholder.style.top = parseInt((bookmarks[i].index / source.linesCollection.length)*source.getHeight()) + "px";
		}
	};
	var gotoBookmark = function(oBookmark){
		source.setCaretPosition(0, oBookmark.index);
	};
	var enableBookmark = function(index){
		var bookmark = document.createElement("div");
		bookmark.className = "bookmark";
		bookmark.appendChild(document.createTextNode("B"));
		bookmark.style.top = index*lineHeight + "px";
		source.leftBand.appendChild(bookmark);
		var placeholder = document.createElement("div");
		placeholder.className = "placeholder";
		placeholder.style.left = "0px";
		var oBookmark = {
			index: index,
			placeholder: placeholder,
			bookmark: bookmark
		};
		dojo.connect(placeholder, "onclick", function(e){ gotoBookmark(oBookmark) });
		placeholder.style.top = parseInt((index / source.linesCollection.length)*source.getHeight()) + "px";
		bookmarksBar.appendChild(placeholder);
		bookmark.title = _bookmarkField.value;
		placeholder.title = _bookmarkField.value;
		bookmark.style.visibility = "visible";
		
		bookmarks.push(oBookmark);
	};

	dojo.subscribe(source.id + "::addNewLine", normalizePosition);
	dojo.subscribe(source.id + "::removeLine", normalizePosition);

    dojo.connect(_bookmarkField, "onkeypress", function(evt){
        var evt = dojo.fixEvent(evt||window.event);
		var _value;            
        if(evt.keyCode == dojo.keys.ENTER){
			if(_action != "add"){ return; }
			enableBookmark(targetLine);
            bookmarkDialog.hide();
            dojo.stopEvent(evt);
            document.body.focus();
        }
        evt.stopPropagation();
    });
	var hasBookmark = function(index){
		var _hasBookmark = false;
		for(var i = 0; i < bookmarks.length; i++){
			if(index == bookmarks[i].index){
				_hasBookmark = true;
				break;
			}
		}
		return _hasBookmark;
	};
	var addBookmark = function(e){
		if(targetLine >= source.linesCollection.length){
			return;
		}
		showBookmarkDialog(targetLine);
	};

	var removeBookmark = function(index){
		for(var i = 0; i < bookmarks.length; i++){
			var bookmark = bookmarks[i];
			if(index == bookmark.index){
				source.removeFromDOM(bookmark.placeholder);
				source.removeFromDOM(bookmark.bookmark);
				bookmarks.splice(i, 1);
				delete bookmark.placeholder;
				delete bookmark.bookmark;
				delete bookmark.index;
				bookmark = null;
				break;
			}
		}
		_action = "remove";
	};

	var leftBandMenu = new dijit.Menu({targetNodeIds: [source.leftBand.id], id:[source.leftBand.id] + "-menu"});

	var onMenuOpen = function(e){
		targetLine = parseInt((e.y + source.domNode.scrollTop - dojo.coords(source.domNode).y) / lineHeight);
		leftBandMenu.destroyDescendants();
		var menuItem;
		if(!hasBookmark(targetLine)){
			menuItem = new dijit.MenuItem({
				label: "Add bookmark", 
				onClick: function(e){ addBookmark(e); } 
			});
		}else{
			menuItem = new dijit.MenuItem({
				label: "Remove bookmark", 
				onClick: function(e){ removeBookmark(targetLine); } 
			});
		}
		leftBandMenu.addChild(menuItem);
	};
	
	dojo.connect(leftBandMenu, "onOpen", this, function(e){ onMenuOpen(e); });
	leftBandMenu.startup();
};