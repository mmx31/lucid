dojo.provide("desktop.apps.KatanaIDE.EditorLite");

dojo.declare("desktop.apps.KatanaIDE.EditorLite", [dijit._Widget, dijit._Templated], {
	templateString: "<textarea style='width: ${width}; height: ${height}; border: 0px;' dojoAttachEvent='onkeypress:_onKey' dojoAttachPoint='editorNode'></textarea>",
	width: "100%",
	height: "100%",
	_onKey: function(e) {
		dojo.fixEvent(e);
		if(e.keyCode != dojo.keys.TAB) return;
		dojo.stopEvent(e);
		if (document.selection)
		{
			this.editorNode.focus();
			var sel = document.selection.createRange();
			sel.text = "	";
		}
		else if (this.editorNode.selectionStart || this.editorNode.selectionStart == '0')
		{
			var scroll = this.editorNode.scrollTop;
			var startPos = this.editorNode.selectionStart;
			var endPos = this.editorNode.selectionEnd;
			this.editorNode.value = this.editorNode.value.substring(0, startPos) + "	" + this.editorNode.value.substring(endPos, this.editorNode.value.length);
			this.editorNode.selectionStart = startPos+1;
			this.editorNode.selectionEnd = endPos+1;
			this.editorNode.scrollTop = scroll;
		} else {
			this.editorNode.value += "	";
		}
	},
	setCaretPosition: function(x, y) {
		//compatibility function
	},
	massiveWrite: function(content) {
		this.editorNode.value = content;
	},
	getContent: function() {
		return this.editorNode.value;
	}
})
