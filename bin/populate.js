#!/usr/bin/env node
/** e2e.t — end-to-end test */
/* globals describe, it, before, after */

"use strict";
var fs       = require('fs'),
    path     = require('path'),
    log4js   = require('Log4js'),
    Importer = require('../lib/Importer.js'),
    Torrent  = require('../lib/Torrent.js'),
    sqlite3  = require('sqlite3').verbose(),

    FULL_TEST = false
;

log4js.replaceConsole();
var path = 'torrents.db';
var db = new sqlite3.Database( path );
db.serialize(function() {
    Torrent.createSchema(db);
});
var importer = new Importer({
    katCsv: 'full_torrents.csv',
    db: db
});
importer.loadTorrentsFromCSV( function (){
    console.info( path.resolve(path) );
});

