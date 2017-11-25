# mime-to-extensions

[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][travis-image]][travis-url]

Similar to [mime-type](https://github.com/jshttp/mime-types), except for the additional functionality to list all
extensions for a give mime type (content type) via the `allExtensions` method.

## Install

```sh
$ npm install mime-to-extensions
```

## Adding Types

All mime types are based on [mime-db](https://github.com/jshttp/mime-db),
so open a PR there if you'd like to add mime types.

## API

```js
var mime = require('mime-to-extensions')
```

All functions return `false` if input is invalid or not found.

### mime.lookup(path)

Lookup the content-type associated with a file.

```js
mime.lookup('json')             // 'application/json'
mime.lookup('.md')              // 'text/x-markdown'
mime.lookup('file.html')        // 'text/html'
mime.lookup('folder/file.js')   // 'application/javascript'
mime.lookup('folder/.htaccess') // false

mime.lookup('cats') // false
```

### mime.contentType(type)

Create a full content-type header given a content-type or extension.

```js
mime.contentType('markdown')  // 'text/x-markdown; charset=utf-8'
mime.contentType('file.json') // 'application/json; charset=utf-8'

// from a full path
mime.contentType(path.extname('/path/to/file.json')) // 'application/json; charset=utf-8'
```

### mime.extension(type)

Get the default extension for a content-type.

```js
mime.extension('application/octet-stream') // 'bin'
```


### mime.allExtensions(type)

Get all the extensions for a content-type.

```js
mime.allExtensions('audio/mpeg') // ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
```

### mime.charset(type)

Lookup the implied default charset of a content-type.

```js
mime.charset('text/x-markdown') // 'UTF-8'
```

### var type = mime.types[extension]

A map of content-types by extension.

### [extensions...] = mime.extensions[type]

A map of extensions by content-type.

## License

[MIT](LICENSE)

[npm-url]: https://www.npmjs.com/package/mime-to-extensions
[node-version-image]: https://img.shields.io/node/v/mime-types.svg
[node-version-url]: https://nodejs.org/en/download/
[travis-image]: https://travis-ci.org/thihara/mime-to-extensions.svg?branch=master
[travis-url]: https://travis-ci.org/thihara/mime-to-extensions