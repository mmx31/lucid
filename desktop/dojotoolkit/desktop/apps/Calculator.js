dojo.provide("desktop.apps.Calculator");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.layout.ContentPane");
dojo.requireLocalization("desktop", "apps");

dojo.declare("desktop.apps.Calculator", desktop.apps._App, {
	kill: function(){
		if(!this.win.closed) this.win.close();
	},
	
	init: function(){
		var app = dojo.i18n.getLocalization("desktop", "apps");
		var win = this.win = new desktop.widget.Window({
			title: app["Calculator"],
			width: "200px",
			height: "270px",
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
		});
		var textbox = new dijit.form.TextBox({
			region: "top",
			style: "text-align: right;"
		});
		win.addChild(textbox);
		var client = new dijit.layout.ContentPane({
			region: "center"
		});
		win.addChild(client);
		var table = document.createElement("table");
		var c = document.createElement("tbody");
		dojo.style(table, {
			borderColor: "transparent",
			width: "100%",
			height: "100%"
		});
		dojo.forEach([
			["(", ")",  "", "C"],
			["7", "8", "9", "/"],
			["4", "5", "6", "*"],
			["1", "2", "3", "-"],
			["0", ".", "=", "+"]
		], function(row){
			var rowNode = document.createElement("tr");
			dojo.forEach(row, function(cell){
				var cellNode = document.createElement("td");
				dojo.style(cellNode, "padding", "0px");
				if(cell != ""){
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
					dojo.query("span.dijitReset.dijitInline", button.domNode).style({
						width: "inherit",
						height: "inherit",
						paddingLeft: "0px",
						paddingRight: "0px"
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
		table.appendChild(c);
		client.setContent(table);
		win.show();
		win.startup();
	},
	clear: function(t){
		this.answerShown = false;
		desktop.textContent(this.eNode, "");
		t.setValue("");
	},
	answerShown: false,
	onSubmit: function(tb){
		this.answerShown = true;
		var v = tb.getValue().replace(/([0-9])\(/, "$1*(").replace(/\)([0-9])/, ")*$1")
		if(!this.validate(v)) return this.eNode.innerHTML = "E";
		else this.eNode.innerHTML = "";
		tb.setValue(eval("("+v+")"));
	},
	
	validate: function(v){
		//Check for matching parenthesis
		if(v.split("(").length != v.split(")").length) return false;
		//Check for invalid characters
		for(var i=0; i < v.length; i++){
			var c = v.charAt(i);
			if(!(!isNaN(parseInt(c))
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
		for(var i=0; i<parts.length;i++){
			if(parts[i] == "" && i!=0) return false;
			if(isNaN(parseInt(parts[i].charAt(0))) && i != 0) return false;
		}
		return true;
	}
})
