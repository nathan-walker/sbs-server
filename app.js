var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var moment = require('moment');
var hbs = require('hbs');
var multimarkdown = require('multimarkdown');
var handlebars = hbs.handlebars;

var nconf = require('nconf');
nconf.file({ file: 'config.json' });

var db = require('./sources/db.js');
require('./models.js');

/** view engine setup **/

// Loads in all of the partial templates
hbs.registerPartials(__dirname + '/views/partials');

// Makes this function easily available
var escapeString = hbs.handlebars.Utils.escapeExpression;

// A function that returns an HTML time tag
hbs.registerHelper('makeTimeTag', function(location, options) {
	var date = moment(this[location]);
	return '<time class="entry-date" datetime="' + date.toISOString() + '">' + date.format(nconf.get('date-format')) + '</time>';
});

// A function that lists tags from a post
hbs.registerHelper('tagList', function(options) {
	var listArray = [];
	this.tags.forEach(function(tag, index, array) {
		if (!tag.shadow) {
			var string = '<a href="' + nconf.get('base-url') + '/tagged/' + escapeString(tag.name) + '">' + escapeString(tag.name) + '</a>';
			listArray.push(string);
		}
	});
	return new hbs.handlebars.SafeString(listArray.join(', '));
});

// A function that returns the canonical page URL
hbs.registerHelper('pageURL', function() {
	var published = moment(this.published);
	return nconf.get('base-url') + '/' + published.format('YYYY') + '/' + published.format('MM') + '/' + this.slug;
});

// A link to an author's page
hbs.registerHelper('authorLink', function() {
	var author = this.author;
	var string = '<a href="' + nconf.get('base-url') + '/author/' + escapeString(author._id) + '">by ' + escapeString(author.displayName) + '</a>';
	return new hbs.handlebars.SafeString(string);
});

// An RFC822 publication date for RSS feeds
hbs.registerHelper('published-rfc822', function() {
	return new hbs.handlebars.SafeString(moment(this.published).format('ddd, DD MMM YYYY HH:mm:ss ZZ'));
});

// Processes text for MultiMarkdown
// Called 'marked' because that used to be the engine
// Now using node-multimarkdown
hbs.registerHelper('marked', function(options) {
	var text;
	if (options.fn(this)) {
		text = multimarkdown.convert(options.fn(this));
	} else {
		text = "";
	}
	return new hbs.handlebars.SafeString(text);
});

// Same as above, but truncated
hbs.registerHelper('markedTruncated', function(options) {
	var text = multimarkdown.convert(options.fn(this));
	var truncated = text.substr(0, text.indexOf('</p>', text.indexOf('</p>')+4)+4);
	return new hbs.handlebars.SafeString(truncated);
});

// Creates a link for a location
hbs.registerHelper('locationLink', function() {
	if (this.location.name) {
		var innerString;
		
		// Uses 'at' for specific locations and 'near' for non-specific locations
		if (this.location.specific) {
			innerString = 'at ' + this.location.name;
		} else {
			innerString = 'near ' + this.location.name;
		}
		
		var link;
		// Generates a link if coordinates are available
		if (this.location.latitude && this.location.longitude) {
			// Default level is 17
			var level = 17;
			if (!this.location.specific) {
				// Makes coordinates only to 2 decimals if non-specific
				this.location.latitude = this.location.latitude.toFixed(2);
				this.location.longitude = this.location.longitude.toFixed(2);
				// Moves level out if non-specific location
				level = 15;
			}
			link = 'http://bing.com/maps/default.aspx?cp=' + this.location.latitude + '~' + this.location.longitude + '&lvl=' + level;
		}
		var stringBeginning = '<span class="locationlink">';
		var finalString;
		
		// adds a link tag if link is available
		if (link) {
			finalString = stringBeginning + '<a href="' + link + '" target="_blank">' + innerString + '</a></span>';
		} else {
			finalString = stringBeginning + innerString + '</span>';
		}
		
		return new hbs.handlebars.SafeString(finalString);
	} else {
		// Returns a blank string if name is empty
		return '';
	}
});

// Checks if a post is a link, used with Handlebars {{#if}} tag
hbs.registerHelper('isLink', function() {
	return this.type == "Link";
});

// Brings in the special interiors for web site rendering
var fs = require('fs');
// Allows hjs files to be require()'d
require.extensions['.hjs'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

// Makes render functions for each of these templates
var postRender = handlebars.compile(require('./views/render-post.hjs'));
var linkRender = handlebars.compile(require('./views/render-link.hjs'));
var statusRender = handlebars.compile(require('./views/render-status.hjs'));
var noteRender = handlebars.compile(require('./views/render-note.hjs'));
var pageRender = handlebars.compile(require('./views/render-page.hjs'));
var photoRender = handlebars.compile(require('./views/render-photo.hjs'));

// Generic helper function for all interiors
hbs.registerHelper('postInterior', function() {
	var result;
	switch (this.type) {
	case 'Post':
		result = postRender(this);
		break;
	case 'Link':
		result = linkRender(this);
		break;
	case 'Status':
		result = statusRender(this);
		break;
	case 'Note':
		result = noteRender(this);
		break;
	case 'Page':
		result = pageRender(this);
		break;
	case 'Photo':
		result = photoRender(this);
		break;
	default:
		result = postRender(this); 
		break;
	}
	return new handlebars.SafeString(result);
});

// Special interiors for RSS feeds
var postFeedRender = handlebars.compile(require('./views/feed-post.hjs'));
var linkFeedRender = handlebars.compile(require('./views/feed-link.hjs'));
var statusFeedRender = handlebars.compile(require('./views/feed-status.hjs'));
var noteFeedRender = handlebars.compile(require('./views/feed-note.hjs'));
var photoFeedRender = handlebars.compile(require('./views/feed-photo.hjs'));

// Generic helper functions for all feed interiors
hbs.registerHelper('feedContent', function() {
	var result;
	switch (this.type) {
	case 'Post':
		result = postFeedRender(this);
		break;
	case 'Link':
		result = linkFeedRender(this);
		break;
	case 'Status':
		result = statusFeedRender(this);
		break;
	case 'Note':
		result = noteFeedRender(this);
		break;
	case 'Photo':
		result = photoFeedRender(this);
		break;
	default:
		result = postFeedRender(this); 
		break;
	}
	return new handlebars.SafeString(result);
});

// References the route files
var routes = require('./routes/index');

// Function to create an app object
var createApp = function(routes) {
	var app = express();
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'hjs');
	app.engine('hjs', hbs.__express);
	
	//Set app constants 
	app.set('site-title', nconf.get('title'));
	app.set('subtitle', nconf.get('subtitle'));
	app.set('base-url', nconf.get('base-url'));
	app.set('description', nconf.get('description'));
	app.set('language', nconf.get('language'));
	app.set('editorEmail', nconf.get('editorEmail'));
	app.set('editorName', nconf.get('editorName'));
	app.set('webmasterEmail', nconf.get('webmasterEmail'));
	app.set('webmasterName', nconf.get('webmasterName'));
	app.set('location', nconf.get('location'));
	app.set('currentYear', new Date().getFullYear())

	// Common middleware
	app.use(favicon());
	app.use(logger('dev'));
	app.use(express.static(path.join(__dirname, 'public')), {
		maxAge: 3600000
	});
	
	app.use('/', routes);
	
	/// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});
	
	/// error handlers
	
	// development error handler
	// will print stacktrace
	if (app.get('env') === 'development') {
		app.use(function(err, req, res, next) {
			res.status(err.status || 500);
			res.render('error', {
				message: err.message,
				error: err
			});
		});
	}
	
	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		if (err.status === 404) {
			res.render('404', {
				title: "404 Page Not Found"
			});
		} else {
			res.render('error', {
				message: err.message,
				error: {}
			});
		}
	});
	
	return app;
}

// Creates objects for main app and admin interface
var app = createApp(routes);

module.exports = {
	app: app
};
