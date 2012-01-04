/*!
 * superagent - Part
 * Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./utils');
var fs = require('fs');
var path = require('path');

/**
 * Expose `Part`.
 */

module.exports = Part;

/**
 * Initialize a new `Part` for the given `req`.
 *
 * @param {Request} req
 * @param {String} name
 * @param {String|Buffer} value
 * @api public
 */
function Part(req, name, value) {
    var self = this;
    this.req = req;
    this.name = name;
    this.value = value;

    if (!req._boundary) {
        this.assignBoundary();
    }

    var headers = req._boundary + '\r\n';

    if(path.existsSync(value)) {
        var type = 'application/octet-stream';
        var data = fs.readFileSync(value);

        headers += 'Content-Disposition: form-data; name="' + self.name + '"; filename="' + path.basename(self.value) + '"\r\n' +
        'Content-Type: ' + type + '\r\n' +
        'Content-Length: ' + (data.length || 0) + '\r\n' +
        'Content-Transfer-Encoding: binary\r\n\r\n';

        req.write(headers);
        req.write(data, 'binary');
        req.write('\r\n');
    } else {
        headers += 'Content-Disposition: form-data; name="' + self.name + '"\r\n' +
        'Content-Type: text/plain\r\n' +
        'Content-Length: ' + (self.value.length || 0) + '\r\n\r\n';

        req.write(headers);
        req.write(self.value + '\r\n');
    }
}

/**
 * Assign the initial request-level boundary.
 *
 * @api private
 */

Part.prototype.assignBoundary = function(){
  var boundary = utils.uid(32);
  var type = 'multipart/form-data';

  this.req.set('Content-Type', 
    type + '; boundary=' + boundary);
  this.req._boundary = '--' + boundary;
};


/**
 * Return a new `Part`.
 *
 * @return {Part}
 * @api public
 */

Part.prototype.part = function(name, value){
  return this.req.part(name, value);
};


/**
 * End the request.
 *
 * @return {Request}
 * @api public
 */
Part.prototype.end = function(fn) {
    this.req.write(this.req._boundary + '--\r\n');
    return this.req.end(fn);
};
