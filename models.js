var mongoose = require('mongoose');
var async = require('async');

// http://stackoverflow.com/questions/8668174/indexof-method-in-an-object-array
function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

var tagSchema = mongoose.Schema({
	name: String,
	shadow: Boolean
});

var Tag = mongoose.model('Tag', tagSchema);

var bcrypt = require('bcrypt');
var userSchema = mongoose.Schema({
	_id: String,
	passwordHash: String,
	email: String,
	firstName: String,
	lastName: String,
	displayName: String,
	description: String,
	imageURL: String
});

userSchema.methods.validPassword = function(password, callback) {
	bcrypt.compare(password, this.passwordHash, callback);
}

var User = mongoose.model('User', userSchema);

var postSchema = mongoose.Schema({
	title: String,
	slug: String,
	body: String,
	published: Date,
	type: String,
	updated: { type: Date, default: Date.now },
	linksTo: String,
	tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
	author: { type: String, ref: 'User' },
	location: {
		latitude: Number,
		longitude: Number,
		name: String,
		specific: Boolean
	},
	sourceLink: String,
	imageURL: String
});

postSchema.methods.addTag = function(name, callback) {
	var post = this;
	Tag.findOne({ name: name.toLowerCase() }, function(err, tag) {
		if (tag != undefined) {
			post.tags.push(tag._id);
			callback(err, tag);
		} else {
			tag = new Tag({ name: name.toLowerCase() });
			tag.save(function(err, tag) {
				if (err == undefined) {
					post.tags.push(tag._id);
				}
				callback(err, tag);
			});
		}
	});
};

postSchema.methods.addTags = function(tagString, callback) {
	var post = this;
	console.log(tagString);
	if (tagString) {
		console.log(tags);
		var tags = tagString.split(' ');
		async.map(tags, function(item, cb) {
			item = item.toLowerCase();
			Tag.findOne({ name: item }, function(err, tag) {
				if (tag !== undefined) {
					cb(err, tag);
				} else {
					tag = new Tag({ name: item });
					tag.save(function(err, tag) {
						console.log(err, tag);
						cb(err, tag);
					});
				}
			});
		}, function(err, results) {
			results.forEach(function(element, index, array) {
				post.tags.push(element._id);
			});
			callback(err, tags);
		});
	} else {
		callback();
	}
};

// deprecated, currently unused to my knowledge
postSchema.methods.addShadowTag = function(name, callback) {
	var post = this;
	Tag.findOne({ name: name }, function(err, tag) {
		if (tag != undefined) {
			post.tags.push(tag);
			callback(err, tag);
		} else {
			tag = new Tag({ name: name, shadow: true });
			tag.save(function(err, tag) {
				if (err == undefined) {
					post.tags.push(tag);
				}
				callback(err, tag);
			});
		}
	});
};

postSchema.methods.post = function(callback) {
	this.save(function(err, post) {
		callback(err, post);
	});
};

var Post = mongoose.model('Post', postSchema);