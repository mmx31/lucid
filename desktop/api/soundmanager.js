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

/* 
 * Group: api
 * 
 * Package: sound
 * 
 * Summary:
 * 		An API that allows an app to play audio content.
 * 		This is a constructor that interfaces with the actual sound manager.
 */
api.sound = function(object) {
	this.soundObj = new AFLAX.FlashObject(aflax, "Sound");
	this.soundObj.exposeFunction("loadSound", this.soundObj);		
	this.soundObj.exposeFunction("start", this.soundObj);		
	this.soundObj.exposeFunction("stop", this.soundObj);		
	this.soundObj.exposeProperty("position", this.soundObj);
	this.soundObj.mapFunction("addEventHandler");		
	//this.soundObj.addEventHandler("onLoad", "readyToPlay");
	if(typeof object == "string")
	{
		this.soundObj.loadSound(object, true);
	}
	else
	{
		this.soundObj.loadSound(object.sound, true);
	}
	this.soundObj.stop();
	this.getPosition = dojo.hitch(this.soundObj, this.soundObj.getPosition);
	this.play = dojo.hitch(this.soundObj, this.soundObj.start);
	this.stop = dojo.hitch(this.soundObj, this.soundObj.stop);
}

/* 
 * Group: api
 * 
 * Package: soundmanager
 * 
 * Summary:
 * 		An API that allows an app to play audio content.
 * 		This is the actual sound manager that interfaces with AFLAX.
 */

 api.soundmanager = new function() {
 	this.draw = function() {
		div = document.createElement("div");
		div.style.position="absolute";
		div.style.left="-999px";
		div.style.top="-999px";
		div.innerHTML = aflax.getHTML(1,1,"#FFFFFF","alert",true,false);
		document.body.appendChild(div);
		console.log(div);
	}
 }
