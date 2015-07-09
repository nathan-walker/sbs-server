var db = require('./postsBackend');

var queue = [];
var locked = false;

var query = function(callback) {
	if (locked) {
		queue.push(callback);
	} else {
		callback();
	}
};

var findOne = function(slug, callback) {
	query(function() { callback(db.entries[slug])} );
};

var findRecent = function(callback) {
	query(function() { callback(db.recentEntries)} );
};

var findTagged = function(tag, callback) {
	query(function() { callback(db.tags[tag])} );
};

var findMonth = function(year, month, callback) {
	month = month - 1;
	query(function() { callback(db.archives[year][month]) });
};

var listMonths = function(callback) {
	query(function() { callback(db.listMonths()) });
};

var update = function() {
	if (locked) {
		return;
	}
	locked = true;
	db.update(function() {
		locked = false;
		queue.forEach(function (element) {
			element();
		});
		queue = [];
	});
};

update();

module.exports = {
	findOne: findOne,
	findRecent: findRecent,
	findTagged: findTagged,
	findMonth: findMonth,
	listMonths: listMonths,
	update: update
};