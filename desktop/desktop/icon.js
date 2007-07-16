/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
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