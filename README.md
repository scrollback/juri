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

Compression achieved depends greatly on picking the right dictionaries and psets. For the (rather unoptimized) example above, encode generates the string `)uSg,*ASypdCG,$E($Atx506jZ,.*BdSwSyXQpS6Ek,ZVI9WXGj0Kw,.l0A,*AV0I0uG,$E(o1IdCTH,$D$C.*BYQ6kehGqQwS+jGlg,ZVJc+OCXy6EurWj1A,_Y,.`
which is 27% of the size of the naive approach (`encodeURIComponent(JSON.stringify(data))`).
