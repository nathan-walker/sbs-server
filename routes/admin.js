var express = require('express');
var session = require('express-session');
var router = express.Router();
var nconf = require('nconf');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Post = mongoose.model('Post');
var moment = require('moment');
var slug = require('slug');

// File setup for uploads
var fs = require('fs');
var path = require('path');
var gm = require('gm');

// Foursquare setup for location lookup
var foursquareConfig = {
	'secrets': {
		'clientId': nconf.get('foursquare:client-id'),
		'clientSecret': nconf.get('foursquare:client-secret'),
		'redirectUrl': "http://nwalker.org"
	}	
};
var foursquare = require('node-foursquare')(foursquareConfig);

// Creates a strategy for passport
passport.use(new LocalStrategy(
	function(username, password, done) {
		mongoose.model('User').findOne({ _id: username}, function(err, user) {
			if (err) {return done(err);}
			if (!user) {
				return done(null, false, { message: 'Incorrect username.' });
			}
			user.validPassword(password, function(err, result) {
				if (err) {return done(err);}
				if (!result) {
					return done(null, false, { message: 'Incorrect password.' });
				}
				return done(null, user);
			});
		});
	}
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  mongoose.model('User').findById(id, function(err, user) {
    done(err, user);
  });
});

// Enables the use of sessions
router.use(session({ 
	secret: nconf.get('cookieSecret'),
	resave: false,
	saveUninitialized: false 
}));
router.use(passport.initialize());
router.use(passport.session());

// If the user is not logged in, redirect to admin login page
router.use(function(req, res, next) {
	if (req.url !== '/login') {
		if (!req.user) {
			res.redirect('/login');
		} else {
			next();
		}
	} else {
		next();
	}
});

// Establishes login form action
router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login'
}));

// Login page, redirects to home if already logged in
router.get('/login', function(req, res) {
	if (req.user) {
		res.redirect('/');
	} else {
		res.render('login');
	}
});

// Index page
router.get('/', function(req, res) {
	res.render('admin-index', { user: req.user });
});

// Lists all posts 
router.get('/all-posts', function(req, res) {
	Post.find().sort({ published: -1 }).exec(function(err, posts) {
		res.render('admin-all-posts', { 
			posts: posts
		});
	});
});

// Form action for new posts
router.post('/new', function(req, res){
	var info = req.body;
	
	// Converts coordinates from strings to numbers 
	if (info.latitude) {
		info.latitude = Number(info.latitude);
	}
	if (info.longitude) {
		info.longitude = Number(info.longitude);
	}
	
	var newPost = new Post({
		title: info.title,
		body: info.content,
		published: moment(info.publishDate, 'D MMM YYYY').toDate(),
		author: req.user._id,
		linksTo: info.linksTo,
		type: info.category,
		slug: info.slug,
		location: {
			latitude: info.latitude,
			longitude: info.longitude,
			name: info.locationName,
			specific: info.specificLocation
		},
		sourceLink: info.sourceLink,
		imageURL: info.photoURL
	});
	
	// Make date now if not specified
	if (!info.publishDate) {
		newPost.published = Date.now();
	}
	
	// Auto-generates a slug if one is not given
	if (!info.slug) {
		if (info.title) {
			newPost.slug = slug(info.title).toLowerCase();
		} else {
			newPost.slug = (newPost.type + '-' + moment(newPost.published).unix()).toLowerCase();
		}
	}
	
	// Auto-generates a title if one is not specified
	if (!info.title) {
		newPost.title = newPost.type + ' from ' + moment(newPost.published).format(nconf.get('date-format'));
	}
	
	// Adds tags to the post
	newPost.addTags(info.tags, function() {
		newPost.post(function(err, post) {
			if (err) {
				console.log(err);
				res.status(500).end();
			} else {
				res.redirect('/');
			}
		});
	});	
});

// File upload action
router.post('/uploadfile', function(req, res) {
	var fileStream;
	// Pipes in the upload
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		var webAddress = '/images/uploads/uploaded-' + moment().unix() + '-' + filename;
		var fileAddress = '/public' + webAddress;
		var newFilePath = path.resolve('./' + fileAddress);
		fileStream = fs.createWriteStream(newFilePath);
		file.pipe(fileStream);
		fileStream.on('close', function() {
			// Auto-rotates the image and sizes it properly
			gm(newFilePath).autoOrient().resize(768).write(newFilePath, function(err) {
				res.send(nconf.get('base-url') + webAddress);
			});
		});
	});
});

// Finds nearby venues at a place
router.get('/nearby/:lat/:lng', function(req, res) {
	foursquare.Venues.search(req.params.lat, req.params.lng, null, { limit: 5 }, null, function(err, results) {
		res.send(results);
	});
});

// Delete a post
router.post('/delete', function(req, res) {
	if (req.body.id) {
		Post.find({ _id: req.body.id }).remove().exec(function() {
			res.status(204).end();
		});
	}
});

/** Create forms **/
router.get('/new/post', function(req, res) {
	res.render('admin-new-post');
});

router.get('/new/status', function(req, res) {
	res.render('admin-new-status');
});

router.get('/new/link', function(req, res) {
	res.render('admin-new-link');
});

router.get('/new/page', function(req, res) {
	res.render('admin-new-page');
});

router.get('/new/note', function(req, res) {
	res.render('admin-new-note');
});

router.get('/new/photo', function(req, res) {
	res.render('admin-new-photo');
});


module.exports = router;
