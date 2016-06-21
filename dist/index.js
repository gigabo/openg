'use strict';
require('babel-register')({
  ignore: false
});
var opn = require('opn');
var shelljs = require('shelljs');
var npmName = require('npm-name');
var packageJson = require('package-json');
require('babel-polyfill');

module.exports = function () {
  var packages = Array.prototype.slice.call(arguments);
  if (packages.length === 0) {
    // if it's a git repo
    var revParse = shelljs.exec('git rev-parse --show-toplevel', { silent: true });
    if (revParse.code === 0) {
      var splitRevParse = revParse.stdout.split('/');
      packages = [splitRevParse[splitRevParse.length - 1].trim()];
    } else {
      throw new Error('Specify one or more npmjs arguments, none found');
    }
  }

  return Promise.all(packages.map(function (myPackage) {
    // return packages.map(myPackage => {
    myPackage = myPackage.toLowerCase();
    return npmName(myPackage).then(function (available) {
      // return available;
      if (available) {
        throw new Error('package ' + myPackage + ' not found');
      } else {
        packageJson(myPackage, 'latest').then(function (json) {
          if (json.homepage) {
            opn(json.homepage, { wait: false });
            return myPackage;
          }
          throw new Error('homepage not found in package.json of module "' + myPackage + '"');
        });
      }
    })['catch'](function (err) {
      throw err;
    });
  }));
};
