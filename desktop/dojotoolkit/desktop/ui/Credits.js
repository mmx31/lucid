dojo.provide("desktop.ui.Credits");
dojo.require("dojox.fx.scroll");

dojo.declare("desktop.ui.Credits", dijit._Widget, {
	postCreate: function(){
		dojo.style(this.domNode, {
			overflow: "hidden",
			textAlign: "center"
		});
	},
	startup: function(){

		var head = document.createElement("h2");
		desktop.textContent(head, "Psych Desktop");
		this.domNode.appendChild(head);
		
		var version = document.createElement("b");
		desktop.textContent(version, "Version "+desktop.version);
		this.domNode.appendChild(version);
		
		dojo.xhrGet({
			url: dojo.moduleUrl("desktop.resources", "credits.json"),
			load: dojo.hitch(this, function(data){
				dojo.forEach(data, function(item){
					var head = document.createElement("h4");
					desktop.textContent(head, item.title);
					this.domNode.appendChild(head);
					var ul = document.createElement("ul");
					dojo.style(ul, {padding: "0px"});
					dojo.forEach(item.items, function(p){
						var li = document.createElement("li");
						desktop.textContent(li, p[0]);
						var addPos = function(str){
							var div = document.createElement("div");
							dojo.style(div, "fontSize", "8pt");
							desktop.textContent(div, str);
							li.appendChild(div);
						}
						if(dojo.isString(p[1]))
							addPos(p[1])
						else
							dojo.forEach(p[1], addPos);
						ul.appendChild(li);
					}, this);
					this.domNode.appendChild(ul);
				}, this);
				this.lastNode = document.createElement("div");
				dojo.style(this.lastNode, "height", "100%");
				this.domNode.appendChild(this.lastNode);

				this.doScroll();
			}),
			handleAs: "json"
		})
	},
	doScroll: function(){
		this.domNode.scrollTop = 0;
		setTimeout(dojo.hitch(this, function(){
			var height = this.domNode.scrollHeight;
			var anim = dojox.fx.smoothScroll({
				win: this.domNode,
				node: this.lastNode,
				duration: (height/20)*1000
			});
			dojo.connect(anim, "onEnd", this, function(){
				setTimeout(dojo.hitch(this, "doScroll"), 1000);
			});
			anim.play();
		}), 1000*2);
	}
})
