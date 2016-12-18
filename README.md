# mongoose-keywords

[![JS Standard Style][standard-image]][standard-url]
[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]

> Mongoose plugin that recursively generates keywords for documents based on its fields

## Install

```sh
npm install --save mongoose-keywords
```

## Usage

### Single path
```js
var mongoose = require('mongoose');

var ArtistSchema = new mongoose.Schema({
  name: String
});

ArtistSchema.plugin(require('mongoose-keywords'), {paths: ['name']});

var Artist = mongoose.model('Artist', ArtistSchema);

var artist = new Artist({name: "L'arc~en~Ciel"});
console.log(artist.keywords); // ['larc en ciel']
```

### Multiple path
```js
var ArtistSchema = new mongoose.Schema({
  name: String,
  genre: String
});

ArtistSchema.plugin(require('mongoose-keywords'), {paths: ['name', 'genre']});

var Artist = mongoose.model('Artist', ArtistSchema);

var artist = new Artist({name: "L'arc~en~Ciel", genre: 'Jrock'});
console.log(artist.keywords); // ['larc en ciel', 'jrock']
```

### Custom `keywords` path options
You can still define a `keywords` path on your schema with predefined options.
```js
var ArtistSchema = new mongoose.Schema({
  name: String,
  keywords: {
    type: [String],
    unique: true // new custom option
  }
});

ArtistSchema.plugin(require('mongoose-keywords'), {paths: ['name']});
```

### Custom `keywords` field
```js
var ArtistSchema = new mongoose.Schema({
  name: String
});

ArtistSchema.plugin(require('mongoose-keywords'), {
  paths: ['name'],
  field: 'terms'
});

var Artist = mongoose.model('Artist', ArtistSchema);

var artist = new Artist({name: "L'arc~en~Ciel"});
console.log(artist.keywords); // undefined
console.log(artist.terms); // ['larc en ciel']
```

### Custom `transform` option
By default, `mongoose-keywords` normalizes the value, but you can provide your own transform function.
```js
var mongoose = require('mongoose');

var ArtistSchema = new mongoose.Schema({
  name: String
});

ArtistSchema.plugin(require('mongoose-keywords'), {
  paths: ['name'],
  transform: function (value) {
    return value + '!!!';
  }
});

var Artist = mongoose.model('Artist', ArtistSchema);

var artist = new Artist({name: "L'arc~en~Ciel"});
console.log(artist.keywords); // ["L'arc~en~Ciel!!!"]
```

### Nested models
```js
var mongoose = require('mongoose');
var mongooseKeywords = require('mongoose-keywords');

var GenreSchema = new mongoose.Schema({
  title: String
});
GenreSchema.plugin(mongooseKeywords, {paths: ['title']});

var ArtistSchema = new mongoose.Schema({
  name: String,
  genre: {
    type: mongoose.Schema.ObjectId,
    ref: 'Genre'
  }
});
ArtistSchema.plugin(mongooseKeywords, {paths: ['name', 'genre']});

var Genre = mongoose.model('Genre', GenreSchema);
var genre = new Genre({title: 'Jrock'});
console.log(genre.keywords); // ['jrock']

var Artist = mongoose.model('Artist', ArtistSchema);
var artist = new Artist({name: "L'arc~en~Ciel", genre: genre});
console.log(artist.keywords); // ['larc en ciel', 'jrock']
```

## License

MIT © [Diego Haz](http://github.com/diegohaz)

[standard-url]: http://standardjs.com
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

[npm-url]: https://npmjs.org/package/mongoose-keywords
[npm-image]: https://img.shields.io/npm/v/mongoose-keywords.svg?style=flat-square

[travis-url]: https://travis-ci.org/diegohaz/mongoose-keywords
[travis-image]: https://img.shields.io/travis/diegohaz/mongoose-keywords.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/diegohaz/mongoose-keywords
[coveralls-image]: https://img.shields.io/coveralls/diegohaz/mongoose-keywords.svg?style=flat-square

[depstat-url]: https://david-dm.org/diegohaz/mongoose-keywords
[depstat-image]: https://david-dm.org/diegohaz/mongoose-keywords.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/mongoose-keywords.svg?style=flat-square
