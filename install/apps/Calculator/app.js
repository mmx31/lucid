this.kill = function() {
	if(!this.window.destroyed) { this.window.destroy(); }
	this.status = "killed";
}
this.windowKill = function() {
	this.kill();
}
this.init = function(args)
{
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
this.window = new api.window({
	title: "Calculator",
	width: "200px",
	height: "235px"
});
this.window.body.setContent(winHTML);
this.window.show();
this.status = "active";
this.window.onDestroy = dojo.hitch(this, this.windowKill);
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