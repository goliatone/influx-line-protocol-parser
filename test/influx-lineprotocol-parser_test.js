'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
sinon.assert.expose(assert, { prefix: '' });

var cast = require('../lib').cast;
var parse = require('../lib').parse;
var lineToJSON = require('../lib');


describe('Influx Line Protocol Parser', function(){
    describe('lineToJSON', function(){
        it('should handle Buffer', function(){
            var expected = {
                measurement: 'access_granted.ny22_unique.1h',
                timestamp: 1470934800000000000,
                fields: [{
                    members: 2
                }],
                tags:[]
            };

            var buffer = new Buffer('access_granted.ny22_unique.1h members=2i 1470934800000000000');
            var paylod = lineToJSON(buffer);

            assert.deepEqual(paylod, expected);
        });

        it('should handle empty strings', function(){
            var expected = {};

            var buffer = new Buffer('');
            var paylod = lineToJSON(buffer);

            assert.deepEqual(paylod, expected);
        });
    });

    describe('parse', function(){
        it('should parse a line point as expected', function(){

            var expected = {
                measurement: 'access_granted.ny22_unique.1h',
                timestamp: 1470934800000000000,
                fields: [{
                    members: 2
                }],
                tags:[]
            };

            var paylod = parse('access_granted.ny22_unique.1h members=2i 1470934800000000000');

            assert.deepEqual(paylod, expected);
        });

        it('should parse a line point as expected', function(){

            var expected = {
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
            };

            var paylod = parse('cpu_load_short,direction=in,host=server01,region=us-west value=2.0 1422568543702900257');

            assert.deepEqual(paylod, expected);
        });

        xit('tag value with spaces', function(){
            var expected = {
                measurement: 'cpu_load_short',
                timestamp: undefined,
                fields: [],
                tags:[
                    {direction: 'in'},
                    {host: 'server01'},
                    {region: 'us-west'},
                ]
            };

            var paylod = parse('cpu,host=server\ A,region=us\ west');

            assert.deepEqual(paylod, expected);
        });

        xit('measurement with commas "cpu\\,01,host=serverA,region=us-west"', function(){
            var expected = {
                measurement: 'cpu,01',
                // timestamp: undefined,
                fields: [],
                tags:[
                    {host: 'serverA'},
                    {region: 'us-west'},
                ]
            };

            var paylod = parse('cpu\,01,host=serverA,region=us-west');
            console.log(paylod);
            assert.deepEqual(paylod, expected);
        });

        xit('measurement and tags', function(){
            var expected = {
                measurement: 'cpu_load_short',
                // timestamp: undefined,
                fields: [],
                tags:[
                    {direction: 'in'},
                    {host: 'server01'},
                    {region: 'us-west'},
                ]
            };

            var paylod = parse('cpu,host=serverA,region=us-west');

            assert.deepEqual(paylod, expected);
        });
    });

    describe('cast', function(){

        it('should cast "23i" to 23', function(){
            assert(cast('23i') === 23);
        });

        it('should cast "string" to a string.', function(){
            assert(cast('"string"') === 'string');
        });

        it('should cast "This is a string" to a string.', function(){
            assert(cast('"This is a string"') === 'This is a string');
        });

        it('should cast "string" to a string.', function(){
            assert(cast('"\"string\""') === '"string"');
        });

        it('should cast "3.141592653589793"', function(){
            assert(cast('3.141592653589793') === 3.141592653589793);
        });

        it('should cast "t" to true', function(){
            assert(cast('t') === true);
        });

        it('should cast "T" to true', function(){
            assert(cast('T') === true);
        });

        it('should cast "True" to true', function(){
            assert(cast('True') === true);
        });

        it('should cast "true" to true', function(){
            assert(cast('true') === true);
        });

        it('should cast "TRUE" to true', function(){
            assert(cast('TRUE') === true);
        });

        it('should cast "f" to false', function(){
            assert(cast('f') === false);
        });

        it('should cast "F" to false', function(){
            assert(cast('F') === false);
        });

        it('should cast "False" to false', function(){
            assert(cast('False') === false);
        });

        it('should cast "FALSE" to false', function(){
            assert(cast('FALSE') === false);
        });

        it('should cast "false" to false', function(){
            assert(cast('false') === false);
        });
    });
});
