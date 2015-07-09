var walk = require('walk');
var fs = require('fs');
var path = require('path');
var mmd = require('mmd');
var moment = require('moment');

var getMultimarkdownData = function(source) {
	var data = {};
	var keys = mmd.extractMetadataKeys(source);
	
	keys.forEach(function(key) {
		var value = mmd.extractMetadataValue(source, key);
		if (value.length === 0) {
			return;
		}
		
		if (value.length === 1) {
			data[key] = value[0];
			return;
		}
		
		data[key] = value;
	});

	data.body = mmd.convert(source);
	return data;
};

var walker = walk.walk(path.resolve('./posts'), {
	followLinks: false
});

var entries = {};
var last30Days = [];
var tags = {};
var years = {};
var unpublished = [];

var addPostToTag = function(tag, post) {
	if (typeof tags[tag] === 'object') {
		tags[tag].push(post);
	} else {
		tags[tag] = [post];
	}
	return;
};

var fileHandler = function(root, fileStat, next) {
	fs.readFile(path.resolve(root, fileStat.name),
		{ encoding: 'utf8' },
		function(err, data) {
			var post = getMultimarkdownData(data);
			post.published = Number(post.published);
			
			// Add to entries list
			entries[post.slug] = post;
			
			// If unpublished, set aside for now
			if (post.published > latestTime) {
				unpublished.push(post);
				next();
				return;
			}
			
			// If a page, we're done here
			if (post.type === 'Page') {
				return;
			}
			
			// Add to tags list(s)
			if (typeof post.tags === 'object') {
				post.tags.forEach(function(tag) {
					addPostToTag(tag, post);
				});
			} else if (typeof post.tags === 'string') {
				addPostToTag(post.tags, post);
			}
			
			// Add to recent entries list if needed
			var earliestTime = moment().subtract(30, 'days').valueOf();
			var latestTime = moment().valueOf();
			
			if (post.published >= earliestTime && post.published <= latestTime) {
				last30Days.push(post);
			}
			
			// Add to individual month archives
			var publishedDate = moment(post.published);
			var year = publishedDate.year();
			var month = publishedDate.month();
			
			if (years[year]) {
				if (years[year][month]) {
					years[year][month].push(post);
				} else {
					years[year][month] = [post];
				}
			} else {
				years[year] = {};
				years[year][month] = [post];
			}
			
			next();
		}
	);
};

walker.on("file", fileHandler);
walker.on("errors", function(root, nodeStatsArray, next) {
	nodeStatsArray.forEach(function (n) {
    console.error("[ERROR] " + n.name)
    console.error(n.error.message || (n.error.code + ": " + n.error.path));
  });
  next();
});
walker.on("end", function() {
	sortLast30Days();
	sortMonths();
	console.log(entries["a-thousand-nos"]);
	console.log(tags["force-touch"]);
	console.log(last30Days[0]);
	console.log(years["2015"]);
});

var sortLast30Days = function() {
	last30Days.sort(function(a, b) {
		return b.published - a.published;
	});
};

var forEachMonth = function(callback) {
	// Earliest year that posts can start at
	var count = 2000;
	
	for (; count <= moment().year(); count++) {
		var year = years[count];
		if (typeof year === 'object') {
			for (var month = 0; month < 12; month++) {
				if (typeof year[month] === 'object') {
					callback(year, month, year[month]);
				}
			}
		}
	}
};

var sortMonths = function() {
	forEachMonth(function(year, month, entries) {
		entries.sort(function(a, b) {
			return a.published - b.published;
		});
	});
};

// TODO: periodically clean the recents list

// TODO: periodically promote unpublished posts