dojo.provide("dojox.widget._codeTextArea.plugins.GoToLineDialog");
dojo.require("dijit.Dialog");

dojox.widget._codeTextArea.plugins.GoToLineDialog.startup = function(args){
        var source = args.source;
        dojo.subscribe(source.id + "::KeyPressed", 
        function(topicArgs){
//	        var source = topicArgs.source;
            var evt = topicArgs.evt;
            if(evt.ctrlKey && evt.charCode == 108){ // ctrl + l (lowercase L)
                if(!this._goToLineDialog){
//                    source._blockedKeyCombinations["CTRL+l"] = true;
                    
                    var _goToLineDialogDomNode = document.createElement("div");
                    var _fromTo = document.createElement("div");

                    var _fromLine = document.createElement("span");
					_fromLine.className = "codeTextAreaDialogCaption";
                    _fromLine.innerHTML = "Enter Line Number (1.."; 
                    _fromTo.appendChild(_fromLine);

                    var _toLine = document.createElement("span");
					_toLine.className = "codeTextAreaDialogCaption";
                    _fromTo.appendChild(_toLine);
                    
                    var _line = document.createElement("input");
                    _line.type = "text";
                    _line.value = "";
                    _line.value = "goToLineField";
                    _goToLineDialogDomNode.appendChild(_fromTo);
                    _goToLineDialogDomNode.appendChild(_line);

                    var _errors = document.createElement("div");
                    _errors.style.color = "red";
                    _errors.style.display = "none";
                    _goToLineDialogDomNode.appendChild(_errors);
                    
                    this._goToLineDialog = new dijit.Dialog({
                            title: "Go To Line",
                            duration: 40
                        }, _goToLineDialogDomNode
                    );
					dojo.addClass(this._goToLineDialog.titleNode, "codeTextAreaDialogTitle");
                    this._goToLineDialog._toLine = _toLine; // mmm
                    this._goToLineDialog._errors = _errors; // mmm...
                    var _self = this;
                    dojo.connect(this._goToLineDialog, "hide", function(){
						_self._goToLineDialog.domNode.getElementsByTagName("input")[0].blur();  
						source._blockedEvents = false;
			            document.body.focus();
					});
                    var _dialog = this._goToLineDialog; 
                    dojo.connect(_dialog, "show", function(){
                            _dialog._toLine.innerHTML = source.numLines() + ")";
                            _dialog.domNode.getElementsByTagName("input")[0].value = "";  
                    });
                    
                    dojo.connect(_dialog.titleBar, "focus", function(){
                            _dialog.domNode.getElementsByTagName("input")[0].focus();  
                    });
                    
                    dojo.connect(_dialog.domNode.getElementsByTagName("input")[0], "onkeypress", function(evt){
                            var evt = dojo.fixEvent(evt || window.event);
                            var errors = false; 
                            var _value = parseInt(_dialog.domNode.getElementsByTagName("input")[0].value, 10);
                            
                            var keyCode = evt.keyCode;
                            var charCode = evt.charCode;
                            var resCode = keyCode || charCode;
                            if(resCode == dojo.keys.ENTER){
                                if(isNaN(_value)){
                                    _errors.innerHTML = "not a number";
                                    _errors.style.display = "block";
                                }else if(_value < 1 || _value > source.numLines()){
                                    _errors.innerHTML = "out of range";
                                    _errors.style.display = "block";
                                }else{
                                    _errors.style.display = "none";
                                    source.setCaretPosition(0, 
                                        _value - 1);
									_dialog.domNode.getElementsByTagName("input")[0].blur();  
                                    _dialog.hide();
                                    dojo.stopEvent(evt);
                                }
                            }
                            evt.stopPropagation();
                    });
                }
				source._blockedEvents = true;
                this._goToLineDialog._errors.style.display = "none";
                this._goToLineDialog.show();            
            }
        }
    );
};