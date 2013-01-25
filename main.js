#!/usr/bin/env node

/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true, Backbone:true, _:true, XM:true, XT:true*/

Backbone = require("backbone");
_ = require("underscore");

(function () {
  "use strict";

  var options = require("./lib/options"),
    schema = false,
    privs = false,
    sessionObjectLoaded,
    schemaOptions = {},
    privsOptions = {};

  // include the X framework
  require("xt");

  // This should be coming from node-xt...
  X.relativeDependsPath = "";
  X.depends = function () {
    var dir = X.relativeDependsPath,
      files = X.$A(arguments),
      pathBeforeRecursion;

    _.each(files, function (file) {
      if (X.fs.statSync(X.path.join(dir, file)).isDirectory()) {
        pathBeforeRecursion = X.relativeDependsPath;
        X.relativeDependsPath = X.path.join(dir, file);
        X.depends("package.js");
        X.relativeDependsPath = pathBeforeRecursion;
      } else {
        require(X.path.join(dir, file));
      }
    });
  };

  // Other xTuple libraries
  require("backbone-relational");
  X.relativeDependsPath = X.path.join(X.basePath, "node_modules/tools/source");
  require("tools");
  X.relativeDependsPath = X.path.join(X.basePath, "node_modules/backbone-x/source");
  require("backbone-x");
  Backbone.XM = XM;

  // Argh!!! Hack because `XT` has it's own string format function that
  // is incompatible with `X`....
  String.prototype.f = function () {
    return X.String.format.apply(this, arguments);
  };

  // Another hack: quiet the logs here
  XT.log = function () {};

  // make absolutely sure we're going to start
  options.autoStart = true;

  //X.debugging = true;

  // set the options
  X.setup(options);


  // initiate the internal session then start
  sessionObjectLoaded = function () {
    if (schema && privs) {

      // Start polling for expired user sessions
      X.cachePollingInterval = setInterval(X.Session.pollCache, 10000);
      X.addCleanupTask(function () {
        clearInterval(X.cachePollingInterval);
      });
    }
  };
  schemaOptions.success = function () {
    schema = true;
    sessionObjectLoaded();
  };
  privsOptions.success = function () {
    privs = true;
    sessionObjectLoaded();
  };
  privsOptions.username = X.options.globalDatabase.nodeUsername;

  XT.session = Object.create(XT.Session);
  XT.session.loadSessionObjects(XT.session.SCHEMA, schemaOptions);
  XT.session.loadSessionObjects(XT.session.PRIVILEGES, privsOptions);

}());
