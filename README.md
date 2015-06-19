kramer
======

Compresses JSON objects into compact, human readable, URL-safe strings

![The Kramer](http://i.imgur.com/FlT7iIc.jpg)

Kramer is exported as a CommonJS module. For use on the client, use browserify.

Example
-------

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

Kramer encodes this as a safe URI Component (`kramer.encode(object)`):

```
(zh:(name:China,continent:Asia,flagColors:(red,yellow),leader:(name:'4vW_8@H5vp~F4vW',title:President,term:+29),population:+29+7),in:(name:India,continent:'',a:++,b:--,c:+-,emptyArray:(),emptyObject:(:),flagColors:(orange,white,green),leader:(name:Narendra~1Modi.,title:Prime_Minister,term:+1t),population:+1t+7)&array=(asdf,(+3,+4)))
```

or as a query string (`kramer.encodeQString(object)`):

```
zh=(name:China,continent:Asia,flagColors:(red,yellow),leader:(name:'4vW_8@H5vp~F4vW',title:President,term:+29),population:+29+7)&in=(name:India,continent:'',a:++,b:--,c:+-,emptyArray:(),emptyObject:(:),flagColors:(orange,white,green),leader:(name:Narendra~1Modi.,title:Prime_Minister,term:+1t),population:+1t+7)&array=(asdf,(+3,+4))
```

which are around 55% smaller than the URL-encoded JSON.

A dictionary of up to 64 commonly repeated strings (e.g. key names, enum values, or even commonly repeated words) can be passed to the encoder and decoder to compress even further.

For example,

```javascript
<<<<<<< HEAD
[ "red", "yellow", "orange", "blue", "green", "white",
	"Asia", "North America", "South America",
	"name", "continent", "flagColors",
	"leader", "title", "term", "population", "平" ]
```

`kramer.encodeQString(dictionary)` gives:

```
zh=(n*:China,c*:A*,f*:(r*,y*),l*:(n*:'4vW_8@H0*~F4vW',t*:President,e*:+29),p*:+29+7)&in=(n*:India,c*:'',a:++,b:--,c:+-,emptyArray:(),emptyObject:(:),f*:(o*,w*,g*),l*:(n*:Narendra~1Modi.,t*:Prime_Minister,e*:+1t),p*:+1t+7)&array=(asdf,(+3,+4))
```

It’s still somewhat human readable: n* is name, c* is country etc. This example is compressed to almost 30% of the size of URL-encoded JSON. YMMV.
