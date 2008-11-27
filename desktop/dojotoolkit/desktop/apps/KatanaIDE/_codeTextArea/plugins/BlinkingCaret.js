dojo.provide("desktop.apps.KatanaIDE._codeTextArea.plugins.BlinkingCaret");
desktop.apps.KatanaIDE._codeTextArea.plugins.BlinkingCaret.startup = function(args){
    this._blinkInterval = setInterval(dojo.hitch(args.source,function(){
        this.caret.style.visibility = 
            this.caret.style.visibility == "hidden" ? "visible" : "hidden"; 
    }), 500);
};
