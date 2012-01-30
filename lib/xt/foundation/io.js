
xt.colors = require('colors');


/** xt.string.buffer */     require('./ext/string_buffer');

/** @namespace
  All functionality for input/output to logs or console reporting
  is included in this namespace. Filesystem manipulation is also
  pulled into this namespace for consistency but can also be used
  directly.
  
  This is only partially implemented but abstracted for extension.
*/

xt.io = { /** @lends xt.io */
  
  /**
    Reference to stdout.
    
    @returns {Object} Stream stdout.
  */
  out: function() { return process.stdout; },
  
  /**
    Returns a new string buffer. Since these methods may be called
    asynchronously we can never be sure who might be using a shared
    buffer so we're relying on the GC to pick-up after us.
    
    @returns {Object} A new string buffer.
  */
  buff: function() {
    return xt.string.buffer.create();
  },
  
  /**
    For general logging to console use this method. It takes
    any number of arguments and attempts to push them to the
    output buffer in some meaningful way. For objects it uses
    any `toString` method available or does not print the object.
    For debugging output (for inspection of objects) and data that
    should not display during production use `debug`.
    
    @todo This description is incomplete and so is the implementation
      as there will be an actual logger that is capable of logging to
      remote filesystems or local with log management etc.
    
    @see xt#io#debug
    @see xt#io#dev
    @see xt#io#err
    @see xt#io#warn
    
    @param {Object} [args] Any number of arguments of any type.
  */
  log: function log() {
    var a = args(),
        b = xt.io.buff();
    b .set('color', 'grey')
      .set('prefix', '<<LOG>>');
    a.unshift(b);
    xt.io.__console__.apply(this, a);   
  },
  
  /** @public
  */
  warn: function warn() {
    var a = args(),
        b = xt.io.buff();
    b .set('color', 'yellow')
      .set('prefix', '<<WARN>>');
    a.unshift(b);
    xt.io.__console__.apply(this, a);
  },
  
  /** @public
  */
  dev: function dev() {
    var a = args(),
        b = xt.io.buff();
    b .set('color', 'blue')
      .set('prefix', '<<DEV>>');
    a.unshift(b);
    xt.io.__console__.apply(this, a);    
  },
  
  /** @public
  */
  err: function err() {
    var a = args(),
        b = xt.io.buff();
    b .set('color', 'red')
      .set('prefix', '<<ERROR>>');
    a.unshift(b);
    xt.io.__console__.apply(this, a);
  },
  
  /** @public
  */
  debug: function debug() {

    if(xt.DEBUGGING === NO) return;

    var a = args(),
        b = xt.io.buff();
    b .set('color', 'blue')
      .set('prefix', '<<DEBUG>>');
    a.unshift(b);
    xt.io.__console__.apply(this, a);
  },

  /** @public
  */
  report: function report() {
    var a = args(),
        b = xt.io.buff(),
        r = [],
        t = a[1] || "reported content",
        d = a[2] || "auto-generated report";
    b .set('color', 'magenta')
      .set('prefix', null);

    // expects a hash of KV pairs to report from
    a = a[0];

    // aesthetics only, produce the correct number of
    // bars...
    var bottom = '---';
    for(var i=0; i<t.length; ++i)
      bottom += '-';
    bottom += '\n';
    
    for(var k in a)
      if(!a.hasOwnProperty(k)) continue;
      else if(xt.none(a[k])) continue;
      else r.push("  {key}: {value}\n".f({ key: k, value: a[k]})); 

    r.unshift("{description}\n".f({ description: d }));
    r.unshift("\n-- {title}\n".f({ title: t }));
    r.unshift(b);

    r.push(bottom);
    
    xt.io.__console__.apply(this, r);
  },

  /**
    Inspects arguments and returns them for output still
    in an array.

    @param {Object} args Variable number of arguments to inspect
    @returns {Array} An array of the arguments having been inspected
    @public
  */
  inspect: function inspect() {
    var a = args(),
        i = 0,
        l = a.length;
    for(; i<l; ++i)
      if(xt.typeOf(a[i]) !== xt.t_string)
        a[i] = require('util').inspect(a[i], true, 3).trim();
      else continue;
    return a;
  },
  
  /**
    Reusable portion of code for output.
    
    @param {Object} the string buffer to use
    @param {Object...} any objects to output in the buffer
    @private
  */
  __console__: function __console__() {
    if(arguments.length < 2) return;
    var a = args(),
        b = a.shift(),
        l = a.length,
        i = 0;
    a = xt.io.inspect.apply(this, a);
    for(; i<l; ++i)
      b.push(a[i]);
    console.log(b.flush());
  }
}

// Convenience for shortened path

/** @methodOf xt */
xt.log    = xt.io.log;

/** @methodOf xt */
xt.dev    = xt.io.dev;

/** @methodOf xt */
xt.debug  = xt.io.debug;

/** @methodOf xt */
xt.err    = xt.io.err;

/** @methodOf xt */
xt.report = xt.io.report;

/** @methodOf xt */
xt.warn   = xt.io.warn;