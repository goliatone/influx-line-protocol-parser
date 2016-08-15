/*jshint esversion:6, node:true*/
/*
 * Influx Subscriber
 * https://github.com/goliatone/influx-subscriber
 *
 * Copyright (c) 2016 goliatone
 * Licensed under the MIT license.
 */
'use strict';


/**
 * Transform a line protocol entry into JSON
 * Read more at InfluxDB [documentation][1] page.
 * [1]:https://docs.influxdata.com/influxdb/v0.13/write_protocols/write_syntax/
 *
 * The basic format is as follows:
 * ```
 * measurement[,tag_key1=tag_value1...] field_key=field_value[,field_key2=field_value2] [timestamp]
 * ```
 *
 * @param  {Buffer} point Line protocol point
 * @return {Object}       JSON representation
 */
function lineToJSON(point){

    if(point) {
        point = point.toString();
    }

    if(!point || typeof point !== 'string'){
        var error = new Error('Parser Error: invalid point format');
        if(lineToJSON.strict){
            throw error;
        }
        return {};
    }

    var out = {};

    try {
        out = parse(point);
    } catch(e){
        console.error('LineParser error');
        console.error('point: %s', point);
        console.error('error: %s', e.message);
        console.error('stack: %s', e.stack);
    }

    return out;
}

/**
 * Actual parsing of line protocol
 *
 * We have to review how we do parsing in
 * order to perperly handle non normalized
 * names or values- i.e. names with commas or
 * spaces in them or values with spaces in them.
 *
 * We could extract all key/pair values from
 * a string, and then we are left with the
 * measurement...
 * ```
 * ([a-zA-Z-\s]+=[a-zA-Z-\s]+)
 * ```
 *
 * @param  {string} point Point in line protcol
 * @return {object}       Parsed object
 */
function parse(point){
    var parts = point.split(' ');

    var measurement,
        tags = parts[0] || '',
        fields = parts[1] || '',
        timestamp = parts[2];

    function splitColon(str){
        str = str || '';
        str = str.replace(/\\/m, '#c#');
        str = str.split(',');
        str.map(function(s){
            return s.replace(/#c#/gm, ',');
        });
        return str;
    }
    tags = splitColon(tags);
    fields = splitColon(fields);

    measurement = tags.shift();

    var key, value;
    tags = tags.map(function(tag){
        key = tag.split('=')[0];
        value = tag.split('=')[1];
        var out = {};
        out[key] = value;
        return out;
    });
    tags = tags.filter(function(x){
        return x !== undefined;
    });

    fields = fields.map(function(field){
        if(!field) return undefined;
        key = field.split('=')[0];
        value = field.split('=')[1];
        var out = {};
        out[key] = cast(value);
        return out;
    });
    fields = fields.filter(function(x){
        return x !== undefined;
    });

    if(timestamp){
        timestamp = parseInt(timestamp);
    }

    var out = {
        timestamp: timestamp,
        measurement: measurement,
        fields: fields,
        tags: tags
    };

    if(!timestamp) delete out.timestamp;

    return out;
}

/**
 * Cast each element in it's equivalent
 * JS type.
 *
 * Note that for fields, without knowing
 * the type it was stored as in InfluxDB
 * we have to guess it's type.
 *
 * This can be an issue in cases where
 * we have fields that are alphanumeric
 * with a chance of having a instance
 * being all digits.
 *
 * Tags are all strings.
 *
 * @param  {Mixed} value
 * @return {Mixed}
 */
function cast(value){
    if(value === undefined) return undefined;
    /*
     * Integers: 344i
     */
    if(value.match(/^\d+i$/m)){
        value = value.slice(0, -1);
        return parseInt(value);
    }

    /* boolean true
     * t, T, true, True, or TRUE
     */
    if(value.match(/^t$|^true$/im)){
        return true;
    }

    /* boolean false
     * f, F, false, False, or FALSE
     */
    if(value.match(/^f$|^false$/im)){
        return false;
    }

    /*
     * match strings
     */
    if(value.match(/^"(.*)"$/)){
        value = value.match(/^"(.*)"$/);
        if(value.length === 2){
            return value[1];
        }
    }

    if(!isNaN(value)) return parseFloat(value);

    return undefined;

}


module.exports = lineToJSON;

module.exports.cast = cast;
module.exports.parse = parse;
