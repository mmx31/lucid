this.init = function(args)
{
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.layout.LayoutContainer");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.Dialog");
	this.win = new api.window({
		title: "File Browser",
		bodyWidget: "LayoutContainer",
		onHide: dojo.hitch(this, this.kill)
	});
	this.fileArea = new api.filearea({layoutAlign: "client", path: (args.path || "/")})
	this.win.addChild(this.fileArea);
	this.toolbar = new dijit.Toolbar({layoutAlign: "top"});
		var button = new dijit.form.Button({
			onClick: dojo.hitch(this.fileArea, function() {
				this.setPath("/");
			}),
			iconClass: "icon-16-places-user-home",
			label: "Home"
		});
		this.toolbar.addChild(button);
		var button = new dijit.form.Button({
			onClick: dojo.hitch(this.fileArea, this.fileArea.up),
			iconClass: "icon-16-actions-go-up",
			label: "Up"
		});
		this.toolbar.addChild(button);
		var button = new dijit.form.Button({
			onClick: dojo.hitch(this.fileArea, this.fileArea.refresh),
			iconClass: "icon-16-actions-view-refresh",
			label: "Refresh"
		});
		this.toolbar.addChild(button);
		this.uDiag = new dijit.TooltipDialog({
			title: "Upload",
			onOpen: dojo.hitch(this, function(pos) {
				this.uploader.path = this.fileArea.path;
				dojo.connect(closebut, "onClick", this.upbutton, this.upbutton._closeDropDown);
			}),
			style: "width: 415px; height: 30px;"
		});
		this.uploaderArgs = {
			path: this.fileArea.path,
			onComplete: dojo.hitch(this, function(data, ioArgs, widgetRef){
				widgetRef.setMessage(data.status+": "+data.details);
				setTimeout(dojo.hitch(this, function(){
					this.upbutton._closeDropDown();
					this.uploader.hide();
					this.uploader = new dojox.widget.FileInput_fileb_remix(this.uploaderArgs);
					this.uploadDiv.appendChild(this.uploader.domNode);
				}),2000);
			})
		}
		this.uploader = new dojox.widget.FileInput_fileb_remix(this.uploaderArgs);
		var closebut = new dijit.form.Button({
			label: "Close",
			style: "position: absolute; top: 20px; right: 5px;"
		});
		this.uploadDiv = document.createElement("div");
		this.uploadDiv.appendChild(this.uploader.domNode);
		this.uploadDiv.appendChild(closebut.domNode);
		this.uDiag.setContent(this.uploadDiv);
		this.upbutton = new dijit.form.DropDownButton({
			onClick: dojo.hitch(this.fileArea, this.fileArea.refresh),
			iconClass: "icon-16-actions-mail-send-receive",
			label: "Upload",
			dropDown: this.uDiag,
			_onBlur: function(e) {}
		});
		this.toolbar.addChild(this.upbutton);
	this.win.addChild(this.toolbar);
	this.win.show();
	this.win.startup();
	this.win.onDestroy = dojo.hitch(this, this.kill);
	this.fileArea.refresh();
	this.uploader.startup();
	api.instances.setActive(this.instance);
}

this.kill = function() {
	if(!this.win.hidden) { this.win.hide(); }
	api.instances.setKilled(this.instance);
}
api.addDojoCss("dojox/widget/FileInput/FileInput.css");
dojo.require("dojox.widget.FileInputAuto");
dojo.declare("dojox.widget.FileInput_fileb_remix",
	dojox.widget.FileInputAuto,
{
	path: "/",
	url: desktop.core.backend("api.fs.io.upload"),
	name: "uploadedfile",
	templateString:"<div class=\"dijitFileInput tundra\">\n\t<input class=\"dijitFileInputReal\" type=\"file\" dojoAttachPoint=\"fileInput\" />\n\t<div class=\"dijitFakeInput\" dojoAttachPoint=\"fakeNodeHolder\">\n\t\t<input class=\"dijitFileInputVisible\" type=\"text\" dojoAttachPoint=\"focusNode, inputNode\" />\n\t\t<span class=\"dijitInline dijitFileInputText\" dojoAttachPoint=\"titleNode\">${label}</span>\n\t\t<span class=\"dijitInline dijitFileInputButton\" dojoAttachPoint=\"cancelNode\" dojoAttachEvent=\"onclick:_onClick\">${cancelText}</span>\n\t</div>\n\t<div class=\"dijitProgressOverlay\" dojoAttachPoint=\"overlay\">&nbsp;</div>\n</div>\n",
	
	_sendFile: function(/* Event */e){
		// summary: triggers the chain of events needed to upload a file in the background.
		if(!this.fileInput.value || this._sent){ return; }
		
		dojo.style(this.fakeNodeHolder,"display","none");
		dojo.style(this.overlay,"opacity","0");
		dojo.style(this.overlay,"display","block");

		this.setMessage(this.uploadMessage);

		dojo.fadeIn({ node: this.overlay, duration:this.duration }).play();
		this.fileInput.name="uploadedfile";
		var _newForm = document.createElement('form');
		_newForm.setAttribute("enctype","multipart/form-data");
		var node = dojo.clone(this.fileInput);
		_newForm.appendChild(this.fileInput);;
		dojo.body().appendChild(_newForm);
		dojo.io.iframe.send({
			url: this.url+"&path="+encodeURIComponent(this.path),
			form: _newForm,
			handleAs: "json",
			handle: dojo.hitch(this,"_handleSend")
		});
	}
});
