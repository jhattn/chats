'use strict';

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// Up migration: create tables
exports.up = function (db, callback) {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname + '/sqls/20240619135458-init-chats-schema-up.sql');
  fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
    if (err) return callback(err);
    db.runSql(data, callback);
  });
};

// Down migration: drop tables
exports.down = function (db, callback) {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname + '/sqls/20240619135458-init-chats-schema-down.sql');
  fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
    if (err) return callback(err);
    db.runSql(data, callback);
  });
};

exports._meta = {
  "version": 1
};
