var express = require('express');
var router = express.Router();
var nconf = require('nconf');
var mongoose = require('mongoose');
var moment = require('moment');

// GET home page
router.get('/', function(req, res) {
	// Get all posts that are not pages and are published
	mongoose.model('Post').find({ 
			type: { $ne: 'Page' },
			published: { 
				$lt: Date.now(),
				$gt: moment().subtract(30, 'days').toDate()
			}
		}).populate('tags').populate('author').sort({ published: -1 }).exec(function(err, posts) {
			// Adds the truncate flag to all posts
			posts.forEach(function(element, index, array) {
				element.truncate = true;
			});
			res.render('index', { 
				title: "Home", 
				posts: posts
			});
	});
});

// GET rss feed
router.get('/rss', function(req, res) {
	// Get all posts that are not pages and are published
	mongoose.model('Post').find({
			type: { $ne: 'Page' },
			published: { 
				$lt: Date.now(),
				$gt: moment().subtract(30, 'days').toDate()
			}
		}).populate('tags').populate('author').sort({ published: -1 }).exec(function(err, posts) {
			// Adds the link flag to all links
			posts.forEach(function(element, index, array) {
				if (element.type === 'Link') {
					element.isLink = true;
				}
			});
			res.header("Content-Type", "application/rss+xml");
			res.render('feed', {
				posts: posts,
				publishedDate: moment(posts[0].published).format('ddd, DD MMM YYYY HH:mm:ss ZZ')
			});
	});
});

// GET Archive List
var archiveOptions = {};
archiveOptions.map = function() {
	emit({ month: this.published.getMonth() + 1, year: this.published.getFullYear()}, 1);
};

archiveOptions.reduce = function(keyMonth, values) {
	return values.length;
};

router.get('/archive', function(req, res) {
	mongoose.model('Post').mapReduce(archiveOptions, function(err, results) {
		results.sort(function(a, b) {
			if (a._id.year > b._id.year) {
				return 1;
			}
			if (a._id.year < b._id.year) {
				return -1;
			}
			if (a._id.month > b._id.month) {
				return 1;
			}
			if (a._id.month < b._id.month) {
				return -1;
			}
			return 0;
		});
		results.forEach(function(element, index, array) {
			element.string = moment(element._id.year + " " + element._id.month, "YYYY M").format("MMMM YYYY");
			if (element._id.month < 10) {
				element._id.month = "0" + element._id.month;
			} else {
				element._id.month = String(element._id.month);
			}
		});
		res.render('archive', {
			title: "Archive",
			months: results
		});
	});
});

// GET archive months
router.get('/archive/:year/:month', function(req, res) {
	var startDate = moment(req.params.year+"-"+req.params.month+"-01");
	var endDate = moment(startDate).endOf('month');
	mongoose.model('Post').find({
		type: { $ne: 'Page' },
		published: { 
			$gte: startDate.toDate(),
			$lte: endDate.toDate()
		}
	}).populate('tags').populate('author').sort({ published: 1 }).exec(function(err, posts) {
		// Adds the truncate flag to all posts
		posts.forEach(function(element, index, array) {
			element.truncate = true;
		});
		res.render('tagged', {
			title: "Archive: " + startDate.format('MMMM YYYY'),
			posts: posts
		});
	});
});

// GET post page
router.get('/:year/:month/:slug', function(req, res, next) {
	// find post by slug that is published
	mongoose.model('Post').find(
		{ 
			slug: req.params.slug,
			published: { $lt: Date.now() }
		}
	).populate('tags').populate('author').limit(1).exec(function(err, posts) {
		if (posts[0]) {
			if (posts[0].type == 'Page') {
				res.redirect(301, '/'+req.params.slug);
			} else {
				res.render('post', posts[0]);
			}
		} else {
			res.status(404);	
			next();
		}
	});
});

// GET author page
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

// GET tag list page
router.get('/tagged/:tag', function(req, res) {
	mongoose.model('Tag').find(
		{
			name: req.params.tag
		}
	).exec(function(err, tags) {
		if (tags) {
			mongoose.model('Post').find(
				{ 
					tags: tags[0]._id
				}
			).populate('tags').populate('author').exec(function(err, posts) {
				// Adds the truncate flag to all posts
				posts.forEach(function(element, index, array) {
					element.truncate = true;
				});
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

// Get special pages
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
			// See if a page is designed as a redirect
			if (posts[0].linksTo) {
				res.redirect(301, posts[0].linksTo)
			} else {
				res.render('post', posts[0]);
			}	
		}
	});
});

module.exports = router;
