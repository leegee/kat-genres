#!/usr/bin/env node
/** Import from KAT dump */
/* globals describe, it, before, after */

"use strict";
var path          = require('path'),
    log4js        = require('Log4js'),
    Importer      = require('../lib/Importer.js'),
    Torrent       = require('../lib/Torrent.js'),
    Elasticsearch = require('../lib/Elasticsearch.js')
;

log4js.replaceConsole();
var es = new Elasticsearch();
var importer = new Importer({
    katCsv: 'full_torrents.csv',
    elasticsearch: es
});

es.setup().then( function (){
    importer.download( 'https://kat.cr/api/get_dump/daily/?userhash=93f8dba00cf1b60bf24ea03ab772dc18' );
}).then( function (){
    importer.loadTorrentsFromCSV( function (){
    });
});

