/* 
 * Group: api
 * 
 * Package: sound
 * 
 * Summary:
 * 		An API that allows an app to play audio content.
 */
api.sound = function(object) {
	
}

/* 
 * Group: api
 * 
 * Package: soundmanager
 * 
 * Summary:
 * 		An API that allows an app to play audio content.
 */

 api.soundmanager = new function() {
 	this.draw = function() {
		this.container = document.createElement("div");
		this.container.style.position="absolute";
		this.container.style.left="-999px";
		this.container.style.top="-999px";
		document.body.appendChild(this.container);
	}
 }
