var assert = require("assert");

var dict = [ "red", "yellow", "orange", "blue", "green", "white",
	"Asia", "North America", "South America",
	"name", "continent", "flagColors",
	"leader", "title", "term", "population", "平" ],
	kramer = require("./juri.js")(dict),
    data = {
        zh: {
            name: "China", continent: "Asia",
            flagColors: ["red", "yellow"],
            leader: { name: "习 近平-习", title: "President", term: 137 },
			population: 1434440076830
        },
        in: {
            name: "India", continent: "", a: true, b: false, c: null,
			emptyArray: [], emptyObject: {},
            flagColors: ["orange", "white", "green"],
            leader: { name: "Narendra\nModi.", undef: undefined, title: "Prime Minister", term: 119 },
			population: 1.19E9,
			nan: NaN,
			infi: Infinity,
			neginf: -Infinity,
			nul: null
        },
		array: ["asdf", [3, undefined, 4]]
    },
	encoded = kramer.encodeQString(data),
	decoded = kramer.decodeQString(encoded),
	json = JSON.stringify(data);

console.log("Original: ", data);
console.log("Encoded: ", encoded);
console.log("Decoded: ", decoded);
assert.deepEqual(data, decoded);
console.log(
	"Compressed to " +
	Math.round(encoded.length * 10000 / json.length)/100 +
	"% of plain JSON and " +
	Math.round(encoded.length * 10000 / encodeURIComponent(json).length)/100 +
	"% of URL-encoded JSON"
);
