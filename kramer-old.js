/*

	Kramer crams JSON objects into strings that is usable as a URL component.

	The characters used are:

	Base64	ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-
	Extra	,$*()_.!'

	Headers
	=======

	Headers contain a dictionary of words and/or a collection of propsets (object
	property names). Headers may be supplied externally to the encode / decode
	functions (in which case care must be taken to ensure that the same headers are
	provided to both) or it may be embedded at the start of the document itself.

	Encoding values
	===============
	null		__
	true		_.
	false		_'
	number		_<base64_digits>,
	string		<base64+lookup>,					// omit s where only strings are valid (object keys, dictionary entries)
	dictlook	$<id> 								// all bytes until first in range [A-Za-f]
	object		)[<psetinfl>|<keyval>].
	array		([<value>].
	psetinfl	*<id>[<value>|<skip>]	// number of repeats is known from propset definition
	skip		.
	keyval		<base64+lookup>,<value>
	id			hoffman coded positive integer



	A base64 encoded string can have dictionary lookup sequences prefixed with a period.

	If propset inflate occurs in an object key position, it is a set of properties of
	the current object; if it occurs in a value position, it is a child object.

	Encoding headers
	====================
	dicthdr		$		[<base64+lookup>,]			// repeats until * ( or )
	psethdr		'		[[<base64+lookup>,].]		// repeats until ( or )

	If the first character of the document is a $ or *, there are headers.

	A $ starts the dictionary definition, which consists of base64 strings separated
	by commas. These words may have embedded dictionary lookup sequences ($)
	but only previously defined words may be referenced. The last word in the
	dictionary should be followed by one of ' * ( or )

	A ' starts the propsets header, which consists of multiple propset definitions
	separated by periods. Each propset definition consists of base64 strings
	separated by commas, which may contain dictionary lookups. The propsets header
	is terminated by one of * ( or ), which start an array or object in the document
	body.

	Documents with embedded headers must have an object or array at the root.

	Summary of non-base64 symbols (Xchars)
	======================================
	,	terminates strings and numbers
		where a value is expected, an empty string
	$	where a value is expected looks up a dictionary word
		at start of document, starts the dictionary header
	*	where a value is expected, creates an object using a propset
		where an object key is expected, adds all keys from a propset
	(	begins an array definition
	)	begins an object definition
	_	if the next char is also _ then null
		if the next char is . then false
		if the next char is ! then true
		if the next char is valid b64 then number
	!	terminates multiple arrays and objects; the next one character is
		an encoded number (0-63) specifying number of terminations
		at start of document or in dicthdr context, starts propsets header
	.	terminates arrays and objects;
		within propsets header, terminates propsets
		in psetinfl context, a skipped property
	'	reserved for future use

*/

module.exports = function(head) {

	var maps = {
		num: " 0123456789+-.e", // one symbol is unused.
		b64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-"
	};

	function stoa(str, map) {
		var a=[], i, l=str.length, c;

		for(i=0; i<l; i++) {
			c = map.indexOf(str.charAt(i));
			if(c == -1) throw Error(str + ' ' + i + ' ' + map);
			a.push(c);
		}
		return a;
	}

	function atos(arr, map) {
		var s='', i, l=arr.length, c;
		for(i=0; i<l; i++) {
			c = map[arr[i]];
			if(typeof c == 'undefined') throw Error();
			s += c;
		}
		return s;
	}

	function rebase(a, ba, bb) {
		var b=[], i, l=a.length, c=0, f=1;

		for(i=0; i<l; i++) {
			c = c*ba + (a[i] | 0);
			f*=ba;
			while (f>bb || i == l-1 && f>1) {
				f/=bb;
				b.push((c/f)|0);
				c = c%f;
			}
		}
		return b;
	}

	function encode(value) {
		head = head || {};

		function insertTerminator(s) {
			var c;

			if(s[s.length-1] == '.') {
				s = s.substr(0, s.length-1) + '!' + atos([0], maps.b64);
			} else if(s[s.length-2] == '!') {
				c = stoa(s[s.length-1], maps.b64)[0] + 1;
				if(c < 64) {
					s = s.substr(0, s.length-1) + atos([c], maps.b64);
				} else {
					s += '.';
				}
			} else {
				s += '.';
			}
			return s;
		}

		function encodeId(id) {
			var s = '', d;
			do {
				d = id%32;
				id = (id/32)|0;
				if(id>0) d&=0x20;
				s += maps.b64[d];
			} while(id>0);

			return s;
		};

		function encodeVal(value) {
			var i, l, p, s;
			switch (typeof value) {
				case 'undefined': return '!';
				case 'number': return '_' + encodeNum(value) + ',';
				case 'string':
					if(head.dict && (i=head.dict.indexOf(value)) != -1) {
						return '$' + encodeId(i);
					}
					return encodeStr(value) + ',';
				case 'boolean': return value? "_!": '_.';
				case 'object':
					if(value === null) {
						return '__';
					}
					if(Array.isArray(value)) {
						s='(';
						for(i=0, l=value.length; i<l; i++) s += encode(value[i]);
						return insertTerminator(s);
					}
					if (head.pset && (p=choosePset(value)) !== -1) {
						s='*' + encodeId(p);
						p = head.pset[p];
						for(i=0, l=p.length; i<l; i++) if(value.hasOwnProperty(p[i])) {
							s += encode(value[p[i]]);
						} else {
							s += '.';
						}
						return s;
					}
					s=')';
					for(i in value) s += encode(i) + encode(value[i]);
					return insertTerminator(s);
				default:
					throw new Error(value + ' cannot be encoded.');
			}
		}

		function choosePset(o) {
			var i, l, p, j, s, bests=0, bestp=-1;
			for(i=0, l=head.pset.length; i<l; i++) {
				p = head.pset[i];
				s=-p.length;
				for(j in o) if(p.indexOf(j) == -1) {
					s = -1; break;
				} else {
					s += (head.dict && head.dict[j])? 2: j.length;
				}
				if(s>bests) {
					bestp = i;
					bests = s;
				}
			}
			return bestp;
		}

		function encodeNum(n) {
			return atos(
				rebase(stoa(n.toString().toLowerCase(), maps.num), 16, 64),
				maps.b64
			);
		}

		function encodeStr(s) {
			// 0 padding
			// 1-95 ascii 32-126
			// 96-98 \t\n\r (stored in one byte)
			// 99 begin dictionary lookup sequences > id 16
			// 100-115 dictionary lookup sequence
			// 116-123 first 3 bits of unicode 0x0080-0x047f (stored in two bytes)
			// 124-127 first 2 bits of any 16-bit unicode (stored in three bytes)
			// javascript only fakes support for 32 bit unicode

			var i, l=s.length, a=[], c;
			for(i=0; i<l; i++) {
				c = s.charCodeAt(i);
				if(c < 32) switch(c) {
					// Control characters valid in JS strings:
					case  9: a.push(96); break; // \t
					case 10: a.push(97); break; // \n
					case 13: a.push(98); break; // \r
					default: a.push(124, 0, c); break;
				} else if(c < 0x7f) {
					a.push(c - 30);
				} else if(c == 0x7f) {
					a.push(124, 0, c); // DEL character;
				} else if(c < 0x0480) {
					a.push(116 + (((c-0x80)&0x0380)>>7), (c-0x80)&0x007f);
				} else {
					a.push(124 + ((c&0xc000)>>14), (c&0x3f80)>>7, c&0x007f);
				}
			}
			return atos(rebase(a, 128, 64), maps.b64);
		}

		return encodeVal(value);
	}

	function decode(string) {
		var pos = 0, pendingTerminators = 0;
		string += '~';
		head = head || {};

		function handleTerminator() {
			switch(string[pos++]) {
				case ',': return;
				case '.': pendingTerminators = 1; return;
				case '!': pendingTerminators = stoa(string[pos++], maps.b64)[0] + 2; return;
				default: pendingTerminators = Infinity; return;
//				default: return false;
			}
		}

		function lookupWord(n) {
			if(!head.dict || typeof head.dict[n] === 'undefined') {
				throw Error('Could not find dictionary entry ' + n);
			}
			return head.dict[n];
		}

		function inflatePset(n) {
			var pset, i, l, o={};
			if(!head.pset || typeof (pset=head.pset[n]) === 'undefined') {
				throw Error('Could not find propset ' + n);
			}
			for(i=0, l=pset.length; i<l; i++) {
				if(string[pos] == '.') {
					pos++;
					continue;
				}
				o[pset[i]] = decodeVal();
				if(pendingTerminators && i < l-1) {
					throw Error('Unexpected termination before pset inflation could complete');
				}
			}
			return o;
		}

		function decodeId() {
			var n = 0, d;
			do {
				d = maps.b64.indexOf(string[++pos]);
				n = n*32 + (d&0x1f);
			} while(d>=32);
			pos++;
			return n;
		}

		function decodeVal() {
			switch (string[pos]) {
				case ',': case '.': case '!': case '~':
					handleTerminator();
					return '';
				case '(':
					pos++;
					return decodeArr();
				case ')':
					pos++;
					return decodeObj();
				case '_':
					switch(string[pos+1]) {
						case '_': pos+=2; return null;
						case '.': pos+=2; return false;
						case '!': pos+=2; return true;
					}
					pos+=1;
					return decodeNum();
				case '$':
					return lookupWord(decodeId());
				case '*':
					return inflatePset(decodeId());
				default:
					return decodeStr();
			}
		}

		function decodeArr() {
			var a = [];

			while(!pendingTerminators) {
				if(string[pos] == '.' || string[pos] == '!' || string[pos] == '~') {
					handleTerminator(); break;
				}
				a.push(decodeVal());
			}
			pendingTerminators--;
			return a;
		}

		function decodeObj() {
			var o = {}, k;
			while(!pendingTerminators) {
				if(string[pos] == '.' || string[pos] == '!' || string[pos] == '~') {
					handleTerminator(); break;
				}				k = decodeVal();
				if(pendingTerminators) {
					throw Error('Invalid terminator after ' + k);
				}
				o[k] = decodeVal();
			}
			pendingTerminators--;
			return o;
		}

		function decodeNum() {
			var start=pos, n;
			while(string[pos] != ',' && string[pos] != '.' && string[pos] != '!' && string[pos] != '~') pos++;
			n = parseFloat(atos(
				rebase(stoa(string.substring(start, pos), maps.b64), 64, 16), maps.num
			));
			handleTerminator();
			return n;
		}

		function decodeStr() {
			// 0 padding
			// 1-95 ascii 32-126
			// 96-98 \t\n\r (stored in one byte)
			// 99 begin dictionary lookup sequences, id > 16
			// 100-115 dictionary lookup sequence, id < 16
			// 116-123 first 3 bits of unicode 0x0080-0x047f (stored in two bytes)
			// 124-127 first 2 bits of any 16-bit unicode (stored in three bytes)
			// javascript only fakes support for 32 bit unicode

			var i, l, a, n, s='', start=pos;
			while(string[pos] != ',' && string[pos] != '.' && string[pos] != '!' && string[pos] != '~') pos++;
			a = rebase(stoa(string.substring(start, pos), maps.b64), 64, 128);

			function decodeId() { // Decode lookup IDs within a 7-byte string
				var acc = 0;
				do {
					acc = acc*64 + (a[++i]&0x3f);
				} while(a[i] > 64);
				return acc;
			}

			for(i=0, l=a.length; i<l; i++) {
				n = a[i];
				if(n === 0) {
					continue;
				} else if(n < 96) {
					s += String.fromCharCode(a[i] + 30);
				} else if(n < 100) switch(n) {
					case 96: s += String.fromCharCode(9);  break; // \t
					case 97: s += String.fromCharCode(10); break; // \n
					case 98: s += String.fromCharCode(13); break; // \r
					case 99: s += lookupWord(16 + decodeId());
				} else if(n < 116) {
					lookupWord(n-100);
				} else if(n < 124) {
					s += String.fromCharCode(0x80 + (n-116)*128 + a[++i]);
				} else {
					s += String.fromCharCode((n-124)*128*128 + a[++i]*128 + a[++i]);
				}

			}
			handleTerminator();
			return s;
		}

		return decodeVal();
	}

	return {
		encode: encode,
		decode: decode
	};
};
//
//var orig = {hello: "world", what: [12, false, 'wh\u7388at']};
//var head;
//// head = {dict: ['hello', 'what']};
//head = {dict: ['hello', 'world'], pset: [['hello', 'what'], ['hello', 'what', 'woo'], ['hello']]};
//var code = encode(orig);
//
//console.log(code, code.length);
//console.log(JSON.stringify(orig));
//console.log(JSON.stringify(decode(code)));


//
//var t = [12, 54, 65, 23, 80], u = rebase(t, 128, 64);
//console.log(t, u, rebase(u, 64, 128));
//
