var express = require('express');
var router = express.Router();
var nconf = require('nconf');
var mongoose = require('mongoose');
var moment = require('moment');

/* GET home page. */
router.get('/', function(req, res) {
	mongoose.model('Post').find({ type: { $ne: 'Page' }}).populate('tags').populate('author').sort({ published: -1 }).exec(function(err, posts) {
		posts.forEach(function(element, index, array) {
			element.truncate = true;
		});
		res.render('index', { 
			title: "Home", 
			posts: posts
		});
	});
});

router.get('/rss', function(req, res) {
	mongoose.model('Post').find({ type: { $ne: 'Page' }}).populate('tags').populate('author').sort({ published: -1 }).exec(function(err, posts) {
		posts.forEach(function(element, index, array) {
			element.truncate = true;
		});
		res.render('feed', {
			posts: posts,
			publishedDate: moment(posts[0].published).format('ddd, DD MMM YYYY HH:mm:ss ZZ')
		});
	});
});

router.get('/:year/:month/:slug', function(req, res) {
	mongoose.model('Post').find(
		{ 
			slug: req.params.slug,
			published: { $lt: Date.now() },
		}
	).populate('tags').populate('author').limit(1).exec(function(err, posts) {
		if (posts[0].type == 'Page') {
			res.redirect(301, '/'+req.params.slug);
		} else {
			res.render('post', posts[0]);
		}
	});
});

router.get('/author/:id', function(req, res) {
	mongoose.model('User').find({
		_id: req.params.id
	}).limit(1).exec(function(err, authors) {
		if (authors[0]) {
			authors[0].title = authors[0].displayName;
		}
		res.render('author', authors[0]);
	});
});

router.get('/tagged/:tag', function(req, res) {
	mongoose.model('Tag').find(
		{
			name: req.params.tag
		}
	).exec(function(err, tags) {
		if (tags) {
			console.log(tags[0]);
			mongoose.model('Post').find(
				{ 
					tags: { $elemMatch: { _id: tags[0]._id } }
				}
			).populate('tags').populate('author').exec(function(err, posts) {
				console.log(posts);
				res.render('tagged', {
					title: "Tagged " + req.params.tag,
					posts: posts
				});
			});
		} else {
			res.status(404);
		}
	});
});


router.get('/:slug', function(req, res, next) {
	mongoose.model('Post').find(
		{
		type: { $in: ['Page'] },
		slug: req.params.slug
		}
	).limit(1).exec(function(err, posts) {
		if (!posts[0]) {
			res.status(404);
			next();
		} else {
			if (posts[0].linksTo) {
				res.redirect(301, posts[0].linksTo)
			} else {
				res.render('post', posts[0]);
			}	
		}
	});
});

module.exports = router;
