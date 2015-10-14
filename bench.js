var juri = require("./juri.js")(),
	i,
	obj = { id: 42, name: "Somebody", email: [
		"hello@there.com", "what@else.com"
	], params: { role: "follower", status: "online" } },
	jstr = juri.encode(obj),
	json = JSON.stringify(obj),
	t;


t = process.hrtime();
for (i = 0; i < 10000; i++) {
	jstr = juri.encode(obj);
}
console.log("Juri encode", process.hrtime(t));

t = process.hrtime();
for (i = 0; i < 10000; i++) {
	obj = juri.decode(jstr);
}
console.log("Juri decode", process.hrtime(t));

t = process.hrtime();
for(i = 0; i < 10000; i++) {
	json = JSON.stringify(obj);
}
console.log("JSON encode", process.hrtime(t));

t = process.hrtime();
for(i = 0; i < 10000; i++) {
	obj = JSON.parse(json);
}
console.log("JSON decode", process.hrtime(t));
