'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
    Manipulate tags 

    tag              := ascii alphanumeric and underscore (depending on the 
                         'ignore' and 'invalid' options)
    tag string       := tags is separated by commas possibly with commas at the
                         start and end of string   
    tag parameter    := can be any one of: 
                            tag string
                            array
                            instance of TagString
    
    Class ensure unique (unordered) values.

    All (most?) parameters are flexible enough to accept strings, arrays or 
    instances of TagString. HOWEVER note that all methods assume that the 
    instance running the method vs.the parameter(s) passed in use the exact
    same rules for invalid, ignoring tags and separator.
    
    If you need to combine or operate with two different set of rules then
    only use instances of TagString and then assume that the instance running
    the methods owns the final outcome.
    
    Creation options are:
        - source     initial tags
        - ignore:    a RegExp of tags to ignore. By default the tag 'all' 
        - invalid:   a RegExp of characters that are not allowed in tags. By 
                     default [^-a-zA-Z0-9_]
        - separator: for when splitting incoming strings and building
                     serialized strings. Default is comma ','
                      
    Examples:     
````javascript    
        var tags1 = new TagString( 'foo,bar' );
        
        var tags2 = new TagString( [ 'fee', 'fie' ] );
        
        var tags3 = TagString(tags2,{ separator: ' '}); // conver to space delimited
        
        tags2.add(tags1);  // fee,fie,foo,bar
        tags2.toggle( ['fie','foo'], false ); // fee,bar
        tags3.remove('fee'); // fie
````        
*/

function removeObject(arr, obj) {
  arr.splice(arr.indexOf(obj), 1);
}

function compare(arr1, arr2, isDiff) {
  isDiff = !!isDiff;

  if (arr1.length < arr2.length) {
    var tmp = arr1;
    arr1 = arr2;
    arr2 = tmp;
  }

  var obj = {};
  for (var i = 0; i < arr1.length; i++) {
    obj[arr1[i]] = true;
  }

  var result = [];
  for (var n = 0; n < arr2.length; n++) {
    var arr2ObjInArr1 = arr2[n] in obj;
    if (isDiff && !arr2ObjInArr1 || !isDiff && arr2ObjInArr1) {
      result.push(arr2[n]);
    }
  }

  return result;
}

function getIntersect(arr1, arr2) {
  return compare(arr1, arr2, false);
}

function getDiff(arr1, arr2) {
  return compare(arr1, arr2, true);
}

var DEFAULT_IGNORE = /^(\*|all)$/;

var TagString = function () {
  function TagString() {
    var src = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref$ignore = _ref.ignore;
    var ignore = _ref$ignore === undefined ? DEFAULT_IGNORE : _ref$ignore;
    var _ref$invalid = _ref.invalid;
    var invalid = _ref$invalid === undefined ? /[^-a-zA-Z0-9_]/ : _ref$invalid;
    var _ref$separator = _ref.separator;
    var separator = _ref$separator === undefined ? ',' : _ref$separator;

    _classCallCheck(this, TagString);

    this.clear = this.removeAll;
    this.includes = this.contains;

    Object.assign(this, { ignore: ignore, invalid: invalid, separator: separator });

    this._tagsArray = LibArray.from(Array.isArray(src) ? src : TagString.toArray(src, this.opts));
  }

  /*
      Editing
  */


  _createClass(TagString, [{
    key: 'add',
    value: function add(tag) {
      var _this = this;

      if (tag instanceof TagString) {
        if (tag._tagsArray.length) {
          tag._tagsArray.forEach(function (t) {
            if (!_this._tagsArray.includes(t)) {
              _this._tagsArray.push(t);
            }
          });
        }
        return this;
      }

      var ignore = this.ignore;
      var invalid = this.invalid;
      var arr = this._tagsArray;

      function safeAddTag(tag) {
        tag += ''; // stringize
        if (!!tag && tag.match(ignore) === null && tag.match(invalid) === null && !arr.includes(tag)) {
          arr.push(tag);
        }
      }

      TagString.toArray(tag, this.opts).forEach(safeAddTag);
      return this;
    }
  }, {
    key: 'remove',
    value: function remove(tagSpec) {
      var arr = this._tagsArray;

      function safeRemove(tag) {
        if (arr.includes(tag)) {
          removeObject(arr, tag);
        }
      }

      TagString.toArray(tagSpec, this.opts).forEach(safeRemove);
      return this;
    }
  }, {
    key: 'replace',
    value: function replace(replaceThisSource, withThisSource) {
      if (replaceThisSource && replaceThisSource !== withThisSource) {
        this.remove(replaceThisSource);
      }
      this.add(withThisSource);
      return this;
    }
  }, {
    key: 'removeAll',
    value: function removeAll() {
      this._tagsArray = LibArray.from([]);
      return this;
    }
  }, {
    key: 'toggle',
    value: function toggle(tag, flag) {
      if (flag) {
        this.add(tag);
      } else {
        this.remove(tag);
      }
      return this;
    }

    /*
        Queries 
    */

  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return this._tagsArray.length === 0;
    }
  }, {
    key: 'contains',
    value: function contains(tagsOrFunction) {
      var _this2 = this;

      if (typeof tagsOrFunction === 'function') {
        return !!this._tagsArray.find(tagsOrFunction);
      }
      var them = TagString.toArray(tagsOrFunction, this.opts);
      return !!LibArray.from(them).find(function (tag) {
        return _this2._tagsArray.includes(tag);
      });
    }
  }, {
    key: 'containsOne',
    value: function containsOne(tag) {
      return this._tagsArray.includes(tag);
    }
  }, {
    key: 'intersection',
    value: function intersection(other) {
      var ret = this;
      if (this._tagsArray.length) {
        var arr2 = TagString.toArray(other, this.opts);
        if (arr2.length) {
          var arr1 = this._tagsArray.slice();
          var source = getIntersect(arr1, arr2);
          ret = new TagString(source, this.opts);
        }
      }
      return ret;
    }
  }, {
    key: 'diff',
    value: function diff(returnTagsOnlyInThisOne) {
      var opts = this.opts;
      var source = getDiff(this._tagsArray.slice(), TagString.toArray(returnTagsOnlyInThisOne, opts));
      return new TagString(source, opts);
    }
  }, {
    key: 'sort',
    value: function sort() {
      this._tagsArray.sort();
      return this;
    }
  }, {
    key: 'isEqual',
    value: function isEqual(tags) {
      if (!tags) {
        return !this._tagsArray.length;
      }

      var other = tags instanceof TagString ? tags : new TagString(tags, this.opts);

      if (!this._tagsArray.length || other._tagsArray.length !== this._tagsArray.length) {
        return false;
      }

      if (this._tagsArray.length === 1) {
        return other._tagsArray[0] === this._tagsArray[0];
      }

      return this.hash === other.hash;
    }
  }, {
    key: 'anyInString',
    value: function anyInString(stringToSearch) {
      var str = (stringToSearch + '').toLowerCase();
      return this._tagsArray.find(function (tag) {
        return str.includes(tag);
      });
    }
  }, {
    key: 'anyInArray',
    value: function anyInArray(arrayOfStringsToSearch) {
      return LibArray.from(arrayOfStringsToSearch, function (s) {
        return s.toLowerCase();
      }).find(this.anyInString.bind(this));
    }
  }, {
    key: 'getLength',
    value: function getLength() {
      return this._tagsArray.length;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return TagString.fromArray(this._tagsArray);
    }
  }, {
    key: 'toString',
    value: function toString(withSeparator) {
      var tagArr = this._tagsArray;
      if (tagArr.length > 0) {
        var sep = withSeparator || this.separator;
        // sorting here allows for === comparisons between
        // two TagStrings
        return tagArr.slice().sort().join(sep);
      }
      return '';
    }
  }, {
    key: 'toArray',
    value: function toArray() {
      return this._tagsArray;
    }
  }, {
    key: 'forEach',
    value: function forEach(callback, context) {
      this._tagsArray.forEach(callback, context || this);
      return this;
    }
  }, {
    key: 'map',
    value: function map(callback, context) {
      return this._tagsArray.map(callback, context || this);
    }
  }, {
    key: 'concat',
    value: function concat() {
      var opts = this.opts;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this.add(args.reduce(function (a, tag) {
        return a.concat(TagString.toArray(tag, opts));
      }, []));
      return this;
    }
  }, {
    key: 'filter',
    value: function filter(rgx) {
      return new TagString(this._tagsArray.filter(rgx.test.bind(rgx)));
    }
  }, {
    key: 'hash',
    get: function get() {
      return this._tagsArray.slice().sort().join(':');
    }
  }, {
    key: 'length',
    get: function get() {
      return this._tagsArray.length;
    }

    /*
        Utilities
    */

  }, {
    key: 'opts',
    get: function get() {
      return {
        ignore: this.ignore,
        invalid: this.invalid,
        separator: this.separator
      };
    }
  }]);

  return TagString;
}();

TagString.contains = function (source, tag, opts) {
  return new TagString(source, opts).contains(tag);
};

TagString.forEach = function (source, callback, context, opts) {
  return new TagString(source, opts).forEach(callback, context);
};

TagString.filter = function (source, filter, opts) {
  return new TagString(source, opts).filter(filter);
};

function strToArr(source, ignore, separator) {
  var r = new RegExp(separator, 'g');
  return source.replace(r, ' ').split(/\s+/).filter(function (t) {
    return !!t && !ignore.test(t);
  });
}

TagString.toArray = function (source, _ref2) {
  var _ref2$ignore = _ref2.ignore;
  var ignore = _ref2$ignore === undefined ? DEFAULT_IGNORE : _ref2$ignore;
  var _ref2$separator = _ref2.separator;
  var separator = _ref2$separator === undefined ? ',' : _ref2$separator;

  if (!source) {
    return [];
  }

  var arr = null;
  if (typeof source === 'string') {
    arr = strToArr(source, ignore, separator);
  } else if (Array.isArray(source)) {
    arr = source.slice();
  } else if (source instanceof TagString) {
    arr = source._tagsArray.slice();
  } else {
    arr = [];
  }
  return arr;
};

TagString.fromArray = function (arr, opts) {
  return new TagString(arr, opts);
};

TagString.fromString = function (str) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  if (!str) {
    return new TagString([], opts);
  }
  var _opts$ignore = opts.ignore;
  var ignore = _opts$ignore === undefined ? DEFAULT_IGNORE : _opts$ignore;
  var _opts$separator = opts.separator;
  var separator = _opts$separator === undefined ? ',' : _opts$separator;

  return new TagString(strToArr(str, ignore, separator), opts);
};

module.exports = TagString;
