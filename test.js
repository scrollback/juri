var options = {
	dict: ['red', 'blue', 'green', 'white',
		   'Asia', 'North America', 'South America'],
	pset: [
		['name', 'continent', 'flagColors', 'leader'],
		['name', 'title', 'term']
	]
},
	kramer = require('./kramer.js')(options),
	data = {
		china: {
			name: "Peoples Republic of China",
			continent: "Asia",
			flagColors: ["red", "yellow"],
			leader: {
				name: "Xi Jinping",
				title: "President"
			}
		},
		india: {
			name: "Republic of India",
			continent: "Asia",
			flagColors: ["orange", "white", "green"],
			leader: {
				name: "Narendra Modi",
				title: "Prime Minister",
				term: 5
			}
		},
		usa: {
			name: 'United States of America',
			continent: "North America",
			flagColors: ["red", "white", "blue", ''],
			leader: {
				name: "Barack Obama",
				title: "President",
				term: 4
			}
		}
	},
	encoded = kramer.encode(data),
	decoded = kramer.decode(encoded),
	json = JSON.stringify(data);

console.log("Original: ", data);
console.log("Encoded: ", encoded);
console.log("Decoded: ", decoded);
console.log(json == JSON.stringify(decoded)? "Correct": "Incorrect");
console.log("Crammed into ", Math.round(encoded.length * 10000 / encodeURIComponent(json).length)/100 + '% of URL encoded JSON');



