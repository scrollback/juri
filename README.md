juri
====

Compresses JSON objects into compact, human readable, juri-safe strings

Juri is exported as a CommonJS module. For use on the client, use browserify.

Installation
------------

```
npm install juri
```

Example
-----

Say you have data like this:

```javascript
{ zh: 
   { name: 'China',
     continent: 'Asia',
     flagColors: [ 'red', 'yellow' ],
     leader: { name: '习 近平-习', title: 'President', term: 137 },
     population: 1370000000 },
  in: 
   { name: 'India',
     continent: '',
     a: true,
     b: false,
     c: null,
     emptyArray: [],
     emptyObject: {},
     flagColors: [ 'orange', 'white', 'green' ],
     leader: { name: 'Narendra\nModi.', title: 'Prime Minister', term: 119 },
     population: 1190000000 },
  array: [ 'asdf', [ 3, 4 ] ] }
```

Encode this using juri:

```
var juri = require("juri")();

juri.encode(object);
```

to get a string like:

```
(zh:(name:China,continent:Asia,flagColors:(red,yellow),leader:(name:'4vW_8@H5vp~F4vW',title:President,term:+29),population:+29+7),in:(name:India,continent:'',a:++,b:--,c:+-,emptyArray:(),emptyObject:(:),flagColors:(orange,white,green),leader:(name:Narendra~1Modi.,title:Prime_Minister,term:+1t),population:+1t+7)&array=(asdf,(+3,+4)))
```

or as a query string (`juri.encodeQString(object)`):

```
zh=(name:China,continent:Asia,flagColors:(red,yellow),leader:(name:'4vW_8@H5vp~F4vW',title:President,term:+29),population:+29+7)&in=(name:India,continent:'',a:++,b:--,c:+-,emptyArray:(),emptyObject:(:),flagColors:(orange,white,green),leader:(name:Narendra~1Modi.,title:Prime_Minister,term:+1t),population:+1t+7)&array=(asdf,(+3,+4))
```

which are around 55% smaller than the equivalent URL-encoded JSON.

A dictionary of up to 64 commonly repeated strings (e.g. key names, enum values, or even commonly repeated words) can be passed to the encoder and decoder to compress even further, at the cost of reduced human-readability.

For example,

```javascript
var dictionary = [
	"red", "yellow", "orange", "blue", "green", "white",
	"Asia", "North America", "South America",
	"name", "continent", "flagColors",
	"leader", "title", "term", "population", "平" ];
	
var juri = require("juri")(dictionary);

juri.encodeQString(object);
```

This gives:

```
zh=(n*:China,c*:A*,f*:(r*,y*),l*:(n*:'4vW_8@H0*~F4vW',t*:President,e*:+29),p*:
+29+7)&in=(n*:India,c*:'',a:++,b:--,c:+-,emptyArray:(),emptyObject:(:),f*:(o*,
w*,g*),l*:(n*:Narendra~1Modi.,t*:Prime_Minister,e*:+1t),p*:+1t+7)&array=(asdf,
(+3,+4))
```

It’s still somewhat human readable: n* is name, c* is country etc. This example was compressed to almost 30% of the size of URL-encoded JSON.

Differences from Rison
----------------------

The motivation behind Juri is the same as that behind [Rison](/Nanonid/rison), and it also uses the characters `(:,)`, but improves upon it in many ways.

- Strings are unquoted and encoded efficiently. Spaces are replaced with underscores
  (not `%20`), punctuation uses two-byte escape sequences instead of 3-byte percent
  encoding, and runs of non-latin characters are encoded with modified Base64 which
  takes about 40% less space than percent-encoding.

- Numbers are encoded with modified Base64 alphabet whose first 16 characters are
  0-9 and A-F. This keeps small numbers human readable while large ones (like
  timestamps) are encoded efficiently. All numbers are prefixed with a sign
  (`+` or `-`) and use exponent notation where it's shorter.

- Juri does not require special markers like `!(...)` to distinguish between
  objects and arrays; this saves characters in deeply nested structures and
  is more readable.
