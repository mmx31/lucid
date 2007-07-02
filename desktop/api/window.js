/**
 * A counter for assigning window IDs
 * 
 * @type {Integer}
 * @memberOf api
 */
api.windowcounter = 0;
/** 
* The window constructor
* 
* @memberOf api
* @constructor
*/
api.window = function()
{
	/**
	 * A unique ID for the window
	 * 
	 * @type {String}
	 * @alias api.window.id
	 * @memberOf api.window
	 */
	this._id = "win"+api.windowcounter;
	api.windowcounter++;
	/**
	 * The window's contents
	 * 
	 * @type {String}
	 * @alias api.window.innerHTML
	 * @memberOf api.window
	 */
	this.innerHTML = "";
	/**
	 * The window's height in px, em, or %.
	 * 
	 * @type {String}
	 * @alias api.window.height
	 * @memberOf api.window
	 */
	this.height = "400px";
	/**
	 * The windows width in px, em, or %.
	 * 
	 * @type {String}
	 * @alias api.window.width
	 * @memberOf api.window
	 */
	this.width = "500px";
	/**
	 * The window's title
	 * 
	 * @type {String}
	 * @alias api.window.title
	 * @memberOf api.window
	 */
	this.title = "";
	//this.templatePath = dojo.uri.dojoUri("../themes/default/window.html");
	//this.templateCssPath = dojo.uri.dojoUri("../themes/default/window.css");
	/**
	 * Weather or not the titlebar should be shown.
	 * 
	 * @type {Boolean}
	 * @alias api.window.titleBarDisplay
	 * @memberOf api.window
	 */
	this.titleBarDisplay = true;
	/**
	 * Weather or not the window's shadow should be shown.
	 * 
	 * @type {Boolean}
	 * @alias api.window.hasShadow
	 * @memberOf api.window
	 */
	this.hasShadow = true;
	/**
	 * Weather or not the window is resizable.
	 * 
	 * @type {Boolean}
	 * @alias api.window.resizable
	 * @memberOf api.window
	 */
	this.resizable = true;
	/** 
	* Emptys the window's contents
	* 
	* @method
	* @alias api.window.empty
	* @memberOf api.window
	*/
	this.empty = function()
	{
		this.window.innerHTML = "";
		if(document.getElementById(this._id))
		{
			document.getElementById(this.window.id).innerHTML = "";
		}
	}
	/** 
	* Writes HTML to the window
	* 
	* @method
	* @param {String} string	the HTML to append to the window
	* @alias api.window.write
	* @memberOf api.window
	*/
	this.write = function(string)
	{
		this.innerHTML += string;
		if(document.getElementById(this._id))
		{
			document.getElementById(this._id).innerHTML += string;
		}		
	}
	/** 
	* Shows the window
	* 
	* @method
	* @alias api.window.show
	* @memberOf api.window
	*/
	this.show = function()
	{
		windiv=document.createElement("div");
		windiv.style.position="absolute";
		windiv.style.top = "5%";
		windiv.style.left = "5%";
		windiv.style.width=this.width;
		windiv.style.height=this.height;
		windiv.style.zindex="100";
		windiv.innerHTML=this.innerHTML;
		document.getElementById("windowcontainer").appendChild(windiv);
		this.window = dojo.widget.createWidget("FloatingPane", {
			hasShadow: true,
			resizable: this.resizable,
			displayCloseAction: true,
			title: this.title,
			displayMaximizeAction: true,
			displayMinimizeAction: true,
			taskBarId: "appbar",
			toggle: "explode",
			toggleDuration: 300,
			constrainToContainer: true,
		templatePath: dojo.uri.dojoUri("../themes/default/window.html"),
		//templateCssPath: dojo.uri.dojoUri("../themes/default/window.css"),
		templateCssPath: null,
		templateCssString: "",
		templateString: "",
		titleBarDisplay: this.titleBarDisplay,
		hasShadow: this.hasShadow,
            id: this._id
		}, windiv);		
	}
	/** 
	* Destroys the window (or closes it)
	* 
	* @method
	* @alias api.window.destroy
	* @memberOf api.window
	*/
	this.destroy = function()
	{
		if(this.window) { this.window.destroy(); }
		else { api.console("Warning in app: No window shown."); }
	}
	/** 
	* Adds a dojo widget or HTML element to the window.
	* 
	* @method
	* @param {Node} node	A dojo widget or HTML element.
	* @alias api.window.addChild
	* @memberOf api.window
	*/
    this.addChild = function(node)
    {
        this.window.addChild(node);
    }
}   