this.kill = function() {
	if(!this.window.closed) { this.window.close(); }
}
this.init = function(args)
{
	dojo.require("dijit.layout.ContentPane");
winHTML  = '<form style="height: 12%; overflow: hidden;" onSubmit="return desktop.app.instances['+this.instance+'].evaluate();"><input type="text" id="results'+this.instance+'" style="text-align: right; width: 100%;" /></form>';
//------------------
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'(\'">(</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \')\'">)</button>';
winHTML += '<button style="width: 25%; height: 16%; visibility: hidden;"> </button>'
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value = \'\'">C</button>';
//------------------
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'7\'">7</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'8\'">8</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'9\'">9</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'/\'">/</button>';
//------------------
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'4\'">4</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'5\'">5</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'6\'">6</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'*\'">*</button>';
//------------------
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'1\'">1</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'2\'">2</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'3\'">3</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'-\'">-</button>';
//------------------
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'0\'">0</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'.\'">.</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="desktop.app.instances['+this.instance+'].evaluate()">=</button>';
winHTML += '<button style="width: 25%; height: 16%;" onClick="document.getElementById(\'results'+this.instance+'\').value += \'+\'">+</button>';
//-------------------
this.window = new api.Window({
	title: "Calculator",
	width: "200px",
	height: "235px"
});
var b = new dijit.layout.ContentPane({layoutAlign: "client"});
b.setContent(winHTML);
this.window.addChild(b);
this.window.show();
this.window.startup();
dojo.connect(this.window, "onClose", this, this.kill);
}
this.evaluate = function()
{
     if(document.getElementById("results"+this.instance).value != "")
     {
          try{ eval("document.getElementById('results'+this.instance).value = "+document.getElementById("results"+this.instance).value); }
          catch(e) { document.getElementById('results'+this.instance).value = "ERROR"; }
     }
     return false;
}