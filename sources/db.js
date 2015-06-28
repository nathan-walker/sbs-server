var mongoose = require('mongoose');
var nconf = require('nconf');
mongoose.connect('mongodb://'+nconf.get('database:url')+'/'+nconf.get('database:db'));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('connected to db');
});

module.exports = db;