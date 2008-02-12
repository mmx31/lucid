class objManager {
	var objects = new Object();
	function objManager(){
		DojoExternalInterface.initialize();

		DojoExternalInterface.addCallback("makeObj", this, this.makeObj);
		DojoExternalInterface.addCallback("getValue", this, this.getValue);
		DojoExternalInterface.addCallback("setValue", this, this.setValue);
		DojoExternalInterface.addCallback("attachEvent", this, this.attachEvent;
		DojoExternalInterface.addCallback("callFunction", this, this.callFunction);
			
		DojoExternalInterface.loaded();
	}
	function makeObj(id, objectType, args) {
		var json = new JSON();
		var obj = null;
		args = json.parse(args);
		if(args.length == 1)
			var obj = new (eval(objectType))();
		else if(args.length == 2)
			var obj = new (eval(objectType))(args[1]);
		else if(args.length == 3)
			var obj = new (eval(objectType))(args[1], args[2]);
		else if(args.length == 4)
			var obj = new (eval(objectType))(args[1], args[2], args[3]);
		else if(args.length == 5)
			var obj = new (eval(objectType))(args[1], args[2], args[3], args[4]);
		else if(args.length == 6)
			var obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5]);
		else if(args.length == 7)
			var obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5], args[6]);
		else if(args.length == 8)
			var obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
		else if(args.length == 9)
			var obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
		else if(args.length == 10)
			var obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
		else if(args.length == 11)
			var obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10]);
		else if(args.length == 12)
			var obj = new (eval(objectType))(args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]);
			
		if(obj) this.objects[id] = obj;		
	}
	function attachEvent(id, method, callback) {
		var evtClass = new Object();
		evtClass[method] = function() {
			var json = new JSON();
			DojoExternalInterface.call(callback, null, json.stringify(arguments));
		}
		this.objects[id].addListener(evtClass);
	}
	function getValue(id, key, callback) {
		DojoExternalInterface.call(callback, null, json.stringify(this.objects[id][key]));
	}
	function setValue(id, key, value) {
		this.objects[id][key] = json.parse(value);
	}
	function callFunction(id, method, args, callback) {
		var json = new JSON();
		var p = this.objects[id][method].apply(this.objects[id], json.parse(args));
		if(callback) DojoExternalInterface.call(callback, null, json.stringify(p));
	}
}
//The notice below only applies to the JSON class...
/*
Copyright (c) 2005 JSON.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
class JSON {
            var ch:String = '';
            var at:Number = 0;
            var t,u;
            var text:String;

    function stringify(arg):String {

        var c, i, l, s = '', v;

        switch (typeof arg) {
        case 'object':
            if (arg) {
                if (arg instanceof Array) {
                    for (i = 0; i < arg.length; ++i) {
                        v = stringify(arg[i]);
                        if (s) {
                            s += ',';
                        }
                        s += v;
                    }
                    return '[' + s + ']';
                } else if (typeof arg.toString != 'undefined') {
                    for (i in arg) {
                        v = arg[i];
                        if (typeof v != 'undefined' && typeof v != 'function') {
                            v = stringify(v);
                            if (s) {
                                s += ',';
                            }
                            s += stringify(i) + ':' + v;
                        }
                    }
                    return '{' + s + '}';
                }
            }
            return 'null';
        case 'number':
            return isFinite(arg) ? String(arg) : 'null';
        case 'string':
            l = arg.length;
            s = '"';
            for (i = 0; i < l; i += 1) {
                c = arg.charAt(i);
                if (c >= ' ') {
                    if (c == '\\' || c == '"') {
                        s += '\\';
                    }
                    s += c;
                } else {
                    switch (c) {
                        case '\b':
                            s += '\\b';
                            break;
                        case '\f':
                            s += '\\f';
                            break;
                        case '\n':
                            s += '\\n';
                            break;
                        case '\r':
                            s += '\\r';
                            break;
                        case '\t':
                            s += '\\t';
                            break;
                        default:
                            c = c.charCodeAt();
                            s += '\\u00' + Math.floor(c / 16).toString(16) +
                                (c % 16).toString(16);
                    }
                }
            }
            return s + '"';
        case 'boolean':
            return String(arg);
        default:
            return 'null';
        }
    }
        function white() {
            while (ch) {
                if (ch <= ' ') {
                    this.next();
                } else if (ch == '/') {
                    switch (this.next()) {
                        case '/':
                            while (this.next() && ch != '\n' && ch != '\r') {}
                            break;
                        case '*':
                            this.next();
                            for (;;) {
                                if (ch) {
                                    if (ch == '*') {
                                        if (this.next() == '/') {
                                            next();
                                            break;
                                        }
                                    } else {
                                        this.next();
                                    }
                                } else {
                                    error("Unterminated comment");
                                }
                            }
                            break;
                        default:
                            this.error("Syntax error");
                    }
                } else {
                    break;
                }
            }
        }

        function error(m) {
            throw {
                name: 'JSONError',
                message: m,
                at: at - 1,
                text: text
            };
        }
        function next() {
            ch = text.charAt(at);
            at += 1;
            return ch;
        }
        function str() {
            var i, s = '', t, u;
            var outer:Boolean = false;

            if (ch == '"') {
                while (this.next()) {
                    if (ch == '"') {
                        this.next();
                        return s;
                    } else if (ch == '\\') {
                        switch (this.next()) {
                        case 'b':
                            s += '\b';
                            break;
                        case 'f':
                            s += '\f';
                            break;
                        case 'n':
                            s += '\n';
                            break;
                        case 'r':
                            s += '\r';
                            break;
                        case 't':
                            s += '\t';
                            break;
                        case 'u':
                            u = 0;
                            for (i = 0; i < 4; i += 1) {
                                t = parseInt(this.next(), 16);
                                if (!isFinite(t)) {
                                    outer = true;
                                    break;
                                }
                                u = u * 16 + t;
                            }
                            if(outer) {
                                outer = false;
                                break;
                            }
                            s += String.fromCharCode(u);
                            break;
                        default:
                            s += ch;
                        }
                    } else {
                        s += ch;
                    }
                }
            }
            this.error("Bad string");
        }

        function arr() {
            var a = [];

            if (ch == '[') {
                this.next();
                this.white();
                if (ch == ']') {
                    this.next();
                    return a;
                }
                while (ch) {
                    a.push(this.value());
                    this.white();
                    if (ch == ']') {
                        this.next();
                        return a;
                    } else if (ch != ',') {
                        break;
                    }
                    this.next();
                    this.white();
                }
            }
            this.error("Bad array");
        }

        function obj() {
            var k, o = {};

            if (ch == '{') {
                this.next();
                this.white();
                if (ch == '}') {
                    this.next();
                    return o;
                }
                while (ch) {
                    k = this.str();
                    this.white();
                    if (ch != ':') {
                        break;
                    }
                    this.next();
                    o[k] = this.value();
                    this.white();
                    if (ch == '}') {
                        this.next();
                        return o;
                    } else if (ch != ',') {
                        break;
                    }
                    this.next();
                    this.white();
                }
            }
            this.error("Bad object");
        }

        function num() {
            var n = '', v;

            if (ch == '-') {
                n = '-';
                this.next();
            }
            while (ch >= '0' && ch <= '9') {
                n += ch;
                this.next();
            }
            if (ch == '.') {
                n += '.';
                this.next();
                while (ch >= '0' && ch <= '9') {
                    n += ch;
                    this.next();
                }
            }
            if (ch == 'e' || ch == 'E') {
                n += ch;
                this.next();
                if (ch == '-' || ch == '+') {
                    n += ch;
                    this.next();
                }
                while (ch >= '0' && ch <= '9') {
                    n += ch;
                    this.next();
                }
            }
            v = Number(n);
            if (!isFinite(v)) {
                this.error("Bad number");
            }
            return v;
        }

        function word() {
            switch (ch) {
                case 't':
                    if (this.next() == 'r' && this.next() == 'u' &&
                            this.next() == 'e') {
                        this.next();
                        return true;
                    }
                    break;
                case 'f':
                    if (this.next() == 'a' && this.next() == 'l' &&
                            this.next() == 's' && this.next() == 'e') {
                        this.next();
                        return false;
                    }
                    break;
                case 'n':
                    if (this.next() == 'u' && this.next() == 'l' &&
                            this.next() == 'l') {
                        this.next();
                        return null;
                    }
                    break;
            }
            this.error("Syntax error");
        }

        function value() {
            this.white();
            switch (ch) {
                case '{':
                    return this.obj();
                case '[':
                    return this.arr();
                case '"':
                    return this.str();
                case '-':
                    return this.num();
                default:
                    return ch >= '0' && ch <= '9' ? this.num() : this.word();
            }
        }
    function parse(_text:String):Object {
        text = _text;
            at = 0;
        ch = ' ';
        return value();
    }
}