
/** @namespace
  The filesystem module for the xt framework in node.js is
  a collection of operations that make file io more convenient
  for extensions and objects.
*/
xt.filesystem = { /** xt.filesystem.prototype */ }; xt.fs = xt.filesystem;

// Determine the base path to the current execution
// so that anything else can be resolved from this location
xt.fs.basePath = process.cwd();

xt.mixin(xt.filesystem, 
  /** @lends xt.filesystem.prototype */ {
    
  /** @private
    Reference to built-in filesystem module.
  */
  __fs__: require('fs'),
  
  /** @private
    Reference to built-in path module.
  */
  __path__: require('path'),
  
  /**
    Find and return paths to all files in a specified directory.
    Optionally an extension can be specified as the third paramater.
    The second parameter is the callback on completion. This method is
    asynchronous.
  
    @param {String} path The path to the directory.
    @param {Function} callback The callback expects a single (array) parameters of the results.
    @param {String} [extension] The file extension to look for (otherwise all file types).
  */
  directoryFiles: function(p, c, t) {
    p = this.__path__.normalize(p);
    try {
      this.__fs__.readdir(p, function(e, f) {
        c(xt.typeOf(t) === xt.t_string ? xt.fs.reduce(f, t) : f);
      })
    } catch(e) { 
      xt.warn(e); 
      c([]); 
    }
  }, 

  /**
    See Node.js documentation. Reimplements path.normalize.
  */
  normalize: function(path) {
    return this.__path__.normalize(path);
  },

  /**
    Takes what might be a very long file path and shortens it to
    a (default 3) maximum number of slashes counting from the end
    and prepends an elipses. This is strictly for aesthetic/human-
    readability purposes.

    @param {String} path The file path needing to be shortended.
    @param {Number} [max] The maximum number of slashes to include.
    @returns {String} The normalized/shortened file path.
  */
  shorten: function(path, max) {
    if(xt.none(max)) max = 3;
    if(xt.none(path) || xt.typeOf(path) !== xt.t_string) return path;

    var c = path.match(/\//g).length;

    if(!c || c <= max) return path;
    
    var f = 0,
        d = c - max,
        i = 0, t = path;

    while(f < d && !!~i) {
      i = t.indexOf('/');
      t = t.slice(i == 0 ? 1 : i);
      if(i != 0) f += 1;
    }

    return '...{path}'.f({ path: t });
  },
  
  /**
    Reads the contents of a given file and/or path. This assumes utf-8
    encoding and is asynchronous in execution.
    
    @param {String} path The path to the directory containing the file
      or the full path to the file.
    @param {String} filename The name of the file if only directory path is provided (will be normalized).
    @param {Function} callback The callback takes an error and filedata paramaters.
  */
  readFile: function(p, f, c) {
    if(xt.typeOf(f) === xt.t_function) {
      c = f;
      f = '';
    }
    p = this.__path__.join(p, f);
    try {
      var d = this.__fs__.readFile(p, 'utf-8', c)
    } catch(e) {
      xt.warn(e);
      c("");
    }
  },
  
  /**
    Splits a string into individual lines. Can be used for normal strings or
    from file data. This function is synchronous and returns an array of lines.
  
    @param {String} string The string or file data to parse.
    @returns {Array} The array of lines from the string.
  */
  byLine: function(f) {
    if(!f || f.length == 0 || xt.typeOf(f) !== xt.t_string) return [];
    return f.split('\n') || [];
  },
  
  /**
    Reduces an array of filenames to just files with the specified
    extension. This is a synchronous function.
    
    @param {Array} files The array of filenames.
    @param {String} extension The filetype extension to look for.
    @returns {Array} The array of files with the provided extension.
  */
  reduce: function(f, t) {
    if(!f || f.length < 1) return f || [];
    var i = 0,
        l = f.length,
        n = [],
        s = t.length, p;
    for(; i<l; ++i) {
      p = f[i].length - s;
      if(!!~f[i].indexOf(t) && f[i][p] == t[0]) n.push(f[i]);
    }
    return n;
  }
      
}) ;