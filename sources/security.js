var speakeasy = require('speakeasy');
var nconf = require('nconf');
var moment = require('moment');

var keys = nconf.get('security');

var digitalRoot = function(number) {
	var stringForm = String(number);
	
	if (stringForm.length === 1) {
		return number;
	}
	
	var chars = stringForm.split("");
	var sum = 0;
	chars.forEach(function(char) {
		sum += Number(char);
	});
	
	return digitalRoot(sum);
};

var currentKey = function() {
	var date = moment().date();
	return keys[digitalRoot(date)];
};

module.exports = function(key, code) {
	var keyResult = key === currentKey();
	var codeResult = code === speakeasy.time({ key: keys.authenticator, encoding: "base32" });
	
	if (keyResult === true && codeResult === true) {
		return true;
	} else {
		return false;
	}
};