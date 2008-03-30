this.kill = function() {
	if(!this.win.closed) this.win.close();
}

this.init = function() {
	dojo.require("dijit.form.Button");
	dojo.require("dijit.form.TextBox");
	dojo.require("dijit.layout.ContentPane");
	var win = this.win = new api.Window({
		title: "Calculator",
		width: "200px",
		height: "270px",
		onClose: dojo.hitch(this, "kill")
	});
	var textbox = new dijit.form.TextBox({
		layoutAlign: "top",
		style: "text-align: right;"
	});
	win.addChild(textbox);
	var client = new dijit.layout.ContentPane({
		layoutAlign: "client"
	});
	win.addChild(client);
	var c = document.createElement("table");
	dojo.style(c, {
		border: "0px",
		width: "100%",
		height: "100%"
	});
	dojo.forEach([
		["(", ")",  "", "C"],
		["7", "8", "9", "/"],
		["4", "5", "6", "*"],
		["1", "2", "3", "-"],
		["0", ".", "=", "+"]
	], function(row) {
		var rowNode = document.createElement("tr");
		dojo.forEach(row, function(cell) {
			var cellNode = document.createElement("td");
			dojo.style(cellNode, "padding", "0px");
			if(cell != "") {
				var button = new dijit.form.Button({
					style: "width: 100%; height: 100%; margin: 0px;",
					label: cell,
					onClick: dojo.hitch(this, function(){
						if((parseInt(cell)+"" != "NaN" || cell == ".") && this.answerShown) this.clear(textbox); 
						if(cell == "=") return this.onSubmit(textbox);
						if(cell == "C") return this.clear(textbox);
						this.answerShown = false;
						textbox.setValue(textbox.getValue() + cell);
					})
				});
				dojo.style(button.focusNode, {
					width: "100%",
					height: "100%"
				});
				cellNode.appendChild(button.domNode);
			}
			else {
				this.eNode = document.createElement("div");
				dojo.style(this.eNode, {
					textAlign: "center",
					color: "red",
					fontWeight: "bold"
				});
				cellNode.appendChild(this.eNode);
			}
			rowNode.appendChild(cellNode);
		}, this);
		c.appendChild(rowNode);
	}, this);
	client.setContent(c);
	win.show();
}
this.clear = function(t) {
	this.answerShown = false;
	this.eNode.textContent = "";
	t.setValue("");
}
this.answerShown = false;
this.onSubmit = function(t) {
	this.answerShown = true;
	var v = t.getValue();
	this.eNode.textContent = "";
	if(!this.validate(v)) return this.eNode.textContent = "E";
	t.setValue(eval(t.getValue()));
}

this.validate = function(v) {
	//Check for matching parenthesis
	if(v.split("(").length != v.split(")").length) return false;
	//Check for invalid characters
	for(var i=0; i < v.length; i++) {
		var c = v[i];
		if(!(parseInt(c)+"" != "NaN"
		|| c == ")"
		|| c == "("
		|| c == "/"
		|| c == "*"
		|| c == "+"
		|| c == "-"
		|| c == "."
		)) return false;
	}
	//Check for stray decimal points
	var parts = v.split(".");
	for(i=0; i<parts.length;i++) {
		if(parts[i] == "" && i!=0) return false;
		if(parseInt(parts[i].charAt(0))+"" == "NaN" && i != 0) return false;
	}
	return true;
}

this.getValue = function(op) {
	if(op.indexOf("+") != -1) return this.sum.apply(this, op.split("+"));
	if(op.indexOf("-") != -1) return this.difference.apply(this, op.split("-"));
	if(op.indexOf("*") != -1) return this.product.apply(this, op.split("*"));
	if(op.indexOf("/") != -1) return this.quotient.apply(this, op.split("/"));
}

this.offsetDecimal = function(a, b) {
	if((a.indexOf(".") == -1 && b.indexOf(".") == -1)
	|| ((a.length - a.indexOf(".") == b.length - b.indexOf(".")) && (a.indexOf(".") != -1 && b.indexOf(".") != -1))) return [a, b];
	if(a.indexOf(".") == -1) a += ".";
	if(b.indexOf(".") == -1) b += ".";
	if(a.charAt(0) == ".") a = "0"+a;
	if(b.charAt(0) == ".") b = "0"+b;
	var g = a.length - a.indexOf(".") > b.length - b.indexOf(".") ? a : b;
	var l = a.length - a.indexOf(".") <= b.length - b.indexOf(".") ? a : b;
	while(g.length - g.indexOf(".") > l.length - l.indexOf(".")) {
		l += "0";
	}
	if(l.charAt(l.length-1) == ".") l = l.substring(0, l.length-1);
	if(g.charAt(g.length-1) == ".") g = g.substring(0, g.length-1);
	return a.length - a.indexOf(".") > b.length - b.indexOf(".") ? [g, l] : [l, g];
}

this.sum = function(a, b) {
	var num = this.offsetDecimal(a+"", b+"");
	a = num[0]; b=num[1];
	var l = (a.length > b.length ? a.length : b.length)-1;
	var carryFlag = 0;
	var retVal = "";
	var checkFlag = function(i) {
		if(i >= 10) {
			carryFlag = parseInt((i+"").substring(0, (i+"").length-2));
			return (i+"").charAt((i+"").length-1);
		}
		return i;
	}
	for(i=l; i>=0; i--) {
		console.log({retVal: retVal, carryFlag: carryFlag, i: i});
		if(a.charAt(i) == ".") {
			retVal = "." + retVal;
			continue;
		}
		if(a.charAt(i) == "") {
			retVal = checkFlag(parseInt(b.charAt(i)) + carryFlag) + retVal;
		}
		else if(b.charAt(i) == "") {
			retVal = checkFlag(parseInt(a.charAt(i)) + carryFlag) + retVal;
		}
		else retVal = checkFlag((parseInt(a.charAt(i)) + parseInt(b.charAt(i))) + carryFlag);
	}
	console.log({retVal: retVal, carryFlag: carryFlag, i: i});
	if(carryFlag > 0) retVal = carryFlag + retVal;
	return retVal;
}
