var express = require('express');
var router = express.Router();
var nconf = require('nconf');
var moment = require('moment');

var db = require('../sources/posts');

// GET home page
router.get('/', function(req, res) {
	db.findRecent(function(posts) {
		// Adds the truncate flag to all posts
		posts.forEach(function(post) {
			post.truncate = true;
		});
		res.render('index', {
			title: "Home",
			posts: posts
		});
	});
});

// GET rss feed
router.get('/rss', function(req, res) {
	db.findRecent(function(posts) {
		// Adds the link flag to all links
		posts.forEach(function(post) {
			if (post.type === 'Link') {
				post.isLink = true;
			}
		});
		res.render('feed', {
			posts: posts,
			publishedDate: moment(posts[0].published).format('ddd, DD MMM YYYY HH:mm:ss ZZ')
		});
	});
});

// GET Archive List
router.get('/archive', function(req, res) {
	db.listMonths(function(months) {
		res.render('archive', {
			title: "Archive",
			months: months
		});
	});
});

// GET archive months
router.get('/archive/:year/:month', function(req, res) {
	db.findMonth(req.params.year, req.params.month, function(posts) {
		// Adds the truncate flag to all posts
		posts.forEach(function(element) {
			element.truncate = true;
		});
		res.render('tagged', {
			title: "Archive: " + moment(req.params.year + " " + req.params.month, "YYYY M").format("MMMM YYYY"),
			posts: posts
		});
	});
});

// GET post page
// TODO: check if post is published
router.get('/:year/:month/:slug', function(req, res, next) {
	db.findOne(req.params.slug, function(post) {
		if (post && post.published <= moment().valueOf()) {
			if (post.type == 'Page') {
				res.redirect(301, '/'+req.params.slug);
			} else {
				// Remove truncate flag
				post.truncate = false;
				res.render('post', post);
			}
		} else {
			res.status(404);	
			next();
		}
	});
});

// GET tag list page
router.get('/tagged/:tag', function(req, res, next) {
	db.findTagged(req.params.tag, function(posts) {
		if (posts) {
			// Adds the truncate flag to all posts
			posts.forEach(function(element, index, array) {
				element.truncate = true;
			});
			res.render('tagged', {
				title: "Tagged " + req.params.tag,
				posts: posts
			});
		} else {
			res.status(404);
			next();
		}
	});
});

// Secret page to force updates
var verifyUpdatePermissions = require('../sources/security');

router.get('/update/:key/:code', function(req, res) {
	if (verifyUpdatePermissions(req.params.key, req.params.code) === true) {
		db.update(function() {
			res.status(202);
			res.send("OK");
		});
	} else {
		res.redirect('/');
	}
});

// Get special pages
router.get('/:slug', function(req, res, next) {
	db.findOne(req.params.slug, function(post) {
		if (post && post.type === 'Page') {
			// See if a page is designed as a redirect
			if (post.linksto) {
				res.redirect(301, post.linksto)
			} else {
				res.render('post', post);
			}
		} else {
			res.status(404);
			next();
		}
	});
});

module.exports = router;