#!/usr/bin/env node
/** e2e.t — end-to-end test */
/* globals describe, it, before, after */

"use strict";
var path          = require('path'),
    log4js        = require('Log4js'),
    Importer      = require('../lib/Importer.js'),
    Torrent       = require('../lib/Torrent.js'),
    sqlite3       = require('sqlite3').verbose(),
    elasticsearch = require('elasticsearch'),
    config        = require('../package.json')
;

log4js.replaceConsole();
var path = 'torrents.db';
var db = new sqlite3.Database( path );
var client = new elasticsearch.Client({
    host: 'localhost:'+config.elasticsearch.port,
    log: 'trace',
    apiVersion: "2.1"
});

db.serialize(function() {
    Torrent.createSchema(db);
});
var importer = new Importer({
    db: db,
    katCsv: 'full_torrents.csv',
    elasticsearch: client
});
importer.loadTorrentsFromCSV( function (){
    console.info( path.resolve(path) );
});

