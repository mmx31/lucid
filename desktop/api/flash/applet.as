class apiSound{
	var sounds = {};
	function apiSound(){
		DojoExternalInterface.initialize();

		DojoExternalInterface.addCallback("makeSound", this, this.makeSound);
		DojoExternalInterface.addCallback("getPosition", this, this.getPosition);
			
		DojoExternalInterface.loaded();
	}
	function makeSound(id, url, loadCallback) {
		this.sounds[id].
		this.sounds[id].callback = loadCallback;
		this.sounds[id].sound.attachSound(url);
		this.sound.addEventListener("onLoad", this);
	}
	function onLoad() {
		DojoExternalInterface.call(this.loadCallback, null, );
	}
	function getPostition() {
		return this.sound.position;
	}
}