kramer
======

Crams JSON objects into tiny, URL-safe strings

![The Kramer](http://i.imgur.com/FlT7iIc.jpg)

Kramer is exported as a CommonJS module. For use on the client, use browserify. I might repackage using UMD or some such if there is demand.

```javascript
var kramer = require('./kramer.js')({
		dict: ['red', 'blue', 'green', 'white',
			   'Asia', 'North America', 'South America'],
		pset: [
			['name', 'continent', 'flagColors', 'leader'],
			['name', 'title', 'term']
		]
	}),
	data = {
		zh: {
			name: "China", continent: "Asia",
			flagColors: ["red", "yellow"],
			leader: { name: "Xi Jinping", title: "President" }
		},
		in: {
			name: "India", continent: "Asia",
			flagColors: ["orange", "white", "green"],
			leader: { name: "Narendra Modi", title: "Prime Minister", term: 5 }
		}
	};
	
	var encoded = kramer.encode(data);
	
	var decoded = kramer.decode(encoded);

```