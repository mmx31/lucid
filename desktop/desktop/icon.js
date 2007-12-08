/**
* Contains all the desktop icon functions
* 
* @classDescription Contains all the desktop icon functions
* @memberOf desktop
* @constructor	
*/
desktop.icon = new function()
{
	/**
	 * Loads the icons and draws each of them
	 * 
	 * @type {Function}
	 * @alias desktop.icon.init
	 * @memberOf desktop.icon
	 */
	this.init = function()
	{
		
	}
	/**
	 * A constructor for a desktop icon.
	 * 
	 * @type {Function}
	 * @alias desktop.icon.icon
	 * @memberOf desktop.icon
	 * @constructor
	 */
	this.icon = function()
	{
		/**
		 * The image for the icon
		 * 
		 * @type {String}
		 * @memberOf desktop.icon.icon
		 */
		this.image = "";
				/**
		 * The label for the icon
		 * 
		 * @type {String}
		 * @memberOf desktop.icon.icon
		 */
		this.label= "New Icon";
		/**
		 * activated when the icon is double clicked
		 * 
		 * @method
		 * @memberOf desktop.icon.icon
		 */
		this.onclick = function()
		{
			//stub
		}
		/**
		 * Destroys the icon
		 * 
		 * @method
		 * @memberOf desktop.icon.icon
		 */
		this.destroy = function()
		{
			
		}
		/**
		 * Draws the icon onto the desktop
		 * 
		 * @method
		 * @memberOf desktop.icon.icon
		 */
		this.show = function()
		{
			
		}
	}
}
desktop.icon.icon()