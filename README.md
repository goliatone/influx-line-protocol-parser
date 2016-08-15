# Influx Line Protocol Parser

The line protocol is a text based format for writing points to InfluxDB. This library provides a simple parser to generate a JavaScript Object from a provided line.

## Getting Started
Install the module with: `npm install influx-line-protocol-parser`

## Examples

```js
var lineToJSON = require('influx-line-protocol-parser');
var line = 'cpu_load_short,direction=in,host=server01,region=us-west value=2.0 1422568543702900257';
var point = lineToJSON(line);
console.log(point);
```

```js
{
    measurement: 'cpu_load_short',
    timestamp: 1422568543702900257,
    fields: [{
        value: 2
    }],
    tags:[
        {direction: 'in'},
        {host: 'server01'},
        {region: 'us-west'},
    ]
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* 2016-08-15 v0.1.0: Initial release
* 2016-08-15 v0.2.0: Remove unused bin

## License
Copyright (c) 2016 goliatone  
Licensed under the MIT license.
