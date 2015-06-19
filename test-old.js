var options = {
	dict: ['red', 'blue', 'green', 'white',
		   'Asia', 'North America', 'South America'],
	pset: [
		['name', 'continent', 'flagColors', 'leader'],
		['name', 'title', 'term']
	]
},
	kramer = require('./kramer-old.js')() /* (options) */,
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
    },
	encoded = kramer.encode(data),
	decoded = kramer.decode(encoded),
	json = JSON.stringify(data);

console.log("Original: ", data);
console.log("Encoded: ", encoded);
console.log("Decoded: ", decoded);
console.log(json == JSON.stringify(decoded)? "Correct": "Incorrect");
console.log("Crammed into ", Math.round(encoded.length * 10000 / json.length)/100 + '% of URL encoded JSON');



