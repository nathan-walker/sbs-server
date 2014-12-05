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
var fs = require('fs');
var path = require('path');
var gm = require('gm');
var foursquareConfig = {
	'secrets': {
		'clientId': nconf.get('foursquare:client-id'),
		'clientSecret': nconf.get('foursquare:client-secret'),
		'redirectUrl': "http://nwalker.org"
	}	
};
console.log(foursquareConfig);
var foursquare = require('node-foursquare')(foursquareConfig);

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

router.use(session({ secret: "keyboard cat" }));
router.use(passport.initialize());
router.use(passport.session());
router.use(function(req, res, next) {
	if (req.url !== '/login') {
		if (!req.user) {
			res.redirect('/admin/login');
		} else {
			next();
		}
	} else {
		next();
	}
})

router.post('/login', passport.authenticate('local', {
	successRedirect: '/admin',
	failureRedirect: '/admin/login'
}));

router.get('/login', function(req, res) {
	if (req.user) {
		console.log("hello");
		res.redirect('/admin');
	} else {
		res.render('login');
	}
});

/* GET home page. */
router.get('/', function(req, res) {
	res.render('admin-index', { user: req.user });
});

/* New posts */

router.post('/new', function(req, res){
	var info = req.body;
	console.log(info);
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
	
	if (!info.publishDate) {
		newPost.published = Date.now();
	}
	
	if (!info.slug) {
		if (info.title) {
			newPost.slug = slug(info.title).toLowerCase();
		} else {
			newPost.slug = (newPost.type + '-' + moment(newPost.published).unix()).toLowerCase();
		}
	}
	
	if (!info.title) {
		newPost.title = newPost.type + ' from ' + moment(newPost.published).format(nconf.get('date-format'));
	}
	
	newPost.addTags(info.tags, function() {
		newPost.post(function(err, post) {
			if (err) {
				console.log(err);
				res.status(500).end();
			} else {
				res.redirect('/admin');
			}
		});
	});
	
});

router.post('/uploadfile', function(req, res) {
	var fileStream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		var webAddress = '/images/uploads/uploaded-' + moment().unix() + '-' + filename;
		var fileAddress = '/public' + webAddress;
		var newFilePath = path.resolve('./' + fileAddress);
		console.log("Uploading" + filename);
		fileStream = fs.createWriteStream(newFilePath);
		file.pipe(fileStream);
		fileStream.on('close', function() {
			gm(newFilePath).autoOrient().resize(768).write(newFilePath, function(err) {
				res.send(nconf.get('base-url') + webAddress);
			});
		});
	});
});

router.get('/nearby/:lat/:lng', function(req, res) {
	foursquare.Venues.search(req.params.lat, req.params.lng, null, { limit: 5 }, null, function(err, results) {
		res.send(results);
	});
});

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
