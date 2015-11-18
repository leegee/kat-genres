#!/usr/bin/env node
/** Import from KAT dump */
/* globals describe, it, before, after */

"use strict";
var path          = require('path'),
    log4js        = require('Log4js'),
    Importer      = require('../lib/Importer.js'),
    Torrent       = require('../lib/Torrent.js'),
    sqlite3       = require('sqlite3').verbose(),
    Elasticsearch = require('../lib/Elasticsearch.js')
;

log4js.replaceConsole();
var db = new sqlite3.Database( 'torrents.db' );
var es = new Elasticsearch();
var importer = new Importer({
    db: db,
    katCsv: 'full_torrents.csv',
    elasticsearch: es
});

db.serialize(function() {
    Torrent.createSchema(db);
});

es.setup().then( function (){
    importer.download( 'http://lee/dailydump.txt.gz' );
}).then( function (){
    importer.loadTorrentsFromCSV( function (){
        console.info( path.resolve(path) );
    });
});

