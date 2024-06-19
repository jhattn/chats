require('dotenv').config();
const dbmigrate = require('db-migrate');

const dbmigrateInstance = dbmigrate.getInstance(true);
dbmigrateInstance.up();
