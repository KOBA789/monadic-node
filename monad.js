var fs = require('fs');

var noop = function () {};

var monadize = function (f) {
  f.bind = function (f2) {
    return bind(f, f2);
  };
  f.push = function (f2) {
    return push(f, f2);
  };
  f['>>='] = f.bind;
  f['>>'] = push;
  return f;
};

var _return = function (val) {
  return monadize(function (next) {
    process.nextTick(function () {
      next(val);
    });
  });
};

var bind = function (monad, func) {
  return monadize(function (next) {
    if (typeof next !== 'function') { next = noop; }
    monad(function () {
      func.apply(null, arguments)(next);
    });
  });
};

var push = function (monad, func) {
  return monadize(function (next) {
    if (typeof next !== 'function') { next = noop; }
    monad(function () {
      func(next);
    });
  });
};

var putStrLn = function (str) {
  return monadize(function (next) {
    console.log(str);
    process.nextTick(next);
  });
};

var wait = function (time) {
  return monadize(function (next) {
    setTimeout(next, time);
  });
};

var readFile = function (file) {
  return monadize(function (next) {
    fs.readFile(file, 'utf-8', function (err, data) {
      if (err) throw err;
      next(data);
    });
  });
};

var _do = monadize(function (next) {
  process.nextTick(next);
});

var main;

main = _do
  .push( _return('hello') )
  .bind( putStrLn )
  .push( wait(1000) )
  .push( putStrLn('world') )
  .push( readFile('./a.txt') )
  .bind( putStrLn )
;

main();