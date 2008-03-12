import DojoExternalInterface;

class objManager {
	public var objects = new Object();
	public function objManager(){
		DojoExternalInterface.initialize();
		DojoExternalInterface.addCallback("makeObj", this, makeObj);
		DojoExternalInterface.addCallback("getValue", this, getValue);
		DojoExternalInterface.addCallback("setValue", this, setValue);
		DojoExternalInterface.addCallback("attachEvent", this, attachEvent);
		DojoExternalInterface.addCallback("callFunction", this, callFunction);
		DojoExternalInterface.loaded();
	}
	public function makeObj(id, objectType, args) {
		var obj = false;
		if(args.length == 1)
			obj = new (eval(objectType))();
		else if(args.length == 2)
			obj = new (eval(objectType))(args[1]);
		else if(args.length == 3)
			obj = new (eval(objectType))(args[1], args[2]);
		else if(args.length == 4)
			obj = new (eval(objectType))(args[1], args[2], args[3]);
		else if(args.length == 5)
			obj = new (eval(objectType))(args[1], args[2], args[3], args[4]);
		else if(args.length == 6)
			obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5]);
		else if(args.length == 7)
			obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5], args[6]);
		else if(args.length == 8)
			obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
		else if(args.length == 9)
			obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
		else if(args.length == 10)
			obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
		else if(args.length == 11)
			obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10]);
		else if(args.length == 12)
			obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]);
			
		if(obj) this.objects[id] = obj;		
	}
	public function attachEvent(id, method, callback) {
		var evtClass = new Object();
		evtClass[method] = function() {
			DojoExternalInterface.call(callback, null, arguments);
		}
		this.objects[id].addListener(evtClass);
	}
	public function getValue(id, key, callback) {
		var obj = this.objects[id];
		DojoExternalInterface.call(callback, null, obj[key]);
	}
	public function setValue(id, key, value) {
		var obj = this.objects[id]
		obj[key] = value;
	}
	public function callFunction(id, method, args, callback) {
		var obj = this.objects[id];
		var p = obj[method].apply(this.objects[id], args);
		if(callback) DojoExternalInterface.call(callback, null, p);
	}
	public static function main():Void
	{
		_root.app = new objManager();
	}
}