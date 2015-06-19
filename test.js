var dict = [ "red", "blue", "green", "white",
	"Asia", "North America", "South America",
	"name", "continent", "flagColors",
	"leader", "title", "term", "平" ],
	kramer = require("./k2.js")(dict),
    data = {
        zh: {
            name: "China", continent: "Asia",
            flagColors: ["red", "yellow"],
            leader: { name: "Xi Jinping (习 近.平习)", title: "President", term: 137 },
			population: 1.37E9
        },
        in: {
            name: "India", continent: "", a: true, b: false, c: null,
			emptyArray: [], emptyObject: {},
            flagColors: ["orange", "white", "green"],
            leader: { name: "Narendra\nModi.", title: "Prime Minister", term: 119 },
			population: 1.19E9
        },
		array: ["asdf", [3, 4]]
    },
	encoded = kramer.encodeQString(data),
	decoded = kramer.decodeQString(encoded),
	json = JSON.stringify(data);

console.log("Original: ", data);
console.log("Encoded: ", encoded);
console.log("Decoded: ", decoded);
console.log(json == JSON.stringify(decoded)? "Correct": "Incorrect");
console.log("Crammed into ", Math.round(encoded.length * 10000 / json.length)/100 + "% of URL encoded JSON");



