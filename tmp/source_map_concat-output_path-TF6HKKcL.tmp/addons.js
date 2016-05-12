define('ember-ajax/errors', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  exports.AjaxError = AjaxError;
  exports.InvalidError = InvalidError;
  exports.UnauthorizedError = UnauthorizedError;
  exports.ForbiddenError = ForbiddenError;

  var EmberError = _ember['default'].Error;

  /**
    @class AjaxError
    @namespace DS
  */

  function AjaxError(errors) {
    var message = arguments.length <= 1 || arguments[1] === undefined ? 'Ajax operation failed' : arguments[1];

    EmberError.call(this, message);

    this.errors = errors || [{
      title: 'Ajax Error',
      detail: message
    }];
  }

  AjaxError.prototype = Object.create(EmberError.prototype);

  function InvalidError(errors) {
    AjaxError.call(this, errors, 'Request was rejected because it was invalid');
  }

  InvalidError.prototype = Object.create(AjaxError.prototype);

  function UnauthorizedError(errors) {
    AjaxError.call(this, errors, 'Ajax authorization failed');
  }

  UnauthorizedError.prototype = Object.create(AjaxError.prototype);

  function ForbiddenError(errors) {
    AjaxError.call(this, errors, 'Request was rejected because user is not permitted to perform this operation.');
  }

  ForbiddenError.prototype = Object.create(AjaxError.prototype);
});
define('ember-ajax/index', ['exports', 'ember-ajax/request'], function (exports, _emberAjaxRequest) {
  'use strict';

  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxRequest['default'];
    }
  });
});
define('ember-ajax/make-promise', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  exports['default'] = makePromise;

  var run = _ember['default'].run;
  var RSVP = _ember['default'].RSVP;

  function makePromise(settings) {
    var type = settings.type || 'GET';
    return new RSVP.Promise(function (resolve, reject) {
      settings.success = makeSuccess(resolve);
      settings.error = makeError(reject);
      _ember['default'].$.ajax(settings);
    }, 'ember-ajax: ' + type + ' to ' + settings.url);
  }

  function makeSuccess(resolve) {
    return function success(response, textStatus, jqXHR) {
      run(null, resolve, {
        response: response,
        textStatus: textStatus,
        jqXHR: jqXHR
      });
    };
  }

  function makeError(reject) {
    return function error(jqXHR, textStatus, errorThrown) {
      run(null, reject, {
        jqXHR: jqXHR,
        textStatus: textStatus,
        errorThrown: errorThrown
      });
    };
  }
});
define('ember-ajax/raw', ['exports', 'ember-ajax/make-promise', 'ember-ajax/utils/parse-args', 'ember'], function (exports, _emberAjaxMakePromise, _emberAjaxUtilsParseArgs, _ember) {
  'use strict';

  var _slicedToArray = (function () {
    function sliceIterator(arr, i) {
      var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;_e = err;
      } finally {
        try {
          if (!_n && _i['return']) _i['return']();
        } finally {
          if (_d) throw _e;
        }
      }return _arr;
    }return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError('Invalid attempt to destructure non-iterable instance');
      }
    };
  })();

  exports['default'] = raw;

  var deprecate = _ember['default'].deprecate;

  /*
   * Same as `request` except it resolves an object with `{response, textStatus,
   * jqXHR}`, useful if you need access to the jqXHR object for headers, etc.
   */
  function raw() {
    deprecate('ember-ajax/raw is deprecated and will be removed in ember-ajax@2.0.0', false, { id: 'ember-ajax.raw' });

    var _parseArgs$apply = _emberAjaxUtilsParseArgs['default'].apply(null, arguments);

    var _parseArgs$apply2 = _slicedToArray(_parseArgs$apply, 3);

    var url = _parseArgs$apply2[0];
    var type = _parseArgs$apply2[1];
    var settings = _parseArgs$apply2[2];

    if (!settings) {
      settings = {};
    }
    settings.url = url;
    settings.type = type;
    return (0, _emberAjaxMakePromise['default'])(settings);
  }
});
define('ember-ajax/request', ['exports', 'ember-ajax/raw', 'ember'], function (exports, _emberAjaxRaw, _ember) {
  'use strict';

  exports['default'] = request;

  var deprecate = _ember['default'].deprecate;

  /*
   * jQuery.ajax wrapper, supports the same signature except providing
   * `success` and `error` handlers will throw an error (use promises instead)
   * and it resolves only the response (no access to jqXHR or textStatus).
   */
  function request() {
    deprecate('ember-ajax/request is deprecated and will be removed in ember-ajax@2.0.0', false, { id: 'ember-ajax.raw' });
    return _emberAjaxRaw['default'].apply(undefined, arguments).then(function (result) {
      return result.response;
    }, null, 'ember-ajax: unwrap raw ajax response');
  }
});
define('ember-ajax/services/ajax', ['exports', 'ember', 'ember-ajax/errors', 'ember-ajax/utils/parse-response-headers'], function (exports, _ember, _emberAjaxErrors, _emberAjaxUtilsParseResponseHeaders) {
  'use strict';

  var deprecate = _ember['default'].deprecate;
  var get = _ember['default'].get;
  var isBlank = _ember['default'].isBlank;

  /**
    ### Headers customization
  
    Some APIs require HTTP headers, e.g. to provide an API key. Arbitrary
    headers can be set as key/value pairs on the `RESTAdapter`'s `headers`
    object and Ember Data will send them along with each ajax request.
  
    ```app/services/ajax
    import AjaxService from 'ember-ajax/services/ajax';
  
    export default AjaxService.extend({
      headers: {
        "API_KEY": "secret key",
        "ANOTHER_HEADER": "Some header value"
      }
    });
    ```
  
    `headers` can also be used as a computed property to support dynamic
    headers.
  
    ```app/services/ajax.js
    import Ember from 'ember';
    import AjaxService from 'ember-ajax/services/ajax';
  
    export default AjaxService.extend({
      session: Ember.inject.service(),
      headers: Ember.computed("session.authToken", function() {
        return {
          "API_KEY": this.get("session.authToken"),
          "ANOTHER_HEADER": "Some header value"
        };
      })
    });
    ```
  
    In some cases, your dynamic headers may require data from some
    object outside of Ember's observer system (for example
    `document.cookie`). You can use the
    [volatile](/api/classes/Ember.ComputedProperty.html#method_volatile)
    function to set the property into a non-cached mode causing the headers to
    be recomputed with every request.
  
    ```app/services/ajax.js
    import Ember from 'ember';
    import AjaxService from 'ember-ajax/services/ajax';
  
    export default AjaxService.extend({
      session: Ember.inject.service(),
      headers: Ember.computed("session.authToken", function() {
        return {
          "API_KEY": Ember.get(document.cookie.match(/apiKey\=([^;]*)/), "1"),
          "ANOTHER_HEADER": "Some header value"
        };
      }).volatile()
    });
    ```
  
  **/
  exports['default'] = _ember['default'].Service.extend({

    request: function request(url, options) {
      var _this = this;

      var opts;

      if (arguments.length > 2 || typeof options === 'string') {
        deprecate('ember-ajax/ajax#request calling request with `type` is deprecated and will be removed in ember-ajax@1.0.0. If you want to specify a type pass an object like {type: \'DELETE\'}', false, { id: 'ember-ajax.service.request' });

        if (arguments.length > 2) {
          opts = arguments[2];
          opts.type = options;
        } else {
          opts = { type: options };
        }
      } else {
        opts = options;
      }

      var hash = this.options(url, opts);

      return new _ember['default'].RSVP.Promise(function (resolve, reject) {

        hash.success = function (payload, textStatus, jqXHR) {
          var response = _this.handleResponse(jqXHR.status, (0, _emberAjaxUtilsParseResponseHeaders['default'])(jqXHR.getAllResponseHeaders()), payload);

          if (response instanceof _emberAjaxErrors.AjaxError) {
            reject(response);
          } else {
            resolve(response);
          }
        };

        hash.error = function (jqXHR, textStatus, errorThrown) {
          var error = undefined;

          if (!(error instanceof Error)) {
            if (errorThrown instanceof Error) {
              error = errorThrown;
            } else {
              error = _this.handleResponse(jqXHR.status, (0, _emberAjaxUtilsParseResponseHeaders['default'])(jqXHR.getAllResponseHeaders()), _this.parseErrorResponse(jqXHR.responseText) || errorThrown);
            }
          }
          reject(error);
        };

        _ember['default'].$.ajax(hash);
      }, 'ember-ajax: ' + hash.type + ' to ' + url);
    },

    // calls `request()` but forces `options.type` to `POST`
    post: function post(url, options) {
      return this.request(url, this._addTypeToOptionsFor(options, 'POST'));
    },

    // calls `request()` but forces `options.type` to `PUT`
    put: function put(url, options) {
      return this.request(url, this._addTypeToOptionsFor(options, 'PUT'));
    },

    // calls `request()` but forces `options.type` to `PATCH`
    patch: function patch(url, options) {
      return this.request(url, this._addTypeToOptionsFor(options, 'PATCH'));
    },

    // calls `request()` but forces `options.type` to `DELETE`
    del: function del(url, options) {
      return this.request(url, this._addTypeToOptionsFor(options, 'DELETE'));
    },

    // forcibly manipulates the options hash to include the HTTP method on the type key
    _addTypeToOptionsFor: function _addTypeToOptionsFor(options, method) {
      options = options || {};
      options.type = method;
      return options;
    },

    /**
      @method options
      @private
      @param {String} url
      @param {Object} options
      @return {Object}
    */
    options: function options(url, _options) {
      var hash = _options || {};
      hash.url = this._buildURL(url);
      hash.type = hash.type || 'GET';
      hash.dataType = hash.dataType || 'json';
      hash.context = this;

      var headers = get(this, 'headers');
      if (headers !== undefined) {
        hash.beforeSend = function (xhr) {
          Object.keys(headers).forEach(function (key) {
            return xhr.setRequestHeader(key, headers[key]);
          });
        };
      }

      return hash;
    },

    _buildURL: function _buildURL(url) {
      var host = get(this, 'host');
      if (isBlank(host)) {
        return url;
      }
      var startsWith = String.prototype.startsWith || function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
      };
      if (startsWith.call(url, '/')) {
        return '' + host + url;
      } else {
        return host + '/' + url;
      }
    },

    /**
     Takes an ajax response, and returns the json payload or an error.
      By default this hook just returns the json payload passed to it.
     You might want to override it in two cases:
      1. Your API might return useful results in the response headers.
     Response headers are passed in as the second argument.
      2. Your API might return errors as successful responses with status code
     200 and an Errors text or object.
     @method handleResponse
     @param  {Number} status
     @param  {Object} headers
     @param  {Object} payload
     @return {Object | DS.AdapterError} response
    */
    handleResponse: function handleResponse(status, headers, payload) {
      if (this.isSuccess(status, headers, payload)) {
        return payload;
      } else if (this.isUnauthorized(status, headers, payload)) {
        return new _emberAjaxErrors.UnauthorizedError(payload.errors);
      } else if (this.isForbidden(status, headers, payload)) {
        return new _emberAjaxErrors.ForbiddenError(payload.errors);
      } else if (this.isInvalid(status, headers, payload)) {
        return new _emberAjaxErrors.InvalidError(payload.errors);
      }

      var errors = this.normalizeErrorResponse(status, headers, payload);

      return new _emberAjaxErrors.AjaxError(errors);
    },

    /**
     Default `handleResponse` implementation uses this hook to decide if the
     response is a an authorized error.
     @method isUnauthorized
     @param  {Number} status
     @param  {Object} headers
     @param  {Object} payload
     @return {Boolean}
    */
    isUnauthorized: function isUnauthorized(status /*, headers, payload */) {
      return status === 401;
    },

    /**
       Default `handleResponse` implementation uses this hook to decide if the
       response is a forbidden error.
       @method isForbidden
       @param  {Number} status
       @param  {Object} headers
       @param  {Object} payload
       @return {Boolean}
     */
    isForbidden: function isForbidden(status /*, headers, payload */) {
      return status === 403;
    },

    /**
      Default `handleResponse` implementation uses this hook to decide if the
      response is a an invalid error.
      @method isInvalid
      @param  {Number} status
      @param  {Object} headers
      @param  {Object} payload
      @return {Boolean}
    */
    isInvalid: function isInvalid(status /*, headers, payload */) {
      return status === 422;
    },

    /**
     Default `handleResponse` implementation uses this hook to decide if the
     response is a success.
     @method isSuccess
     @param  {Number} status
     @param  {Object} headers
     @param  {Object} payload
     @return {Boolean}
    */
    isSuccess: function isSuccess(status /*, headers, payload */) {
      return status >= 200 && status < 300 || status === 304;
    },

    /**
      @method parseErrorResponse
      @private
      @param {String} responseText
      @return {Object}
    */
    parseErrorResponse: function parseErrorResponse(responseText) {
      var json = responseText;

      try {
        json = _ember['default'].$.parseJSON(responseText);
      } catch (e) {}

      return json;
    },

    /**
      @method normalizeErrorResponse
      @private
      @param  {Number} status
      @param  {Object} headers
      @param  {Object} payload
      @return {Object} errors payload
    */
    normalizeErrorResponse: function normalizeErrorResponse(status, headers, payload) {
      if (payload && typeof payload === 'object' && payload.errors) {
        return payload.errors;
      } else {
        return [{
          status: '' + status,
          title: "The backend responded with an error",
          detail: '' + payload
        }];
      }
    }
  });
});
define("ember-ajax/utils/parse-args", ["exports"], function (exports) {
  "use strict";

  var _slicedToArray = (function () {
    function sliceIterator(arr, i) {
      var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;_e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }return _arr;
    }return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  })();

  exports["default"] = parseArgs;

  function parseArgs() {
    var args = [].slice.apply(arguments);
    if (args.length === 1) {
      if (typeof args[0] === "string") {
        var _args = _slicedToArray(args, 1);

        var url = _args[0];

        return [url];
      } else {
        var _args2 = _slicedToArray(args, 1);

        var options = _args2[0];
        var url = options.url;

        delete options.url;
        var type = options.type || options.method;
        delete options.type;
        delete options.method;
        return [url, type, options];
      }
    }
    if (args.length === 2) {
      var _args3 = _slicedToArray(args, 1);

      var url = _args3[0];

      if (typeof args[1] === 'object') {
        var options = args[1];
        var type = options.type || options.method;
        delete options.type;
        delete options.method;
        return [url, type, options];
      } else {
        var type = args[1];
        return [url, type];
      }
    }
    return args;
  }
});
define('ember-ajax/utils/parse-response-headers', ['exports'], function (exports) {
  'use strict';

  exports['default'] = parseResponseHeaders;

  function parseResponseHeaders(headerStr) {
    var headers = Object.create(null);
    if (!headerStr) {
      return headers;
    }

    var headerPairs = headerStr.split('\r\n');
    for (var i = 0; i < headerPairs.length; i++) {
      var headerPair = headerPairs[i];
      // Can't use split() here because it does the wrong thing
      // if the header value has the string ": " in it.
      var index = headerPair.indexOf(': ');
      if (index > 0) {
        var key = headerPair.substring(0, index);
        var val = headerPair.substring(index + 2);
        headers[key] = val;
      }
    }

    return headers;
  }
});
define('ember-cli-app-version/components/app-version', ['exports', 'ember', 'ember-cli-app-version/templates/app-version'], function (exports, _ember, _emberCliAppVersionTemplatesAppVersion) {
  'use strict';

  exports['default'] = _ember['default'].Component.extend({
    tagName: 'span',
    layout: _emberCliAppVersionTemplatesAppVersion['default']
  });
});
define('ember-cli-app-version/initializer-factory', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  exports['default'] = initializerFactory;

  var classify = _ember['default'].String.classify;

  function initializerFactory(name, version) {
    var registered = false;

    return function () {
      if (!registered && name && version) {
        var appName = classify(name);
        _ember['default'].libraries.register(appName, version);
        registered = true;
      }
    };
  }
});
define("ember-cli-app-version/templates/app-version", ["exports"], function (exports) {
  "use strict";

  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.4.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "modules/ember-cli-app-version/templates/app-version.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["content", "version", ["loc", [null, [1, 0], [1, 11]]]]],
      locals: [],
      templates: []
    };
  })());
});
define('ember-data-factory-guy/builder/fixture-builder-factory', ['exports', 'ember-data', 'ember-data-factory-guy/builder/jsonapi-fixture-builder', 'ember-data-factory-guy/builder/rest-fixture-builder'], function (exports, _emberData, _emberDataFactoryGuyBuilderJsonapiFixtureBuilder, _emberDataFactoryGuyBuilderRestFixtureBuilder) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _default = (function () {
    function _default(store) {
      _classCallCheck(this, _default);

      this.store = store;
      this.adapter = store.adapterFor('application');
    }

    /**
     Return appropriate FixtureBuilder for the adapter type
     */

    _createClass(_default, [{
      key: 'fixtureBuilder',
      value: function fixtureBuilder() {
        if (this.usingJSONAPIAdapter()) {
          return new _emberDataFactoryGuyBuilderJsonapiFixtureBuilder['default'](this.store);
        }
        if (this.usingRESTAdapter()) {
          return new _emberDataFactoryGuyBuilderRestFixtureBuilder['default'](this.store);
        }
        return new _emberDataFactoryGuyBuilderJsonapiFixtureBuilder['default'](this.store);
      }
    }, {
      key: 'usingJSONAPIAdapter',
      value: function usingJSONAPIAdapter() {
        return this.adapter && this.adapter instanceof _emberData['default'].JSONAPIAdapter;
      }
    }, {
      key: 'usingRESTAdapter',
      value: function usingRESTAdapter() {
        return this.adapter && this.adapter instanceof _emberData['default'].RESTAdapter;
      }
    }]);

    return _default;
  })();

  exports['default'] = _default;
});
define('ember-data-factory-guy/builder/fixture-builder', ['exports', 'ember-data-factory-guy/converter/jsonapi-fixture-converter', 'ember'], function (exports, _emberDataFactoryGuyConverterJsonapiFixtureConverter, _ember) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _default = (function () {
    function _default(store) {
      _classCallCheck(this, _default);

      this.store = store;
    }

    /**
     Normalizes the serialized model to the expected API format
      @param modelName
     @param payload
     */

    _createClass(_default, [{
      key: 'normalize',
      value: function normalize(modelName, payload) {
        return payload;
      }

      /**
       Returns the ID for the model payload
        @param modelName
       @param payload
       */
    }, {
      key: 'extractId',
      value: function extractId(modelName, payload) {
        return payload.id;
      }

      /**
       Convert fixture for FactoryGuy.build
        @param modelName
       @param fixture
       */
    }, {
      key: 'convertForBuild',
      value: function convertForBuild(modelName, fixture) {
        return fixture;
      }

      /**
       Convert to the ember-data JSONAPI adapter specification, since FactoryGuy#make
       pushes jsonapi data into the store
        @param {String} modelName
       @param {String} fixture
       @returns {*} new converted fixture
       */
    }, {
      key: 'convertForMake',
      value: function convertForMake(modelName, fixture) {
        return new _emberDataFactoryGuyConverterJsonapiFixtureConverter['default'](this.store, false).convert(modelName, fixture);
      }

      /**
       Convert simple ( older ember data format ) error hash:
        {errors: {description: ['bad']}}
        to:
        {errors: [{detail: 'bad', source: { pointer:  "data/attributes/description"}, title: 'invalid description'}] }
        @param errors simple error hash
       @returns {{}}  JSONAPI formatted errors
       */
    }, {
      key: 'convertResponseErrors',
      value: function convertResponseErrors(object) {
        var jsonAPIErrrors = [];
        _ember['default'].assert('Your error REST Adapter style response must have an errors key. The errors hash format is: {errors: {description: ["bad"]}}', object.errors);
        var errors = object.errors;
        for (var key in errors) {
          var description = _ember['default'].typeOf(errors[key]) === "array" ? errors[key][0] : errors[key];
          var source = { pointer: "data/attributes/key" + key };
          var newError = { detail: description, title: "invalid " + key, source: source };
          jsonAPIErrrors.push(newError);
        }
        return { errors: jsonAPIErrrors };
      }
    }]);

    return _default;
  })();

  exports['default'] = _default;
});
define('ember-data-factory-guy/builder/jsonapi-fixture-builder', ['exports', 'ember', 'ember-data-factory-guy/builder/fixture-builder', 'ember-data-factory-guy/converter/jsonapi-fixture-converter', 'ember-data-factory-guy/payload/json-api-payload'], function (exports, _ember, _emberDataFactoryGuyBuilderFixtureBuilder, _emberDataFactoryGuyConverterJsonapiFixtureConverter, _emberDataFactoryGuyPayloadJsonApiPayload) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  /**
   Fixture Builder for JSONAPISerializer
   */

  var JSONAPIJsonBuilder = (function (_FixtureBuilder) {
    _inherits(JSONAPIJsonBuilder, _FixtureBuilder);

    function JSONAPIJsonBuilder(store) {
      _classCallCheck(this, JSONAPIJsonBuilder);

      _get(Object.getPrototypeOf(JSONAPIJsonBuilder.prototype), 'constructor', this).call(this, store);
      this.updateHTTPMethod = 'PATCH';
    }

    _createClass(JSONAPIJsonBuilder, [{
      key: 'extractId',
      value: function extractId(modelName, payload) {
        return _ember['default'].get(payload, 'data.id');
      }
    }, {
      key: 'convertForBuild',
      value: function convertForBuild(modelName, fixture) {
        var converter = new _emberDataFactoryGuyConverterJsonapiFixtureConverter['default'](this.store);
        var json = converter.convert(modelName, fixture);
        new _emberDataFactoryGuyPayloadJsonApiPayload['default'](modelName, json, converter);
        return json;
      }
    }]);

    return JSONAPIJsonBuilder;
  })(_emberDataFactoryGuyBuilderFixtureBuilder['default']);

  exports['default'] = JSONAPIJsonBuilder;
});
define('ember-data-factory-guy/builder/rest-fixture-builder', ['exports', 'ember', 'ember-data-factory-guy/builder/fixture-builder', 'ember-data-factory-guy/converter/rest-fixture-converter', 'ember-data-factory-guy/payload/rest-payload'], function (exports, _ember, _emberDataFactoryGuyBuilderFixtureBuilder, _emberDataFactoryGuyConverterRestFixtureConverter, _emberDataFactoryGuyPayloadRestPayload) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  /**
   Fixture Builder for REST based Serializer, like ActiveModelSerializer or
   RESTSerializer
  
   */

  var RESTFixtureBuilder = (function (_FixtureBuilder) {
    _inherits(RESTFixtureBuilder, _FixtureBuilder);

    function RESTFixtureBuilder(store) {
      _classCallCheck(this, RESTFixtureBuilder);

      _get(Object.getPrototypeOf(RESTFixtureBuilder.prototype), 'constructor', this).call(this, store);
    }

    /**
     Map single object to response json.
      Allows custom serializing mappings and meta data to be added to requests.
      @param {String} modelName model name
     @param {Object} json Json object from record.toJSON
     @return {Object} responseJson
     */

    _createClass(RESTFixtureBuilder, [{
      key: 'normalize',
      value: function normalize(modelName, payload) {
        return _defineProperty({}, modelName, payload);
      }
    }, {
      key: 'extractId',
      value: function extractId(modelName, payload) {
        return _ember['default'].get(payload, modelName + '.id');
      }

      /**
       Convert to the ember-data REST adapter specification
        @param {String} modelName
       @param {String} fixture
       @returns {*} new converted fixture
       */
    }, {
      key: 'convertForBuild',
      value: function convertForBuild(modelName, fixture) {
        var converter = new _emberDataFactoryGuyConverterRestFixtureConverter['default'](this.store);
        var json = converter.convert(modelName, fixture);
        new _emberDataFactoryGuyPayloadRestPayload['default'](modelName, json, converter);
        return json;
      }
    }]);

    return RESTFixtureBuilder;
  })(_emberDataFactoryGuyBuilderFixtureBuilder['default']);

  exports['default'] = RESTFixtureBuilder;
});
define('ember-data-factory-guy/converter/fixture-converter', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _default = (function () {
    function _default(store) {
      var transformKeys = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      _classCallCheck(this, _default);

      this.transformKeys = transformKeys;
      this.store = store;
      this.listType = false;
      this.noTransformFn = function (x) {
        return x;
      };
      this.defaultValueTransformFn = this.noTransformFn;
    }

    _createClass(_default, [{
      key: 'addPrimaryKey',
      value: function addPrimaryKey(modelName, data, fixture) {
        var primaryKey = this.store.serializerFor(modelName).get('primaryKey');
        data.id = fixture.id;
        if (primaryKey !== 'id') {
          data[primaryKey] = fixture.id;
        }
      }
    }, {
      key: 'transformRelationshipKey',
      value: function transformRelationshipKey(relationship) {
        var transformFn = this.getTransformKeyFunction(relationship.type, 'Relationship');
        return transformFn(relationship.key, relationship.kind);
      }
    }, {
      key: 'getRelationshipType',
      value: function getRelationshipType(relationship, fixture) {
        var isPolymorphic = relationship.options.polymorphic;
        return isPolymorphic ? this.polymorphicTypeTransformFn(fixture.type) : relationship.type;
      }
    }, {
      key: 'getTransformKeyFunction',
      value: function getTransformKeyFunction(modelName, type) {
        if (!this.transformKeys) {
          return this.noTransformFn;
        }
        var serializer = this.store.serializerFor(modelName);
        return serializer['keyFor' + type] || this.defaultKeyTransformFn;
      }
    }, {
      key: 'getTransformValueFunction',
      value: function getTransformValueFunction(type) {
        if (!this.transformKeys || type && type.match('-mf')) {
          return this.noTransformFn;
        }
        if (!type) {
          return this.defaultValueTransformFn;
        }
        var container = _ember['default'].getOwner ? _ember['default'].getOwner(this.store) : this.store.container;
        return container.lookup('transform:' + type).serialize;
      }
    }, {
      key: 'extractAttributes',
      value: function extractAttributes(modelName, fixture) {
        var _this = this;

        var attributes = {};
        var transformKeyFunction = this.getTransformKeyFunction(modelName, 'Attribute');

        this.store.modelFor(modelName).eachAttribute(function (attribute, meta) {
          var attributeKey = transformKeyFunction(attribute);
          var transformValueFunction = _this.getTransformValueFunction(meta.type);

          if (fixture.hasOwnProperty(attribute)) {
            attributes[attributeKey] = transformValueFunction(fixture[attribute]);
          } else if (fixture.hasOwnProperty(attributeKey)) {
            attributes[attributeKey] = transformValueFunction(fixture[attributeKey]);
          }
        });
        return attributes;
      }

      /**
       Extract relationships and descend into those looking for others
        @param {String} modelName
       @param {Object} fixture
       @returns {{}}
       */
    }, {
      key: 'extractRelationships',
      value: function extractRelationships(modelName, fixture) {
        var _this2 = this;

        var relationships = {};

        this.store.modelFor(modelName).eachRelationship(function (key, relationship) {
          if (fixture.hasOwnProperty(key)) {
            if (relationship.kind === 'belongsTo') {
              _this2.extractBelongsTo(fixture, relationship, modelName, relationships);
            } else if (relationship.kind === 'hasMany') {
              _this2.extractHasMany(fixture, relationship, modelName, relationships);
            }
          }
        });

        return relationships;
      }

      /**
       Extract belongTo relationships
        @param fixture
       @param relationship
       @param relationships
       */
    }, {
      key: 'extractBelongsTo',
      value: function extractBelongsTo(fixture, relationship, parentModelName, relationships) {
        var belongsToRecord = fixture[relationship.key];

        var relationshipKey = this.transformRelationshipKey(relationship);
        var isEmbedded = this.isEmbeddedRelationship(parentModelName, relationshipKey);

        var data = this.extractSingleRecord(belongsToRecord, relationship, isEmbedded);

        relationships[relationshipKey] = this.assignRelationship(data);
      }

      // Borrowed from ember data
      // checks config for attrs option to embedded (always)
    }, {
      key: 'isEmbeddedRelationship',
      value: function isEmbeddedRelationship(modelName, attr) {
        var serializer = this.store.serializerFor(modelName);
        var option = this.attrsOption(serializer, attr);
        return option && (option.embedded === 'always' || option.deserialize === 'records');
      }
    }, {
      key: 'attrsOption',
      value: function attrsOption(serializer, attr) {
        var attrs = serializer.get('attrs');
        return attrs && (attrs[_ember['default'].String.camelize(attr)] || attrs[attr]);
      }
    }, {
      key: 'extractHasMany',
      value: function extractHasMany(fixture, relationship, parentModelName, relationships) {
        var _this3 = this;

        var hasManyRecords = fixture[relationship.key];

        var relationshipKey = this.transformRelationshipKey(relationship);
        var isEmbedded = this.isEmbeddedRelationship(parentModelName, relationshipKey);

        if (hasManyRecords.isProxy) {
          return this.addListProxyData(hasManyRecords, relationship, relationships, isEmbedded);
        }

        if (_ember['default'].typeOf(hasManyRecords) !== 'array') {
          return;
        }

        var records = hasManyRecords.map(function (hasManyRecord) {
          return _this3.extractSingleRecord(hasManyRecord, relationship, isEmbedded);
        });

        relationships[relationshipKey] = this.assignRelationship(records);
      }
    }, {
      key: 'extractSingleRecord',
      value: function extractSingleRecord(record, relationship, isEmbedded) {
        var data = undefined;
        switch (_ember['default'].typeOf(record)) {

          case 'object':
            if (record.isProxy) {
              data = this.addProxyData(record, relationship, isEmbedded);
            } else {
              data = this.addData(record, relationship, isEmbedded);
            }
            break;

          case 'instance':
            data = this.normalizeAssociation(record, relationship);
            break;

          case 'number':
          case 'string':
            _ember['default'].assert('Polymorphic relationships cannot be specified by id you\n          need to supply an object with id and type', !relationship.options.polymorphic);
            record = { id: record, type: relationship.type };
            data = this.normalizeAssociation(record, relationship);
        }

        return data;
      }
    }, {
      key: 'assignRelationship',
      value: function assignRelationship(object) {
        return object;
      }
    }, {
      key: 'addData',
      value: function addData(embeddedFixture, relationship, isEmbedded) {
        var relationshipType = this.getRelationshipType(relationship, embeddedFixture);
        // find possibly more embedded fixtures
        var data = this.convertSingle(relationshipType, embeddedFixture);
        if (isEmbedded) {
          return data;
        }
        this.addToIncluded(data, relationshipType);
        return this.normalizeAssociation(data, relationship);
      }

      // proxy data is data that was build with FactoryGuy.build method
    }, {
      key: 'addProxyData',
      value: function addProxyData(jsonProxy, relationship, isEmbedded) {
        var data = jsonProxy.getModelPayload();
        var relationshipType = this.getRelationshipType(relationship, data);
        if (isEmbedded) {
          this.addToIncludedFromProxy(jsonProxy);
          return data;
        }
        this.addToIncluded(data, relationshipType);
        this.addToIncludedFromProxy(jsonProxy);
        return this.normalizeAssociation(data, relationship);
      }

      // listProxy data is data that was build with FactoryGuy.buildList method
    }, {
      key: 'addListProxyData',
      value: function addListProxyData(jsonProxy, relationship, relationships, isEmbedded) {
        var _this4 = this;

        var relationshipKey = this.transformRelationshipKey(relationship);

        var records = jsonProxy.getModelPayload().map(function (data) {
          if (isEmbedded) {
            return data;
          }
          var relationshipType = _this4.getRelationshipType(relationship, data);
          _this4.addToIncluded(data, relationshipType);
          return _this4.normalizeAssociation(data, relationship);
        });

        this.addToIncludedFromProxy(jsonProxy);

        relationships[relationshipKey] = this.assignRelationship(records);
      }
    }]);

    return _default;
  })();

  exports['default'] = _default;
});
define('ember-data-factory-guy/converter/jsonapi-fixture-converter', ['exports', 'ember', 'ember-data-factory-guy/converter/fixture-converter'], function (exports, _ember, _emberDataFactoryGuyConverterFixtureConverter) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var dasherize = _ember['default'].String.dasherize;

  var JSONAPIFixtureConverter = (function (_Converter) {
    _inherits(JSONAPIFixtureConverter, _Converter);

    function JSONAPIFixtureConverter(store) {
      var transformKeys = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      _classCallCheck(this, JSONAPIFixtureConverter);

      _get(Object.getPrototypeOf(JSONAPIFixtureConverter.prototype), 'constructor', this).call(this, store, transformKeys);
      this.defaultKeyTransformFn = dasherize;
      this.polymorphicTypeTransformFn = dasherize;
      this.included = [];
    }

    /**
     Convert an initial fixture into JSONAPI document
     This raw fixture can contain other json in relationships that were
     built by FacoryGuy ( build, buildList ) methods
      @param {String} modelName
     @param {Object} fixture initial raw fixture
     @returns {{data: {type: *, id: *, attributes}: Array}}
     */

    _createClass(JSONAPIFixtureConverter, [{
      key: 'convert',
      value: function convert(modelName, fixture) {
        var _this = this;

        var data = undefined;

        if (_ember['default'].typeOf(fixture) === 'array') {
          this.listType = true;
          data = fixture.map(function (single) {
            return _this.convertSingle(modelName, single);
          });
        } else {
          data = this.convertSingle(modelName, fixture);
        }

        var jsonApiData = { data: data };

        if (!_ember['default'].isEmpty(this.included)) {
          jsonApiData.included = this.included;
        }

        return jsonApiData;
      }

      /**
       In order to conform to the way ember data expects to handle relationships
       in a json payload ( during deserialization ), convert a record ( model instance )
       into an object with type and id.
        @param {Object} record
       @param {Object} relationship
       */
    }, {
      key: 'normalizeAssociation',
      value: function normalizeAssociation(record, relationship) {
        if (_ember['default'].typeOf(record) === 'object') {
          if (relationship.options.polymorphic) {
            return { type: dasherize(record.type), id: record.id };
          } else {
            return { type: record.type, id: record.id };
          }
        } else {
          return { type: record.constructor.modelName, id: record.id };
        }
      }

      /**
       Recursively descend into the fixture json, looking for relationships that are
       either record instances or other fixture objects that need to be normalized
       and/or included in the 'included' hash
        @param modelName
       @param fixture
       @param included
       @returns {{type: *, id: *, attributes}}
       */
    }, {
      key: 'convertSingle',
      value: function convertSingle(modelName, fixture) {
        var data = {
          type: modelName,
          attributes: this.extractAttributes(modelName, fixture)
        };

        this.addPrimaryKey(modelName, data, fixture);

        var relationships = this.extractRelationships(modelName, fixture);
        if (Object.getOwnPropertyNames(relationships).length > 0) {
          data.relationships = relationships;
        }
        return data;
      }

      /*
       Add the model to included array unless it's already there.
       */
    }, {
      key: 'addToIncluded',
      value: function addToIncluded(data) {
        var found = _ember['default'].A(this.included).find(function (model) {
          return model.id === data.id && model.type === data.type;
        });
        if (!found) {
          this.included.push(data);
        }
      }
    }, {
      key: 'addToIncludedFromProxy',
      value: function addToIncludedFromProxy(proxy) {
        var _this2 = this;

        proxy.includes().forEach(function (data) {
          _this2.addToIncluded(data);
        });
      }
    }, {
      key: 'assignRelationship',
      value: function assignRelationship(object) {
        return { data: object };
      }
    }]);

    return JSONAPIFixtureConverter;
  })(_emberDataFactoryGuyConverterFixtureConverter['default']);

  exports['default'] = JSONAPIFixtureConverter;
});
define('ember-data-factory-guy/converter/rest-fixture-converter', ['exports', 'ember', 'ember-data-factory-guy/converter/fixture-converter'], function (exports, _ember, _emberDataFactoryGuyConverterFixtureConverter) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var _Ember$String = _ember['default'].String;
  var underscore = _Ember$String.underscore;
  var pluralize = _Ember$String.pluralize;
  var dasherize = _Ember$String.dasherize;

  /**
   Convert base fixture to a REST format fixture, and while it's converting
   the format, it transforms the attribute and relationship keys as well.
  
   If there are associations in the base fixture, they will be added to the
   new fixture as 'side loaded' elements, even if they are another json payload
   built whith the build/buildList methods.
  
   TODO: The weakness here is in polymorphic types, since I am using that type
   attribute to determine the correct model name. There is a work around,
   but waiting to see if anyone complains.
  
   @param store
   @constructor
   */

  var RestFixtureConverter = (function (_Converter) {
    _inherits(RestFixtureConverter, _Converter);

    function RestFixtureConverter(store) {
      _classCallCheck(this, RestFixtureConverter);

      _get(Object.getPrototypeOf(RestFixtureConverter.prototype), 'constructor', this).call(this, store);
      this.defaultKeyTransformFn = underscore;
      this.polymorphicTypeTransformFn = underscore;
      this.included = {};
    }

    /**
     Transform attributes in fixture.
      @param modelName
     @param fixture
     @returns {*} converted fixture
     */

    _createClass(RestFixtureConverter, [{
      key: 'convert',
      value: function convert(modelName, fixture) {
        var _this = this;

        var newFixture = undefined;

        if (_ember['default'].typeOf(fixture) === 'array') {
          this.listType = true;
          newFixture = fixture.map(function (single) {
            return _this.convertSingle(modelName, single);
          });
          modelName = pluralize(modelName);
        } else {
          newFixture = this.convertSingle(modelName, fixture);
        }

        var finalFixture = {};
        finalFixture[modelName] = newFixture;

        Object.keys(this.included).forEach(function (key) {
          finalFixture[key] = _this.included[key];
        });

        return finalFixture;
      }

      /**
       Convert single record
        @param {String} modelName
       @param {Object} fixture
       */
    }, {
      key: 'convertSingle',
      value: function convertSingle(modelName, fixture) {
        var data = {};
        var attributes = this.extractAttributes(modelName, fixture);
        var relationships = this.extractRelationships(modelName, fixture);

        Object.keys(attributes).forEach(function (key) {
          data[key] = attributes[key];
        });
        Object.keys(relationships).forEach(function (key) {
          data[key] = relationships[key];
        });

        this.addPrimaryKey(modelName, data, fixture);

        return data;
      }
    }, {
      key: 'transformRelationshipKey',
      value: function transformRelationshipKey(relationship) {
        var transformedKey = _get(Object.getPrototypeOf(RestFixtureConverter.prototype), 'transformRelationshipKey', this).call(this, relationship);
        if (relationship.options.polymorphic) {
          transformedKey = transformedKey.replace('_id', '');
        }
        return transformedKey;
      }

      /**
        @param {Object} record
       @param {Object} relationship
       */
    }, {
      key: 'normalizeAssociation',
      value: function normalizeAssociation(record, relationship) {
        if (_ember['default'].typeOf(record) === 'object') {
          if (relationship.options.polymorphic) {
            return { type: underscore(record.type), id: record.id };
          } else {
            return record.id;
          }
        } else {
          return record.id;
        }
      }

      /**
       Add the model to included array unless it's already there.
        @param {String} modelKey
       @param {Object} data
       @param {Object} includeObject
       */
    }, {
      key: 'addToIncluded',
      value: function addToIncluded(data, modelKey) {
        var relationshipKey = pluralize(dasherize(modelKey));

        if (!this.included[relationshipKey]) {
          this.included[relationshipKey] = [];
        }

        var modelRelationships = this.included[relationshipKey];

        var found = _ember['default'].A(modelRelationships).find(function (existing) {
          return existing.id === data.id;
        });

        if (!found) {
          modelRelationships.push(data);
        }
      }

      /**
        Add proxied json to this payload, by taking all included models and
        adding them to this payloads includes
         @param proxy json payload proxy
       */
    }, {
      key: 'addToIncludedFromProxy',
      value: function addToIncludedFromProxy(proxy) {
        var _this2 = this;

        proxy.includeKeys().forEach(function (modelKey) {
          var includedModels = proxy.getInclude(modelKey);
          includedModels.forEach(function (data) {
            _this2.addToIncluded(data, modelKey);
          });
        });
      }
    }]);

    return RestFixtureConverter;
  })(_emberDataFactoryGuyConverterFixtureConverter['default']);

  exports['default'] = RestFixtureConverter;
});
define('ember-data-factory-guy/factory-guy-test-helper', ['exports', 'ember', 'ember-data', 'jquery', 'ember-data-factory-guy/factory-guy', 'ember-data-factory-guy/mocks/mock-update-request', 'ember-data-factory-guy/mocks/mock-create-request', 'ember-data-factory-guy/mocks/mock-query-request', 'ember-data-factory-guy/mocks/mock-query-record-request', 'ember-data-factory-guy/mocks/mock-find-request', 'ember-data-factory-guy/mocks/mock-reload-request', 'ember-data-factory-guy/mocks/mock-find-all-request'], function (exports, _ember, _emberData, _jquery, _emberDataFactoryGuyFactoryGuy, _emberDataFactoryGuyMocksMockUpdateRequest, _emberDataFactoryGuyMocksMockCreateRequest, _emberDataFactoryGuyMocksMockQueryRequest, _emberDataFactoryGuyMocksMockQueryRecordRequest, _emberDataFactoryGuyMocksMockFindRequest, _emberDataFactoryGuyMocksMockReloadRequest, _emberDataFactoryGuyMocksMockFindAllRequest) {
  'use strict';

  var MockServer = _ember['default'].Object.extend({

    setup: function setup() {
      _jquery['default'].mockjaxSettings.logging = false;
      _jquery['default'].mockjaxSettings.responseTime = 0;
    },

    teardown: function teardown() {
      _jquery['default'].mockjax.clear();
    },

    // Look up a controller from the current container
    controllerFor: function controllerFor(name) {
      return this.get('container').lookup('controller:' + name);
    },

    // Set a property on a controller in the current container
    setControllerProp: function setControllerProp(controller_name, property, value) {
      var controller = this.controllerFor(controller_name);
      controller.set(property, value);
    },

    /**
     Using mockjax to stub an http request.
      @param {String} url request url
     @param {Object} json response
     @param {Object} options ajax request options
     */
    stubEndpointForHttpRequest: function stubEndpointForHttpRequest(url, json) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var request = {
        url: url,
        dataType: 'json',
        responseText: json,
        type: options.type || 'GET',
        status: options.status || 200
      };
      if (options.urlParams) {
        request.urlParams = options.urlParams;
      }
      if (options.data) {
        request.data = options.data;
      }

      return _jquery['default'].mockjax(request);
    },
    /**
     Handling ajax GET for handling finding a model
     You can mock failed find by calling `fails()`
      ```js
     // Typically you will use like:
      // To return default factory 'user'
     let mockFind = TestHelper.mockFind('user');
     let userId = mockFind.get('id');
      // or to return custom factory built json object
     let json = FactoryGuy.build('user', 'with_whacky_name', {isDude: true});
     let mockFind = TestHelper.mockFind('user').returns({json});
     let userId = json.get('id');
      // To mock failure case use method fails
     TestHelper.mockFind('user').fails();
      // Then to 'find' the user
     store.find('user', userId);
      // or in acceptance test
     visit('/user'+userId);
     ```
      @param {String} name  name of the fixture ( or modelName ) to find
     @param {String} trait  optional traits (one or more)
     @param {Object} opts  optional fixture options
     */
    mockFind: function mockFind() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var modelName = args[0];

      _ember['default'].assert('[ember-data-factory-guy] mockFind requires at least a model\n     name as first parameter', args.length > 0);

      var json = _emberDataFactoryGuyFactoryGuy['default'].build.apply(_emberDataFactoryGuyFactoryGuy['default'], arguments);
      return new _emberDataFactoryGuyMocksMockFindRequest['default'](modelName).returns({ json: json });
    },
    handleFind: function handleFind() {
      _ember['default'].deprecate("`handleFind` - has been deprecated. Use `mockFind` method instead`", false, { id: 'ember-data-factory-guy.handle-find', until: '2.4.0' });
      return this.mockFind.apply(this, arguments);
    },
    /**
     Handling ajax GET for reloading a record
     You can mock failed find by calling fails
      ```js
     // Typically you will make a model
     let user = make('user');
     // and then to handle reload, use the testHelper.mockReload call to mock a reload
     testHelper.mockReload(user);
      // to mock failure case use method fails
     testHelper.mockReload(user).fails();
     ```
      @param {String} type  model type like 'user' for User model, or a model instance
     @param {String} id  id of record to find
     */
    mockReload: function mockReload() {
      var args = Array.prototype.slice.call(arguments);

      var modelName = undefined,
          id = undefined;
      if (args[0] instanceof _emberData['default'].Model) {
        var record = args[0];
        modelName = record.constructor.modelName;
        id = record.id;
      } else if (typeof args[0] === "string" && typeof parseInt(args[1]) === "number") {
        modelName = args[0];
        id = args[1];
      }

      _ember['default'].assert("To handleFind pass in a model instance or a model type name and an id", modelName && id);

      var json = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertForBuild(modelName, { id: id });
      return new _emberDataFactoryGuyMocksMockReloadRequest['default'](modelName).returns({ json: json });
    },
    handleReload: function handleReload() {
      _ember['default'].deprecate("`handleReload` - has been deprecated. Use `mockReload` method instead`", false, { id: 'ember-data-factory-guy.handle-reload', until: '2.4.0' });
      return this.mockReload.apply(this, arguments);
    },
    /**
     Handling ajax GET for finding all records for a type of model.
     You can mock failed find by passing in success argument as false.
      ```js
     // Pass in the parameters you would normally pass into FactoryGuy.makeList,
     // like fixture name, number of fixtures to make, and optional traits,
     // or fixture options
     let mockFindAll = testHelper.mockFindAll('user', 2, 'with_hats');
      // or to return custom FactoryGuy built json object
     let json = FactoryGuy.buildList('user', 'with_whacky_name', {isDude: true});
     let mockFindAll = TestHelper.mockFindAll('user').returns({json});
      store.findAll('user').then(function(users){
        // 2 users, fisrt with whacky name, second isDude
     });
     ```
      @param {String} name  name of the fixture ( or model ) to find
     @param {Number} number  number of fixtures to create
     @param {String} trait  optional traits (one or more)
     @param {Object} opts  optional fixture options
     */
    mockFindAll: function mockFindAll() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var modelName = args[0];

      _ember['default'].assert('[ember-data-factory-guy] mockFindAll requires at least a model\n     name as first parameter', args.length > 0);

      var mockFindAll = new _emberDataFactoryGuyMocksMockFindAllRequest['default'](modelName);

      if (args.length > 1) {
        var json = _emberDataFactoryGuyFactoryGuy['default'].buildList.apply(_emberDataFactoryGuyFactoryGuy['default'], args);
        mockFindAll.returns({ json: json });
      }
      return mockFindAll;
    },
    handleFindAll: function handleFindAll() {
      _ember['default'].deprecate("`handleFindAll` - has been deprecated. Use `mockFindAll` method instead`", false, { id: 'ember-data-factory-guy.handle-find-all', until: '2.4.0' });
      return this.mockFindAll.apply(this, arguments);
    },
    /**
     Handling ajax GET for finding all records for a type of model with query parameters.
       ```js
      // Create model instances
     let users = FactoryGuy.makeList('user', 2, 'with_hats');
      // Pass in the array of model instances as last argument
     testHelper.mockQuery('user', {name:'Bob', age: 10}).returns({models: users});
      store.query('user', {name:'Bob', age: 10}}).then(function(userInstances){
       // userInstances will be the same of the users that were passed in
     })
     ```
      By omitting the last argument (pass in no records), this simulates a findQuery
     request that returns no records
      ```js
     // Simulate a query that returns no results
     testHelper.mockQuery('user', {age: 10000});
      store.query('user', {age: 10000}}).then(function(userInstances){
       // userInstances will be empty
     })
     ```
      @param {String} modelName  name of the mode like 'user' for User model type
     @param {String} queryParams  the parameters that will be queried
     @param {Array}  array of DS.Model records to be 'returned' by query
     */
    mockQuery: function mockQuery(modelName, queryParams) {
      if (queryParams) {
        _ember['default'].assert('The second argument ( queryParams ) must be an object', _ember['default'].typeOf(queryParams) === 'object');
      }

      return new _emberDataFactoryGuyMocksMockQueryRequest['default'](modelName, queryParams);
    },
    handleQuery: function handleQuery() {
      _ember['default'].deprecate("`handleQuery` - has been deprecated. Use `mockQuery` method instead`", false, { id: 'ember-data-factory-guy.handle-query', until: '2.4.0' });
      return this.mockQuery.apply(this, arguments);
    },
    /**
     Handling ajax GET for finding one record for a type of model with query parameters.
       ```js
      // Create json payload
     let json = FactoryGuy.build('user');
      // Pass in the json in a returns method
     testHelper.mockQueryRecord('user', {name:'Bob', age: 10}).returns({json});
      store.query('user', {name:'Bob', age: 10}}).then(function(userInstance){
       // userInstance will be created from the json payload
     })
     ```
      ```js
      // Create model instance
     let user = FactoryGuy.make('user');
      // Pass in the array of model instances in the returns method
     testHelper.mockQueryRecord('user', {name:'Bob', age: 10}).returns({model:user});
      store.query('user', {name:'Bob', age: 10}}).then(function(userInstance){
       // userInstance will be the same of the users that were passed in
     })
     ```
      By not using returns method to return anything, this simulates a
     store.queryRecord request that returns no records
      ```js
     // Simulate a store.queryRecord that returns no results
     testHelper.mockQueryRecord('user', {age: 10000});
      store.queryRecord('user', {age: 10000}}).then(function(userInstance){
       // userInstance will be empty
     })
     ```
      @param {String} modelName  name of the mode like 'user' for User model type
     @param {String} queryParams  the parameters that will be queried
     @param {Object|DS.Model}  JSON object or DS.Model record to be 'returned' by query
     */
    mockQueryRecord: function mockQueryRecord(modelName, queryParams) {
      if (queryParams) {
        _ember['default'].assert('The second argument ( queryParams ) must be an object', _ember['default'].typeOf(queryParams) === 'object');
      }

      return new _emberDataFactoryGuyMocksMockQueryRecordRequest['default'](modelName, queryParams);
    },
    handleQueryRecord: function handleQueryRecord() {
      _ember['default'].deprecate("`handleQueryRecord` - has been deprecated. Use `mockQueryRecord` method instead`", false, { id: 'ember-data-factory-guy.handle-query-record', until: '2.4.0' });
      return this.mockQueryRecord.apply(this, arguments);
    },
    /**
     Handling ajax POST ( create record ) for a model.
      ```js
     mockCreate('post')
     mockCreate('post').match({title: 'foo'});
     mockCreate('post').match({title: 'foo', user: user});
     mockCreate('post').andReturn({createdAt: new Date()});
     mockCreate('post').match({title: 'foo'}).andReturn({createdAt: new Date()});
     mockCreate('post').match({title: 'foo'}.fails();
     ```
      match - attributes that must be in request json,
     andReturn - attributes to include in response json,
     fails - can include optional status and response attributes
      ```js
     TestHelper.mockCreate('project').fails({
          status: 422, response: {errors: {name: ['Moo bad, Bahh better']}}
        });
     ```
      Note:
     1) Any attributes in match will be added to the response json automatically,
     so you don't need to include them in the returns hash.
      2) As long as all the match attributes are found in the record being created,
     the create will succeed. In other words, there may be other attributes in the
     createRecord call, but you don't have to match them all. For example:
      ```js
     mockCreate('post').match({title: 'foo'});
     store.createRecord('post', {title: 'foo', created_at: new Date()})
     ```
      2) If you match on a belongsTo association, you don't have to include that in the
     returns hash either.
      @param {String} modelName  name of model your creating like 'profile' for Profile
     @param {Object} options  hash of options for handling request
     */
    mockCreate: function mockCreate(modelName) {
      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var url = _emberDataFactoryGuyFactoryGuy['default'].buildURL(modelName);
      return new _emberDataFactoryGuyMocksMockCreateRequest['default'](url, modelName, opts);
    },
    handleCreate: function handleCreate() {
      _ember['default'].deprecate("`handleCreate` - has been deprecated. Use `mockCreate` method instead`", false, { id: 'ember-data-factory-guy.handle-create', until: '2.4.0' });
      return this.mockCreate.apply(this, arguments);
    },
    /**
     Handling ajax PUT ( update record ) for a model type. You can mock
     failed update by calling 'fails' method after setting up the mock
      ```js
     // Typically you will make a model
     let user = make('user');
     // and then to handle update, use the testHelper.mockUpdate call to mock a update
     testHelper.mockUpdate(user);
     or
     // testHelper.mockUpdate('user', user.id);
      // and to mock failure case use method fails
     testHelper.mockUpdate(user).fails();
     ```
      @param {String} type  model type like 'user' for User model, or a model instance
     @param {String} id  id of record to update
     @param {Object} options options object
     */
    mockUpdate: function mockUpdate() {
      var args = Array.prototype.slice.call(arguments);
      _ember['default'].assert("To mockUpdate pass in a model instance or a type and an id", args.length > 0);

      var options = {};
      if (args.length > 1 && typeof args[args.length - 1] === 'object') {
        options = args.pop();
      }

      var model = undefined,
          type = undefined,
          id = undefined;
      var store = _emberDataFactoryGuyFactoryGuy['default'].store;

      if (args[0] instanceof _emberData['default'].Model) {
        model = args[0];
        id = model.id;
        type = model.constructor.modelName;
      } else if (typeof args[0] === "string" && typeof parseInt(args[1]) === "number") {
        type = args[0];
        id = args[1];
        model = store.peekRecord(type, id);
      }
      _ember['default'].assert("To mockUpdate pass in a model instance or a model type name and an id", type && id);

      var url = _emberDataFactoryGuyFactoryGuy['default'].buildURL(type, id);
      return new _emberDataFactoryGuyMocksMockUpdateRequest['default'](url, model, options);
    },
    handleUpdate: function handleUpdate() {
      _ember['default'].deprecate("`handleUpdate` - has been deprecated. Use `mockUpdate` method instead`", false, { id: 'ember-data-factory-guy.handle-update', until: '2.4.0' });
      return this.mockUpdate.apply(this, arguments);
    },
    /**
     Handling ajax DELETE ( delete record ) for a model type. You can mock
     failed delete by passing in success argument as false.
      @param {String} type  model type like 'user' for User model
     @param {String} id  id of record to update
     @param {Boolean} succeed  optional flag to indicate if the request
     should succeed ( default is true )
     */
    mockDelete: function mockDelete(type, id) {
      var succeed = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      // TODO Turn this into a MockClass so it provides `andSuccess`, `fails`, `returns`...
      //succeed = succeed === undefined ? true : succeed;
      this.stubEndpointForHttpRequest(_emberDataFactoryGuyFactoryGuy['default'].buildURL(type, id), null, {
        type: 'DELETE',
        status: succeed ? 200 : 500
      });
    },
    handleDelete: function handleDelete() {
      _ember['default'].deprecate("`handleDelete` - has been deprecated. Use `mockDelete` method instead`", false, { id: 'ember-data-factory-guy.handle-delete', until: '2.4.0' });
      return this.mockDelete.apply(this, arguments);
    }

  });

  var mockServer = MockServer.create();

  var mockSetup = mockServer.setup.bind(mockServer);
  var mockTeardown = mockServer.teardown.bind(mockServer);

  var mockFind = mockServer.mockFind.bind(mockServer);
  var mockFindAll = mockServer.mockFindAll.bind(mockServer);
  var mockReload = mockServer.mockReload.bind(mockServer);
  var mockQuery = mockServer.mockQuery.bind(mockServer);
  var mockQueryRecord = mockServer.mockQueryRecord.bind(mockServer);
  var mockCreate = mockServer.mockCreate.bind(mockServer);
  var mockUpdate = mockServer.mockUpdate.bind(mockServer);
  var mockDelete = mockServer.mockDelete.bind(mockServer);

  exports.mockSetup = mockSetup;
  exports.mockTeardown = mockTeardown;
  exports.mockFind = mockFind;
  exports.mockFindAll = mockFindAll;
  exports.mockReload = mockReload;
  exports.mockQuery = mockQuery;
  exports.mockQueryRecord = mockQueryRecord;
  exports.mockCreate = mockCreate;
  exports.mockUpdate = mockUpdate;
  exports.mockDelete = mockDelete;
  exports['default'] = mockServer;
});
define('ember-data-factory-guy/factory-guy', ['exports', 'ember', 'ember-data', 'ember-data-factory-guy/model-definition', 'ember-data-factory-guy/builder/fixture-builder-factory'], function (exports, _ember, _emberData, _emberDataFactoryGuyModelDefinition, _emberDataFactoryGuyBuilderFixtureBuilderFactory) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var assign = _ember['default'].assign || _ember['default'].merge;
  var modelDefinitions = {};

  /**
   Given a fixture name like 'person' or 'dude' determine what model this name
   refers to. In this case it's 'person' for each one.
  
   @param {String} name  a fixture name could be model name like 'person'
   or a named person in model definition like 'dude'
   @returns {String} model  name associated with fixture name or undefined if not found
   */
  var lookupModelForFixtureName = function lookupModelForFixtureName(name) {
    var definition = lookupDefinitionForFixtureName(name);
    if (definition) {
      return definition.modelName;
    }
  };

  /**
  
   @param {String} name a fixture name could be model name like 'person'
   or a named person in model definition like 'dude'
   @returns {ModelDefinition} ModelDefinition associated with model or undefined if not found
   */
  var lookupDefinitionForFixtureName = function lookupDefinitionForFixtureName(name) {
    for (var model in modelDefinitions) {
      var definition = modelDefinitions[model];
      if (definition.matchesName(name)) {
        return definition;
      }
    }
  };

  var extractArgumentsShort = function extractArgumentsShort() {
    var opts = {};

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (_ember['default'].typeOf(args[args.length - 1]) === 'object') {
      opts = args.pop();
    }
    // whatever is left are traits
    var traits = _ember['default'].A(args).compact();
    return { opts: opts, traits: traits };
  };

  /**
   extract arguments for build and make function
   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Object} json fixture
   */
  var extractArguments = function extractArguments() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var name = args.shift();
    if (!name) {
      throw new Error('Build needs a factory name to build');
    }
    return assign({ name: name }, extractArgumentsShort.apply(this, args));
  };

  var FactoryGuy = (function () {
    function FactoryGuy() {
      _classCallCheck(this, FactoryGuy);
    }

    _createClass(FactoryGuy, [{
      key: 'setStore',
      value: function setStore(aStore) {
        _ember['default'].assert("FactoryGuy#setStore needs a valid store instance.You passed in [" + aStore + "]", aStore instanceof _emberData['default'].Store);
        this.store = aStore;
        var fixtureBuilderFactory = new _emberDataFactoryGuyBuilderFixtureBuilderFactory['default'](this.store);
        this.fixtureBuilder = fixtureBuilderFactory.fixtureBuilder();
      }
    }, {
      key: 'updateHTTPMethod',
      value: function updateHTTPMethod() {
        return this.fixtureBuilder.updateHTTPMethod || 'PUT';
      }

      /**
       ```javascript
        Person = DS.Model.extend({
         type: DS.attr('string'),
         name: DS.attr('string')
       })
        FactoryGuy.define('person', {
         sequences: {
           personName: function(num) {
             return 'person #' + num;
           },
           personType: function(num) {
             return 'person type #' + num;
           }
         },
         default: {
           type: 'normal',
           name: FactoryGuy.generate('personName')
         },
         dude: {
           type: FactoryGuy.generate('personType')
         },
       });
        ```
        For the Person model, you can define named fixtures like 'dude' or
       just use 'person' and get default values.
        And to get those fixtures you would call them this way:
        FactoryGuy.build('dude') or FactoryGuy.build('person')
        @param {String} model the model to define
       @param {Object} config your model definition
       */
    }, {
      key: 'define',
      value: function define(model, config) {
        modelDefinitions[model] = new _emberDataFactoryGuyModelDefinition['default'](model, config);
      }

      /*
       @param model name of named fixture type like: 'admin' or model name like 'user'
       @returns {ModelDefinition} if there is one matching that name
       */
    }, {
      key: 'findModelDefinition',
      value: function findModelDefinition(model) {
        return modelDefinitions[model];
      }

      /**
       Used in model definitions to declare use of a sequence. For example:
        ```
        FactoryGuy.define('person', {
         sequences: {
           personName: function(num) {
             return 'person #' + num;
           }
         },
         default: {
           name: FactoryGuy.generate('personName')
         }
       });
        ```
        @param   {String|Function} value previously declared sequence name or
       an inline function to use as the sequence
       @returns {Function} wrapper function that is called by the model
       definition containing the sequence
       */
    }, {
      key: 'generate',
      value: function generate(nameOrFunction) {
        var sortaRandomName = Math.floor((1 + Math.random()) * 65536).toString(16) + Date.now();
        return function () {
          // this function will be called by ModelDefinition, which has it's own generate method
          if (_ember['default'].typeOf(nameOrFunction) === 'function') {
            return this.generate(sortaRandomName, nameOrFunction);
          } else {
            return this.generate(nameOrFunction);
          }
        };
      }

      /**
       Used in model definitions to define a belongsTo association attribute.
       For example:
        ```
       FactoryGuy.define('project', {
           default: {
             title: 'Project'
           },
            // setup named project with built in associated user
           project_with_admin: {
             user: FactoryGuy.belongsTo('admin')
           }
            // or use as a trait
           traits: {
             with_admin: {
               user: FactoryGuy.belongsTo('admin')
             }
           }
         })
       ```
        @param   {String} fixtureName fixture name
       @param   {Object} opts options
       @returns {Function} wrapper function that will build the association json
       */
    }, {
      key: 'belongsTo',
      value: function belongsTo(fixtureName, opts) {
        var _this = this;

        return function () {
          return _this.buildRaw(fixtureName, opts);
        };
      }

      /**
       Used in model definitions to define a hasMany association attribute.
       For example:
        ```
       FactoryGuy.define('user', {
         default: {
           name: 'Bob'
         },
          // define the named user type that will have projects
         user_with_projects: { FactoryGuy.hasMany('project', 2) }
          // or use as a trait
         traits: {
           with_projects: {
             projects: FactoryGuy.hasMany('project', 2)
           }
         }
       })
        ```
        @param   {String} fixtureName fixture name
       @param   {Number} number of hasMany association items to build
       @param   {Object} opts options
       @returns {Function} wrapper function that will build the association json
       */
    }, {
      key: 'hasMany',
      value: function hasMany(fixtureName, number, opts) {
        var _this2 = this;

        return function () {
          return _this2.buildRawList(fixtureName, number, opts);
        };
      }

      /**
       Build fixtures for model or specific fixture name.
        For example:
        ```
        FactoryGuy.build('user') for User model
       FactoryGuy.build('bob') for a 'bob' User
       FactoryGuy.build('bob', 'dude') for a 'bob' User with dude traits
       FactoryGuy.build('bob', 'dude', 'funny') for a 'bob' User with dude and funny traits
       FactoryGuy.build('bob', 'dude', {name: 'wombat'}) for a 'bob' User with dude trait and custom attribute name of 'wombat'
        ```
        @param {String} name  fixture name
       @param {String} trait  optional trait names ( one or more )
       @param {Object} opts  optional fixture options that will override default fixture values
       @returns {Object} json fixture
       */
    }, {
      key: 'build',
      value: function build() {
        var args = extractArguments.apply(this, arguments);
        var fixture = this.buildRaw.apply(this, arguments);
        var modelName = lookupModelForFixtureName(args.name);

        return this.fixtureBuilder.convertForBuild(modelName, fixture);
      }
    }, {
      key: 'buildRaw',
      value: function buildRaw() {
        var args = extractArguments.apply(this, arguments);

        var definition = lookupDefinitionForFixtureName(args.name);
        if (!definition) {
          throw new Error('Can\'t find that factory named [' + args.name + ']');
        }

        return definition.build(args.name, args.opts, args.traits);
      }

      /**
       Build list of fixtures for model or specific fixture name. For example:
        ```
        FactoryGuy.buildList('user') // for 0 User models
       FactoryGuy.buildList('user', 2) // for 2 User models
       FactoryGuy.build('bob', 2) // for 2 User model with bob attributes
       FactoryGuy.build('bob', 'with_car', ['with_car',{name: "Dude"}])
        // 2 User model with bob attributes, where the first also has 'with_car' trait
        // the last has 'with_car' trait and name of "Dude"
        ```
        @param {String} name  fixture name
       @param {Number} number  number of fixtures to create
       @param {String} trait  optional traits (one or more)
       @param {Object} opts  optional fixture options that will override default fixture values
       @returns {Array} list of fixtures
       */
    }, {
      key: 'buildList',
      value: function buildList() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        _ember['default'].assert("buildList needs at least a name ( of model or named factory definition )", args.length > 0);

        var list = this.buildRawList.apply(this, arguments);

        var name = args.shift();
        var modelName = lookupModelForFixtureName(name);
        return this.fixtureBuilder.convertForBuild(modelName, list);
      }
    }, {
      key: 'buildRawList',
      value: function buildRawList() {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        var name = args.shift();
        var definition = lookupDefinitionForFixtureName(name);
        if (!definition) {
          throw new Error("Can't find that factory named [" + name + "]");
        }
        var number = args[0] || 0;
        if (typeof number === 'number') {
          args.shift();
          var parts = extractArgumentsShort.apply(this, args);
          return definition.buildList(name, number, parts.traits, parts.opts);
        } else {
          return args.map(function (innerArgs) {
            if (_ember['default'].typeOf(innerArgs) !== 'array') {
              innerArgs = [innerArgs];
            }
            var parts = extractArgumentsShort.apply(this, innerArgs);
            return definition.build(name, parts.opts, parts.traits);
          });
        }
      }

      /**
       Make new fixture and save to store.
        @param {String} name  fixture name
       @param {String} trait  optional trait names ( one or more )
       @param {Object} options  optional fixture options that will override default fixture values
       @returns {DS.Model} record
      */
    }, {
      key: 'make',
      value: function make() {
        var _this3 = this;

        var args = extractArguments.apply(this, arguments);

        _ember['default'].assert('FactoryGuy does not have the application\'s store.\n       Use manualSetup(this.container) in model/component test\n       before using make/makeList', this.store);

        var modelName = lookupModelForFixtureName(args.name);
        var fixture = this.buildRaw.apply(this, arguments);
        var data = this.fixtureBuilder.convertForMake(modelName, fixture);

        var model = _ember['default'].run(function () {
          return _this3.store.push(data);
        });

        var definition = lookupDefinitionForFixtureName(args.name);
        if (definition.hasAfterMake()) {
          definition.applyAfterMake(model, args.opts);
        }
        return model;
      }

      /**
       Make a list of model instances
        ```
        FactoryGuy.makeList('bob') // makes 0 bob's
         FactoryGuy.makeList('bob', 2) // makes 2 bob's
         FactoryGuy.makeList('bob', 2, 'with_car' , {name: "Dude"})
        // makes 2 bob's that have 'with_car' trait and name of "Dude"
         FactoryGuy.makeList('bob', 'with_car', ['with_car',{name: "Dude"}])
        // 2 User model with bob attributes, where the first also has 'with_car' trait
        // the last has 'with_car' trait and name of "Dude"
       ```
        @param {String} name name of fixture
       @param {Number} number number to create
       @param {String} trait  optional trait names ( one or more )
       @param {Object} options  optional fixture options that will override default fixture values
       @returns {Array} list of json fixtures or records depending on the adapter type
       */
    }, {
      key: 'makeList',
      value: function makeList() {
        var _this4 = this;

        _ember['default'].assert('FactoryGuy does not have the application\'s store.\n       Use manualSetup(this.container) in model/component test\n       before using make/makeList', this.store);

        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        _ember['default'].assert("makeList needs at least a name ( of model or named factory definition )", args.length >= 1);

        var name = args.shift();
        var definition = lookupDefinitionForFixtureName(name);
        _ember['default'].assert("Can't find that factory named [" + name + "]", !!definition);

        var number = args[0] || 0;
        if (typeof number === 'number') {
          args.shift();
          var arr = [];
          for (var i = 0; i < number; i++) {
            arr.push(this.make.apply(this, [name].concat(args)));
          }
          return arr;
        }

        return args.map(function (innerArgs) {
          if (_ember['default'].typeOf(innerArgs) !== 'array') {
            innerArgs = [innerArgs];
          }
          return _this4.make.apply(_this4, [name].concat(_toConsumableArray(innerArgs)));
        });
      }

      /**
       Clear model instances from store cache.
       Reset the id sequence for the models back to zero.
       */
    }, {
      key: 'clearStore',
      value: function clearStore() {
        this.resetDefinitions();
        this.clearModels();
      }

      /**
       Reset the id sequence for the models back to zero.
       */
    }, {
      key: 'resetDefinitions',
      value: function resetDefinitions() {
        for (var model in modelDefinitions) {
          var definition = modelDefinitions[model];
          definition.reset();
        }
      }

      /**
       Clear model instances from store cache.
       */
    }, {
      key: 'clearModels',
      value: function clearModels() {
        this.store.unloadAll();
      }

      /**
       Push fixture to model's FIXTURES array.
       Used when store's adapter is a DS.FixtureAdapter.
        @param {DS.Model} modelClass
       @param {Object} fixture the fixture to add
       @returns {Object} json fixture data
       */
    }, {
      key: 'pushFixture',
      value: function pushFixture(modelClass, fixture) {
        var index = undefined;
        if (!modelClass.FIXTURES) {
          modelClass.FIXTURES = [];
        }

        index = this.indexOfFixture(modelClass.FIXTURES, fixture);

        if (index > -1) {
          modelClass.FIXTURES.splice(index, 1);
        }

        modelClass.FIXTURES.push(fixture);

        return fixture;
      }

      /**
       Used in compliment with pushFixture in order to
       ensure we don't push duplicate fixtures
        @private
       @param {Array} fixtures
       @param {String|Integer} id of fixture to find
       @returns {Object} fixture
       */
    }, {
      key: 'indexOfFixture',
      value: function indexOfFixture(fixtures, fixture) {
        var index = -1,
            id = fixture.id + '';
        _ember['default'].A(fixtures).find(function (r, i) {
          if ('' + _ember['default'].get(r, 'id') === id) {
            index = i;
            return true;
          } else {
            return false;
          }
        });
        return index;
      }

      /**
       Clears all model definitions
       */
    }, {
      key: 'clearDefinitions',
      value: function clearDefinitions(opts) {
        if (!opts) {
          this.modelDefinitions = {};
        }
      }

      /**
       Build url's for the mockjax calls. Proxy to the adapters buildURL method.
        @param {String} typeName model type name like 'user' for User model
       @param {String} id
       @return {String} url
       */
    }, {
      key: 'buildURL',
      value: function buildURL(modelName) {
        var id = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        var adapter = this.store.adapterFor(modelName);
        return adapter.buildURL(modelName, id);
      }

      /**
       Change reload behavior to only used cached models for find/findAll.
       You still have to handle query calls, since they always ajax for data.
        @params {Array} except list of models you don't want to mark as cached
       */
    }, {
      key: 'cacheOnlyMode',
      value: function cacheOnlyMode() {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _ref$except = _ref.except;
        var except = _ref$except === undefined ? [] : _ref$except;

        var store = this.store;
        var findAdapter = store.adapterFor.bind(store);

        store.adapterFor = function (name) {
          var adapter = findAdapter(name);
          var shouldCache = function shouldCache() {
            if (_ember['default'].isPresent(except)) {
              return _ember['default'].A(except).contains(name);
            }
            return false;
          };
          adapter.shouldBackgroundReloadAll = shouldCache;
          adapter.shouldBackgroundReloadRecord = shouldCache;
          adapter.shouldReloadRecord = shouldCache;
          adapter.shouldReloadAll = shouldCache;
          return adapter;
        };
      }
    }]);

    return FactoryGuy;
  })();

  var factoryGuy = new FactoryGuy();

  var make = factoryGuy.make.bind(factoryGuy);
  var makeList = factoryGuy.makeList.bind(factoryGuy);
  var build = factoryGuy.build.bind(factoryGuy);
  var buildList = factoryGuy.buildList.bind(factoryGuy);
  var clearStore = factoryGuy.clearStore.bind(factoryGuy);

  exports.make = make;
  exports.makeList = makeList;
  exports.build = build;
  exports.buildList = buildList;
  exports.clearStore = clearStore;
  exports['default'] = factoryGuy;
});
define('ember-data-factory-guy/index', ['exports', 'ember-data-factory-guy/factory-guy', 'ember-data-factory-guy/factory-guy-test-helper', 'ember-data-factory-guy/utils/manual-setup'], function (exports, _emberDataFactoryGuyFactoryGuy, _emberDataFactoryGuyFactoryGuyTestHelper, _emberDataFactoryGuyUtilsManualSetup) {
  'use strict';

  exports['default'] = _emberDataFactoryGuyFactoryGuy['default'];
  exports.make = _emberDataFactoryGuyFactoryGuy.make;
  exports.makeList = _emberDataFactoryGuyFactoryGuy.makeList;
  exports.build = _emberDataFactoryGuyFactoryGuy.build;
  exports.buildList = _emberDataFactoryGuyFactoryGuy.buildList;
  exports.clearStore = _emberDataFactoryGuyFactoryGuy.clearStore;
  exports.manualSetup = _emberDataFactoryGuyUtilsManualSetup['default'];
  exports.mockSetup = _emberDataFactoryGuyFactoryGuyTestHelper.mockSetup;
  exports.mockTeardown = _emberDataFactoryGuyFactoryGuyTestHelper.mockTeardown;
  exports.mockFind = _emberDataFactoryGuyFactoryGuyTestHelper.mockFind;
  exports.mockFindAll = _emberDataFactoryGuyFactoryGuyTestHelper.mockFindAll;
  exports.mockReload = _emberDataFactoryGuyFactoryGuyTestHelper.mockReload;
  exports.mockQuery = _emberDataFactoryGuyFactoryGuyTestHelper.mockQuery;
  exports.mockQueryRecord = _emberDataFactoryGuyFactoryGuyTestHelper.mockQueryRecord;
  exports.mockCreate = _emberDataFactoryGuyFactoryGuyTestHelper.mockCreate;
  exports.mockUpdate = _emberDataFactoryGuyFactoryGuyTestHelper.mockUpdate;
  exports.mockDelete = _emberDataFactoryGuyFactoryGuyTestHelper.mockDelete;
});
define('ember-data-factory-guy/jsonapi-attribute-transformer', ['exports', 'ember', 'jquery'], function (exports, _ember, _jquery) {
  'use strict';

  /**
   * Attribute Transformer for JSONAPISerializer
   * The default transform is to dasherize.
   *
   * @constructor
   */
  var JSONAPIAttributeTransformer = function JSONAPIAttributeTransformer(store) {
    var defaultValueTransformFn = function defaultValueTransformFn(x) {
      return x;
    };

    /**
     * Transform attributes in fixture.
     *
     * @param fixture
     * @returns {*} new copy of old fixture with transformed attributes
     */
    this.transform = function (modelName, fixture) {
      var newData = undefined,
          included = [];
      if (_ember['default'].typeOf(fixture.data) === 'array') {
        newData = fixture.data.map(function (single) {
          var copy = _jquery['default'].extend(true, {}, single);
          transformSingle(modelName, copy);
          return copy;
        });
      } else {
        newData = _jquery['default'].extend(true, {}, fixture.data);
        transformSingle(modelName, newData);
      }
      if (fixture.included) {
        included = fixture.included.map(function (single) {
          var copy = _jquery['default'].extend(true, {}, single);
          transformSingle(modelName, copy);
          return copy;
        });
      }
      var newFixture = { data: newData };
      if (!_ember['default'].isEmpty(included)) {
        newFixture.included = included;
      }
      return newFixture;
    };
    /**
     Transform single record
      @param modelName
     @param fixture
     */
    var transformSingle = function transformSingle(modelName, fixture) {
      transformAttributes(modelName, fixture);
      findRelationships(modelName, fixture);
    };

    var transformAttributes = function transformAttributes(modelName, object) {
      if (object.attributes) {
        transformObjectValues(modelName, object.attributes);
        transformObjectKeys(modelName, object.attributes, 'Attribute');
      }
    };

    var transformRelationshipObjectKeys = function transformRelationshipObjectKeys(modelName, object) {
      transformObjectKeys(modelName, object, 'Relationship');
    };

    var transformObjectKeys = function transformObjectKeys(modelName, object, keyType) {
      var serializer = store.serializerFor(modelName);
      var transformFunction = serializer['keyFor' + keyType] || _ember['default'].String.dasherize;
      for (var key in object) {
        var value = object[key];
        var newKey = transformFunction(key);
        delete object[key];
        object[newKey] = value;
      }
    };

    /**
     Apply value transformers to attributes with custom type
      @param modelName
     @param object
     */
    var transformObjectValues = function transformObjectValues(modelName, object) {
      var model = store.modelFor(modelName);
      for (var key in object) {
        var attributeType = _ember['default'].get(model, 'transformedAttributes').get(key);
        var transformValue = getTransformValueFunction(attributeType);
        var value = object[key];
        object[key] = transformValue(value);
      }
    };

    /**
     Return a transform function for a custom attribute type (or the identity function otherwise).
      @param type
     */
    var getTransformValueFunction = function getTransformValueFunction(type) {
      var container = _ember['default'].getOwner ? _ember['default'].getOwner(store) : store.container;
      return type ? container.lookup('transform:' + type).serialize : defaultValueTransformFn;
    };

    /**
     Recursively descend into the fixture json, looking for relationships
     whose attributes need transforming
     */
    var findRelationships = function findRelationships(modelName, fixture) {
      var relationships = fixture.relationships;
      for (var key in relationships) {
        var data = relationships[key].data;
        if (_ember['default'].typeOf(data) === 'array') {
          for (var i = 0, len = data.length; i < len; i++) {
            transformAttributes(modelName, data[i]);
          }
        } else {
          transformAttributes(modelName, data);
        }
      }
      transformRelationshipObjectKeys(modelName, fixture.relationships);
    };
  };

  exports['default'] = JSONAPIAttributeTransformer;
});
define("ember-data-factory-guy/missing-sequence-error", ["exports"], function (exports) {
  "use strict";

  exports["default"] = function (message) {
    this.toString = function () {
      return message;
    };
  };
});
define('ember-data-factory-guy/mocks/mock-create-request', ['exports', 'ember', 'ember-data-factory-guy/factory-guy', 'jquery'], function (exports, _ember, _emberDataFactoryGuyFactoryGuy, _jquery) {
  'use strict';

  var MockCreateRequest = function MockCreateRequest(url, modelName, options) {
    var status = options.status;
    var succeed = options.succeed === undefined ? true : options.succeed;
    var matchArgs = options.match;
    var returnArgs = options.returns;
    var responseJson = {};
    var expectedRequest = {};
    var store = _emberDataFactoryGuyFactoryGuy['default'].store;

    this.calculate = function () {
      if (matchArgs) {
        // Using this technique to get properly serialized payload.
        // Although it's not ideal to have to create and delete a record,
        // TODO: Figure out how to use serializer without a record instance
        var tmpRecord = store.createRecord(modelName, matchArgs);
        expectedRequest = tmpRecord.serialize();
        tmpRecord.deleteRecord();
      }

      if (succeed) {
        var modelClass = store.modelFor(modelName);
        responseJson = _jquery['default'].extend({}, matchArgs, returnArgs);
        // Remove belongsTo associations since they will already be set when you called
        // createRecord, so they don't need to be returned.
        _ember['default'].get(modelClass, 'relationshipsByName').forEach(function (relationship) {
          if (relationship.kind === 'belongsTo') {
            delete responseJson[relationship.key];
          }
        });
      }
    };

    this.match = function (matches) {
      matchArgs = matches;
      this.calculate();
      return this;
    };

    this.returns = function (returns) {
      returnArgs = returns;
      this.calculate();
      return this;
    };

    this.andReturn = function (returns) {
      _ember['default'].deprecate('[ember-data-factory-guy] mockCreate.andReturn method has been deprecated.\n        Use chainable method `returns()` instead', !options.hasOwnProperty('succeed'), { id: 'ember-data-factory-guy.handle-create-and-return', until: '2.4.0' });
      return this.returns(returns);
    };

    this.andFail = function () {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _ember['default'].deprecate("`andFail` - has been deprecated. Use `fails(options)` method instead`", false, { id: 'ember-data-factory-guy.and-fail', until: '2.4.0' });
      return this.fails(options);
    };

    this.fails = function () {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      succeed = false;
      status = options.status || 500;
      if (options.response) {
        var errors = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertResponseErrors(options.response);
        responseJson = errors;
      }
      return this;
    };

    // for supporting older ( non chaining methods ) style of passing in options
    _ember['default'].deprecate('[ember-data-factory-guy] TestHelper.mockCreate - options.succeed has been deprecated.\n      Use chainable method `andFail()` instead', !options.hasOwnProperty('succeed'), { id: 'ember-data-factory-guy.handle-create-succeed-options', until: '2.4.0' });
    _ember['default'].deprecate('[ember-data-factory-guy] TestHelper.mockCreate - options.match has been deprecated.\n      Use chainable method `match()` instead', !options.hasOwnProperty('match'), { id: 'ember-data-factory-guy.handle-create-match-options', until: '2.4.0' });
    _ember['default'].deprecate('[ember-data-factory-guy] TestHelper.mockCreate - options.returns has been deprecated.\n      Use chainable method `returns()` instead', !options.hasOwnProperty('returns'), { id: 'ember-data-factory-guy.handle-create-returns-options', until: '2.4.0' });
    if (succeed) {
      this.calculate();
    } else {
      this.fails(options);
    }

    var attributesMatch = function attributesMatch(requestData, expectedData) {
      // convert to json-api style data for standardization purposes
      var allMatch = true;
      if (!expectedData.data) {
        expectedData = store.normalize(modelName, expectedData);
      }
      if (!requestData.data) {
        var serializer = store.serializerFor(modelName);
        var transformedModelKey = serializer.payloadKeyFromModelName(modelName);
        if (requestData[transformedModelKey]) {
          requestData = store.normalize(modelName, requestData[transformedModelKey]);
        }
      }
      var expectedAttributes = expectedData.data.attributes;
      var requestedAttributes = requestData.data.attributes;
      for (var attribute in expectedAttributes) {
        if (expectedAttributes[attribute]) {
          // compare as strings for date comparison
          var requestAttribute = requestedAttributes[attribute].toString();
          var expectedAttribute = expectedAttributes[attribute].toString();
          if (requestAttribute !== expectedAttribute) {
            allMatch = false;
            break;
          }
        }
      }
      return allMatch;
    };

    /*
     Setting the id at the very last minute, so that calling calculate
     again and again does not mess with id, and it's reset for each call.
     */
    function modelId() {
      if (_ember['default'].isPresent(returnArgs) && _ember['default'].isPresent(returnArgs['id'])) {
        return returnArgs['id'];
      } else {
        var definition = _emberDataFactoryGuyFactoryGuy['default'].findModelDefinition(modelName);
        return definition.nextId();
      }
    }

    this.handler = function (settings) {
      // need to clone the response since it could be used a few times in a row,
      // in a loop where you're doing createRecord of same model type
      var finalResponseJson = _jquery['default'].extend({}, true, responseJson);

      if (succeed) {
        if (matchArgs) {
          var requestData = JSON.parse(settings.data);
          if (!attributesMatch(requestData, expectedRequest)) {
            return false;
          }
        }
        this.status = 200;
        // Setting the id at the very last minute, so that calling calculate
        // again and again does not mess with id, and it's reset for each call
        finalResponseJson.id = modelId();
        finalResponseJson = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertForBuild(modelName, finalResponseJson);
      } else {
        this.status = status;
      }
      this.responseText = finalResponseJson;
    };

    var requestConfig = {
      url: url,
      dataType: 'json',
      type: 'POST',
      response: this.handler
    };

    _jquery['default'].mockjax(requestConfig);
  };

  exports['default'] = MockCreateRequest;
});
define('ember-data-factory-guy/mocks/mock-find-all-request', ['exports', 'ember-data-factory-guy/factory-guy', 'ember-data-factory-guy/mocks/mock-find-request'], function (exports, _emberDataFactoryGuyFactoryGuy, _emberDataFactoryGuyMocksMockFindRequest) {
  'use strict';

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var MockFindAllRequest = (function (_MockFindRequest) {
    _inherits(MockFindAllRequest, _MockFindRequest);

    function MockFindAllRequest(modelName) {
      _classCallCheck(this, MockFindAllRequest);

      _get(Object.getPrototypeOf(MockFindAllRequest.prototype), 'constructor', this).call(this, modelName);
      this.setValidReturnsKeys(['models', 'json', 'ids', 'headers']);
      this.setResponseJson(_emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertForBuild(modelName, []));
    }

    return MockFindAllRequest;
  })(_emberDataFactoryGuyMocksMockFindRequest['default']);

  exports['default'] = MockFindAllRequest;
});
define('ember-data-factory-guy/mocks/mock-find-request', ['exports', 'ember-data-factory-guy/factory-guy', 'ember-data-factory-guy/mocks/mock-get-request'], function (exports, _emberDataFactoryGuyFactoryGuy, _emberDataFactoryGuyMocksMockGetRequest) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var MockFindRequest = (function (_MockGetRequest) {
    _inherits(MockFindRequest, _MockGetRequest);

    function MockFindRequest(modelName) {
      _classCallCheck(this, MockFindRequest);

      _get(Object.getPrototypeOf(MockFindRequest.prototype), 'constructor', this).call(this, modelName);
      this.setValidReturnsKeys(['model', 'json', 'id', 'headers']);
    }

    _createClass(MockFindRequest, [{
      key: 'get',
      value: function get(args) {
        var json = this.getResponseJson();
        if (json.get) {
          return json.get(args);
        }
      }
    }, {
      key: 'getUrl',
      value: function getUrl() {
        return _emberDataFactoryGuyFactoryGuy['default'].buildURL(this.modelName, this.get('id'));
      }
    }]);

    return MockFindRequest;
  })(_emberDataFactoryGuyMocksMockGetRequest['default']);

  exports['default'] = MockFindRequest;
});
define('ember-data-factory-guy/mocks/mock-get-request', ['exports', 'ember', 'ember-data-factory-guy/factory-guy', 'ember-data', 'jquery'], function (exports, _ember, _emberDataFactoryGuyFactoryGuy, _emberData, _jquery) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var assign = _ember['default'].assign || _ember['default'].merge;

  var MockGetRequest = (function () {
    function MockGetRequest(modelName) {
      _classCallCheck(this, MockGetRequest);

      this.modelName = modelName;
      this.status = 200;
      this.succeed = true;
      this.responseHeaders = {};
      this.responseJson = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertForBuild(modelName, {});
      this.validReturnsKeys = [];
      this.handler = this.setupHandler();
      this.timesCalled = 0;
    }

    _createClass(MockGetRequest, [{
      key: 'setValidReturnsKeys',
      value: function setValidReturnsKeys(validKeys) {
        this.validReturnsKeys = validKeys;
      }
    }, {
      key: 'validateReturnsOptions',
      value: function validateReturnsOptions(options) {
        var responseKeys = Object.keys(options);
        _ember['default'].assert('[ember-data-factory-guy] You can pass zero or one one output key to \'returns\',\n                you passed these keys: ' + responseKeys, responseKeys.length <= 1);

        var _responseKeys = _slicedToArray(responseKeys, 1);

        var responseKey = _responseKeys[0];

        _ember['default'].assert('[ember-data-factory-guy] You passed an invalid key for \'returns\' function.\n      Valid keys are ' + this.validReturnsKeys + '. You used this key: ' + responseKey, _ember['default'].A(this.validReturnsKeys).contains(responseKey));

        return responseKey;
      }
    }, {
      key: 'returns',
      value: function returns() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var responseKey = this.validateReturnsOptions(options);
        this._setReturns(responseKey, options);
        return this;
      }
    }, {
      key: '_setReturns',
      value: function _setReturns(responseKey, options) {
        var _this = this;

        var json = undefined,
            model = undefined,
            models = undefined;
        switch (responseKey) {

          case 'id':
            model = _emberDataFactoryGuyFactoryGuy['default'].store.peekRecord(this.modelName, options.id);

            _ember['default'].assert('argument ( id ) should refer to a model of type ' + this.modelName + ' that is in\n         the store. But no ' + this.modelName + ' with id ' + options.id + ' was found in the store', model instanceof _emberData['default'].Model && model.constructor.modelName === this.modelName);

            return this.returns({ model: model });

          case 'model':
            model = options.model;

            _ember['default'].assert('argument ( model ) must be a DS.Model instance - found type:\'\n          ' + _ember['default'].typeOf(model), model instanceof _emberData['default'].Model);

            json = { id: model.id, type: model.constructor.modelName };
            this.responseJson = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertForBuild(this.modelName, json);
            break;

          case 'ids':
            var store = _emberDataFactoryGuyFactoryGuy['default'].store;
            models = options.ids.map(function (id) {
              return store.peekRecord(_this.modelName, id);
            });
            return this.returns({ models: models });

          case 'models':
            models = options.models;
            _ember['default'].assert('argument ( models ) must be an array - found type:\'\n          ' + _ember['default'].typeOf(models), _ember['default'].isArray(models));

            json = models.map(function (model) {
              return { id: model.id, type: model.constructor.modelName };
            });

            json = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertForBuild(this.modelName, json);
            this.setResponseJson(json);
            break;

          case 'json':
            this.responseJson = options.json;
            break;

          case 'attrs':
            var currentId = this.responseJson.get('id');
            var modelParams = assign({ id: currentId }, options.attrs);
            json = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertForBuild(this.modelName, modelParams);
            this.setResponseJson(json);
            break;

          case 'headers':
            this.addResponseHeaders(options.headers);
            break;
        }
      }
    }, {
      key: 'getUrl',
      value: function getUrl() {
        return _emberDataFactoryGuyFactoryGuy['default'].buildURL(this.modelName);
      }
    }, {
      key: 'setResponseJson',
      value: function setResponseJson(json) {
        this.responseJson = json;
      }
    }, {
      key: 'addResponseHeaders',
      value: function addResponseHeaders(headers) {
        assign(this.responseHeaders, headers);
      }
    }, {
      key: 'succeeds',
      value: function succeeds(options) {
        this.succeed = true;
        this.status = options && options.status || 200;
        return this;
      }
    }, {
      key: 'fails',
      value: function fails() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.succeed = false;
        this.status = options.status || 500;
        if (options.response) {
          var errors = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertResponseErrors(options.response);
          this.responseJson = errors;
        }
        return this;
      }
    }, {
      key: 'getSucceed',
      value: function getSucceed() {
        return this.succeed;
      }
    }, {
      key: 'getResponseJson',
      value: function getResponseJson() {
        return this.responseJson;
      }
    }, {
      key: 'getResponse',
      value: function getResponse() {
        return {
          responseText: this.responseJson,
          headers: this.responseHeaders,
          status: this.status
        };
      }
    }, {
      key: 'paramsMatch',
      value: function paramsMatch() {
        return true;
      }

      //////////////  common handler for all get requests ////////////
    }, {
      key: 'setupHandler',
      value: function setupHandler() {
        var handler = (function (settings) {
          if (!(settings.url === this.getUrl() && settings.type === "GET")) {
            return false;
          }
          if (this.getSucceed() && !this.paramsMatch(settings)) {
            return false;
          }
          this.timesCalled++;
          return this.getResponse();
        }).bind(this);

        _jquery['default'].mockjax(handler);

        return handler;
      }

      //////////////////  deprecated /////////////////////
    }, {
      key: 'returnsModels',
      value: function returnsModels(models) {
        _ember['default'].deprecate("`returnsModel` has been deprecated. Use `returns({ model })` instead.", false, { id: 'ember-data-factory-guy.returns-models', until: '2.4.0' });
        return this.returns({ models: models });
      }
    }, {
      key: 'returnsJSON',
      value: function returnsJSON(json) {
        _ember['default'].deprecate("`returnsJSON - has been deprecated. Use `returns({ json })` instead", false, { id: 'ember-data-factory-guy.returns-json', until: '2.4.0' });
        return this.returns({ json: json });
      }
    }, {
      key: 'returnsExistingIds',
      value: function returnsExistingIds(ids) {
        _ember['default'].deprecate("`returnsExistingIds` - has been deprecated. Use `returns({ ids })` method instead`", false, { id: 'ember-data-factory-guy.returns-json', until: '2.4.0' });

        return this.returns({ ids: ids });
      }
    }, {
      key: 'andFail',
      value: function andFail() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _ember['default'].deprecate("`andFail` - has been deprecated. Use `fails(options)` method instead`", false, { id: 'ember-data-factory-guy.and-fail', until: '2.4.0' });
        return this.fails(options);
      }
    }, {
      key: 'andSucceed',
      value: function andSucceed(options) {
        _ember['default'].deprecate("`andSucceed` - has been deprecated. Use `succeeds(options)` method instead`", false, { id: 'ember-data-factory-guy.and-succeed', until: '2.4.0' });
        return this.succeeds(options);
      }
    }]);

    return MockGetRequest;
  })();

  exports['default'] = MockGetRequest;
});
define('ember-data-factory-guy/mocks/mock-query-record-request', ['exports', 'ember-data-factory-guy/mocks/mock-query-request'], function (exports, _emberDataFactoryGuyMocksMockQueryRequest) {
  'use strict';

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var MockQueryRecordRequest = (function (_MockQueryRequest) {
    _inherits(MockQueryRecordRequest, _MockQueryRequest);

    function MockQueryRecordRequest(modelName) {
      var queryParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, MockQueryRecordRequest);

      _get(Object.getPrototypeOf(MockQueryRecordRequest.prototype), 'constructor', this).call(this, modelName, queryParams);
      this.setValidReturnsKeys(['model', 'json', 'id', 'headers']);
    }

    return MockQueryRecordRequest;
  })(_emberDataFactoryGuyMocksMockQueryRequest['default']);

  exports['default'] = MockQueryRecordRequest;
});
define('ember-data-factory-guy/mocks/mock-query-request', ['exports', 'ember-data-factory-guy/factory-guy', 'ember-data-factory-guy/utils/helper-functions', 'ember-data-factory-guy/mocks/mock-get-request', 'jquery'], function (exports, _emberDataFactoryGuyFactoryGuy, _emberDataFactoryGuyUtilsHelperFunctions, _emberDataFactoryGuyMocksMockGetRequest, _jquery) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var MockQueryRequest = (function (_MockGetRequest) {
    _inherits(MockQueryRequest, _MockGetRequest);

    function MockQueryRequest(modelName) {
      var queryParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, MockQueryRequest);

      _get(Object.getPrototypeOf(MockQueryRequest.prototype), 'constructor', this).call(this, modelName);
      this.setResponseJson(_emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertForBuild(modelName, []));
      this.setValidReturnsKeys(['models', 'json', 'ids', 'headers']);
      this.currentQueryParams = queryParams;
    }

    _createClass(MockQueryRequest, [{
      key: 'withParams',
      value: function withParams(queryParams) {
        this.currentQueryParams = queryParams;
        return this;
      }
    }, {
      key: 'paramsMatch',
      value: function paramsMatch(settings) {
        if (_jquery['default'].isEmptyObject(this.currentQueryParams)) {
          return true;
        }
        return (0, _emberDataFactoryGuyUtilsHelperFunctions.isEquivalent)(this.currentQueryParams, settings.data);
      }
    }]);

    return MockQueryRequest;
  })(_emberDataFactoryGuyMocksMockGetRequest['default']);

  exports['default'] = MockQueryRequest;
});
define('ember-data-factory-guy/mocks/mock-reload-request', ['exports', 'ember-data-factory-guy/mocks/mock-find-request'], function (exports, _emberDataFactoryGuyMocksMockFindRequest) {
  'use strict';

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var MockReloadRequest = (function (_MockFindRequest) {
    _inherits(MockReloadRequest, _MockFindRequest);

    function MockReloadRequest(modelName) {
      _classCallCheck(this, MockReloadRequest);

      _get(Object.getPrototypeOf(MockReloadRequest.prototype), 'constructor', this).call(this, modelName);
      this.setValidReturnsKeys(['attrs', 'json', 'headers']);
    }

    return MockReloadRequest;
  })(_emberDataFactoryGuyMocksMockFindRequest['default']);

  exports['default'] = MockReloadRequest;
});
define('ember-data-factory-guy/mocks/mock-update-request', ['exports', 'ember', 'jquery', 'ember-data-factory-guy/factory-guy'], function (exports, _ember, _jquery, _emberDataFactoryGuyFactoryGuy) {
  'use strict';

  var MockUpdateRequest = function MockUpdateRequest(url, model, options) {
    var status = options.status || 200;
    var succeed = true;
    var response = null;
    this.timesCalled = 0;
    var self = this;

    if ('succeed' in options) {
      _ember['default'].deprecate('[ember-data-factory-guy] TestHelper.mockUpdate - options.succeed has been deprecated.\n        Use chainable method `succeeds(options)` method instead', options.hasOwnProperty('succeed'), { id: 'ember-data-factory-guy.handle-update', until: '2.4.0' });
      succeed = options.succeed;
    }

    if ('response' in options) {
      response = options.response;
    }

    this.andSucceed = function (options) {
      _ember['default'].deprecate("`andSucceed` - has been deprecated. Use `succeeds(options)` method instead`", false, { id: 'ember-data-factory-guy.and-succeed', until: '2.4.0' });
      return this.succeeds(options);
    };

    this.succeeds = function (options) {
      succeed = true;
      status = options && options.status || 200;
      return this;
    };

    this.andFail = function () {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _ember['default'].deprecate("`andFail` - has been deprecated. Use `fails(options)` method instead`", false, { id: 'ember-data-factory-guy.and-fail', until: '2.4.0' });
      return this.fails(options);
    };

    this.fails = function (options) {
      succeed = false;
      status = options.status || 500;
      if ('response' in options) {
        response = options.response;
      }
      return this;
    };

    this.handler = function () {
      self.timesCalled++;
      if (!succeed) {
        this.status = status;
        if (response !== null) {
          this.responseText = response;
        }
      } else {
        // need to use serialize instead of toJSON to handle polymorphic belongsTo
        var json = model.serialize({ includeId: true });
        this.responseText = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.normalize(model.constructor.modelName, json);
        this.status = 200;
      }
    };
    var requestConfig = {
      url: url,
      dataType: 'json',
      type: _emberDataFactoryGuyFactoryGuy['default'].updateHTTPMethod(),
      response: this.handler
    };

    _jquery['default'].mockjax(requestConfig);
  };

  exports['default'] = MockUpdateRequest;
});
define('ember-data-factory-guy/model-definition', ['exports', 'ember', 'ember-data-factory-guy/factory-guy', 'ember-data-factory-guy/sequence', 'ember-data-factory-guy/missing-sequence-error', 'jquery'], function (exports, _ember, _emberDataFactoryGuyFactoryGuy, _emberDataFactoryGuySequence, _emberDataFactoryGuyMissingSequenceError, _jquery) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  /**
   A ModelDefinition encapsulates a model's definition
  
   @param model
   @param config
   @constructor
   */

  var ModelDefinition = (function () {
    function ModelDefinition(model, config) {
      _classCallCheck(this, ModelDefinition);

      this.modelName = model;
      this.modelId = 1;
      this.originalConfig = _jquery['default'].extend(true, {}, config);
      this.parseConfig(config);
    }

    /**
     Returns a model's full relationship if the field is a relationship.
      @param {String} field  field you want to relationship info for
     @returns {DS.Relationship} relationship object if the field is a relationship, null if not
     */

    _createClass(ModelDefinition, [{
      key: 'getRelationship',
      value: function getRelationship(field) {
        var modelClass = _emberDataFactoryGuyFactoryGuy['default'].store.modelFor(this.modelName);
        var relationship = _ember['default'].get(modelClass, 'relationshipsByName').get(field);
        return relationship || null;
      }

      /**
       Is this attribute a model fragment type
        @param {String} field  field you want to check
       @returns {Boolean} true if it's a model fragment
       */
    }, {
      key: 'isModelFragmentAttribute',
      value: function isModelFragmentAttribute(field) {
        var modelClass = _emberDataFactoryGuyFactoryGuy['default'].store.modelFor(this.modelName);
        var attributeInfo = _ember['default'].get(modelClass, 'attributes').get(field);
        return attributeInfo && attributeInfo.type.match('mf-fragment');
      }

      /**
       @param {String} name model name like 'user' or named type like 'admin'
       @returns {Boolean} true if name is this definitions model or this definition
       contains a named model with that name
       */
    }, {
      key: 'matchesName',
      value: function matchesName(name) {
        return this.modelName === name || this.namedModels[name];
      }

      // Increment id
    }, {
      key: 'nextId',
      value: function nextId() {
        return this.modelId++;
      }

      // Decrement id
    }, {
      key: 'backId',
      value: function backId() {
        return this.modelId--;
      }

      /**
       Call the next method on the named sequence function. If the name
       is a function, create the sequence with that function
        @param   {String} name previously declared sequence name or
       an the random name generate for inline functions
       @param   {Function} sequenceFn optional function to use as sequence
       @returns {String} output of sequence function
       */
    }, {
      key: 'generate',
      value: function generate(name, sequenceFn) {
        if (sequenceFn) {
          if (!this.sequences[name]) {
            // create and add that sequence function on the fly
            this.sequences[name] = new _emberDataFactoryGuySequence['default'](sequenceFn);
          }
        }
        var sequence = this.sequences[name];
        if (!sequence) {
          throw new _emberDataFactoryGuyMissingSequenceError['default']('Can not find that sequence named [' + name + '] in \'' + this.modelName + '\' definition');
        }
        return sequence.next();
      }

      /**
       Build a fixture by name
        @param {String} name fixture name
       @param {Object} opts attributes to override
       @param {String} traitArgs array of traits
       @returns {Object} json
       */
    }, {
      key: 'build',
      value: function build(name, opts, traitArgs) {
        var _this = this;

        var traitsObj = {};
        traitArgs.forEach(function (trait) {
          _jquery['default'].extend(traitsObj, _this.traits[trait]);
        });
        var modelAttributes = this.namedModels[name] || {};
        // merge default, modelAttributes, traits and opts to get the rough fixture
        var fixture = _jquery['default'].extend({}, this.defaultAttributes, modelAttributes, traitsObj, opts);

        // set the id, unless it was already set in opts
        if (!fixture.id) {
          // Setting a flag to indicate that this is a generated an id,
          // so it can be rolled back if the fixture throws an error.
          fixture._generatedId = true;
          fixture.id = this.nextId();
        }

        try {
          // deal with attributes that are functions or objects
          for (var attribute in fixture) {
            var attributeType = _ember['default'].typeOf(fixture[attribute]);
            if (attributeType === 'function') {
              this.addFunctionAttribute(fixture, attribute);
            } else if (attributeType === 'object') {
              this.addObjectAtribute(fixture, attribute);
            }
          }
        } catch (e) {
          if (fixture._generatedId) {
            this.backId();
          }
          throw e;
        }

        delete fixture._generatedId;
        return fixture;
      }

      // function might be a sequence, an inline attribute function or an association
    }, {
      key: 'addFunctionAttribute',
      value: function addFunctionAttribute(fixture, attribute) {
        fixture[attribute] = fixture[attribute].call(this, fixture);
      }
    }, {
      key: 'addObjectAtribute',
      value: function addObjectAtribute(fixture, attribute) {
        // If it's an object and it's a model association attribute, build the json
        // for the association and replace the attribute with that json
        var relationship = this.getRelationship(attribute);
        if (this.isModelFragmentAttribute(attribute)) {
          var payload = fixture[attribute];
          fixture[attribute] = _emberDataFactoryGuyFactoryGuy['default'].buildRaw(attribute, payload);
          return;
        }
        if (relationship) {
          var payload = fixture[attribute];
          if (!payload.isProxy) {
            fixture[attribute] = _emberDataFactoryGuyFactoryGuy['default'].buildRaw(relationship.type, payload);
          }
        }
      }

      /**
       Build a list of fixtures
        @param {String} name model name or named model type
       @param {Integer} number of fixtures to build
       @param {Array} array of traits to build with
       @param {Object} opts attribute options
       @returns array of fixtures
       */
    }, {
      key: 'buildList',
      value: function buildList(name, number, traits, opts) {
        var arr = [];
        for (var i = 0; i < number; i++) {
          arr.push(this.build(name, opts, traits));
        }
        return arr;
      }

      // Set the modelId back to 1, and reset the sequences
    }, {
      key: 'reset',
      value: function reset() {
        this.modelId = 1;
        for (var _name in this.sequences) {
          this.sequences[_name].reset();
        }
      }
    }, {
      key: 'hasAfterMake',
      value: function hasAfterMake() {
        return !!this.afterMake;
      }
    }, {
      key: 'applyAfterMake',
      value: function applyAfterMake(model, opts) {
        if (this.afterMake) {
          // passed in options override transient setting
          var options = _jquery['default'].extend({}, this.transient, opts);
          this.afterMake(model, options);
        }
      }

      /*
       Need special 'merge' function to be able to merge objects with functions
        @param newConfig
       @param config
       @param otherConfig
       @param section
       */
    }, {
      key: 'mergeSection',
      value: function mergeSection(config, otherConfig, section) {
        var attr = undefined;
        if (otherConfig[section]) {
          if (!config[section]) {
            config[section] = {};
          }
          for (attr in otherConfig[section]) {
            if (!config[section][attr]) {
              config[section][attr] = otherConfig[section][attr];
            }
          }
        }
      }

      /**
       When extending another definition, merge it with this one by:
       merging only sequences, default section and traits
        @param {Object} config
       @param {ModelDefinition} otherDefinition
       */
    }, {
      key: 'merge',
      value: function merge(config, otherDefinition) {
        var otherConfig = _jquery['default'].extend(true, {}, otherDefinition.originalConfig);
        delete otherConfig['extends'];
        this.mergeSection(config, otherConfig, 'sequences');
        this.mergeSection(config, otherConfig, 'default');
        this.mergeSection(config, otherConfig, 'traits');
      }
    }, {
      key: 'mergeConfig',
      value: function mergeConfig(config) {
        var extending = config['extends'];
        var definition = _emberDataFactoryGuyFactoryGuy['default'].findModelDefinition(extending);
        _ember['default'].assert('You are trying to extend [' + this.modelName + '] with [ ' + extending + ' ].\n      But FactoryGuy can\'t find that definition [ ' + extending + ' ]\n      you are trying to extend. Make sure it was created/imported before\n      you define [ ' + this.modelName + ' ]', definition);
        this.merge(config, definition);
      }
    }, {
      key: 'parseDefault',
      value: function parseDefault(config) {
        this.defaultAttributes = config['default'] || {};
        delete config['default'];
      }
    }, {
      key: 'parseTraits',
      value: function parseTraits(config) {
        this.traits = config.traits || {};
        delete config.traits;
      }
    }, {
      key: 'parseTransient',
      value: function parseTransient(config) {
        this.transient = config.transient || {};
        delete config.transient;
      }
    }, {
      key: 'parseCallBacks',
      value: function parseCallBacks(config) {
        this.afterMake = config.afterMake;
        delete config.afterMake;
      }
    }, {
      key: 'parseSequences',
      value: function parseSequences(config) {
        this.sequences = config.sequences || {};
        delete config.sequences;
        for (var sequenceName in this.sequences) {
          var sequenceFn = this.sequences[sequenceName];
          if (_ember['default'].typeOf(sequenceFn) !== 'function') {
            throw new Error('Problem with [' + sequenceName + '] sequence definition.\n          Sequences must be functions');
          }
          this.sequences[sequenceName] = new _emberDataFactoryGuySequence['default'](sequenceFn);
        }
      }
    }, {
      key: 'parseConfig',
      value: function parseConfig(config) {
        if (config['extends']) {
          this.mergeConfig(config);
        }
        this.parseSequences(config);
        this.parseTraits(config);
        this.parseDefault(config);
        this.parseTransient(config);
        this.parseCallBacks(config);
        this.namedModels = config;
      }
    }]);

    return ModelDefinition;
  })();

  exports['default'] = ModelDefinition;
});
define('ember-data-factory-guy/payload/json-api-payload', ['exports', 'ember', 'ember-data-factory-guy/payload/json-payload'], function (exports, _ember, _emberDataFactoryGuyPayloadJsonPayload) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var _default = (function (_JSONPayload) {
    _inherits(_default, _JSONPayload);

    function _default(modelName, json, converter) {
      _classCallCheck(this, _default);

      _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).call(this, modelName, json, converter);
      this.data = json.data;
      this.addProxyMethods(["includes"]);
    }

    _createClass(_default, [{
      key: 'getModelPayload',
      value: function getModelPayload() {
        return this.data;
      }
    }, {
      key: 'add',
      value: function add(moreJson) {
        var _this = this;

        if (!this.json.included) {
          this.json.included = [];
        }
        this.converter.included = this.json.included;
        // add the main moreJson model payload
        var data = moreJson.getModelPayload();
        if (_ember['default'].typeOf(data) === "array") {
          data.forEach(function (dati) {
            return _this.converter.addToIncluded(dati);
          });
        } else {
          this.converter.addToIncluded(data);
        }
        // add all of the moreJson's includes
        this.converter.addToIncludedFromProxy(moreJson);
        return this.json;
      }
    }, {
      key: 'createAttrs',
      value: function createAttrs(data) {
        var attrs = data.attributes;
        attrs.id = data.id;
        return attrs;
      }
    }, {
      key: 'includes',
      value: function includes() {
        return this.json.included || [];
      }
    }, {
      key: 'getObjectKeys',
      value: function getObjectKeys(key) {
        var attrs = this.createAttrs(this.data);
        if (!key) {
          return attrs;
        }
        return attrs[key];
      }
    }, {
      key: 'getListKeys',
      value: function getListKeys(key) {
        var _this2 = this;

        var attrs = this.data.map(function (data) {
          return _this2.createAttrs(data);
        });
        if (_ember['default'].isEmpty(key)) {
          return attrs;
        }
        if (typeof key === 'number') {
          return attrs[key];
        }
        if (key === 'firstObject') {
          return attrs[0];
        }
        if (key === 'lastObject') {
          return attrs[attrs.length - 1];
        }
      }
    }]);

    return _default;
  })(_emberDataFactoryGuyPayloadJsonPayload['default']);

  exports['default'] = _default;
});
define("ember-data-factory-guy/payload/json-payload", ["exports", "ember"], function (exports, _ember) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var _Ember$String = _ember["default"].String;
  var pluralize = _Ember$String.pluralize;
  var w = _Ember$String.w;

  var _default = (function () {

    /**
     Proxy class for getting access to a json payload.
     Adds methods to json built from build and buildList methods.
      @param {String} modelName name of model for payload
     @param {Object} json json payload being proxied
     @param {Boolean} converter the converter that built this json
     */

    function _default(modelName, json, converter) {
      _classCallCheck(this, _default);

      this.modelName = modelName;
      this.json = json;
      this.converter = converter;
      this.listType = converter.listType || false;
      this.payloadKey = this.listType ? pluralize(modelName) : modelName;
      this.proxyMethods = w("getModelPayload isProxy get add unwrap");
      this.wrap(this.proxyMethods);
    }

    /**
      Add another json payload to this one.
      Adds the main model payload and all it's includes to this json
       @param {Object} json built from FactoryGuy buildList build
      @returns {Object} the current json payload
     */

    _createClass(_default, [{
      key: "add",
      value: function add() /*moreJson*/{} // each subclass does it's own thing

      // marker function for saying "I am a proxy"

    }, {
      key: "isProxy",
      value: function isProxy() {}

      // get the top level model from the json payload
    }, {
      key: "getModelPayload",
      value: function getModelPayload() {
        return this.get();
      }

      // each subclass has unique proxy methods to add to the basic
    }, {
      key: "addProxyMethods",
      value: function addProxyMethods(methods) {
        this.proxyMethods = this.proxyMethods.concat(methods);
        this.wrap(methods);
      }

      // add proxy methods to json object
    }, {
      key: "wrap",
      value: function wrap(methods) {
        var _this = this;

        methods.forEach(function (method) {
          return _this.json[method] = _this[method].bind(_this);
        });
      }

      // remove proxy methods from json object
    }, {
      key: "unwrap",
      value: function unwrap() {
        var _this2 = this;

        this.proxyMethods.forEach(function (method) {
          return delete _this2.json[method];
        });
      }

      /**
       Main access point for most users to get data from the
       json payload
        Could be asking for attribute like 'id' or 'name',
       or index into list for list type
        @param key
       @returns {*}
       */
    }, {
      key: "get",
      value: function get(key) {
        if (this.listType) {
          return this.getListKeys(key);
        }
        return this.getObjectKeys(key);
      }
    }]);

    return _default;
  })();

  exports["default"] = _default;
});
define('ember-data-factory-guy/payload/rest-payload', ['exports', 'ember', 'ember-data-factory-guy/payload/json-payload'], function (exports, _ember, _emberDataFactoryGuyPayloadJsonPayload) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var _default = (function (_JSONPayload) {
    _inherits(_default, _JSONPayload);

    function _default(modelName, json, converter) {
      _classCallCheck(this, _default);

      _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).call(this, modelName, json, converter);
      this.addProxyMethods(['includeKeys', 'getInclude']);
    }

    _createClass(_default, [{
      key: 'add',
      value: function add(moreJson) {
        var _this = this;

        this.converter.included = this.json;
        _ember['default'].A(Object.keys(moreJson)).reject(function (key) {
          return _ember['default'].A(_this.proxyMethods).contains(key);
        }).forEach(function (key) {
          if (_ember['default'].typeOf(moreJson[key]) === "array") {
            moreJson[key].forEach(function (data) {
              return _this.converter.addToIncluded(data, key);
            });
          } else {
            _this.converter.addToIncluded(moreJson[key], key);
          }
        });
        return this.json;
      }
    }, {
      key: 'includeKeys',
      value: function includeKeys() {
        var _this2 = this;

        var keys = _ember['default'].A(Object.keys(this.json)).reject(function (key) {
          return _this2.payloadKey === key;
        });
        return _ember['default'].A(keys).reject(function (key) {
          return _ember['default'].A(_this2.proxyMethods).contains(key);
        }) || [];
      }
    }, {
      key: 'getInclude',
      value: function getInclude(modelType) {
        return this.json[modelType];
      }
    }, {
      key: 'getObjectKeys',
      value: function getObjectKeys(key) {
        var attrs = this.json[this.payloadKey];
        if (_ember['default'].isEmpty(key)) {
          return attrs;
        }
        return attrs[key];
      }
    }, {
      key: 'getListKeys',
      value: function getListKeys(key) {
        var attrs = this.json[this.payloadKey];
        if (_ember['default'].isEmpty(key)) {
          return attrs;
        }
        if (typeof key === 'number') {
          return attrs[key];
        }
        if (key === 'firstObject') {
          return attrs[0];
        }
        if (key === 'lastObject') {
          return attrs[attrs.length - 1];
        }
      }
    }]);

    return _default;
  })(_emberDataFactoryGuyPayloadJsonPayload['default']);

  exports['default'] = _default;
});
define("ember-data-factory-guy/sequence", ["exports"], function (exports) {
  "use strict";

  exports["default"] = function (fn) {
    var index = 1;
    this.next = function () {
      return fn.call(this, index++);
    };
    this.reset = function () {
      index = 1;
    };
  };
});
define('ember-data-factory-guy/utils/helper-functions', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  function isEquivalent(a, b) {
    var type = _ember['default'].typeOf(a);
    if (type !== _ember['default'].typeOf(b)) {
      return false;
    }
    switch (type) {
      case 'object':
        return objectIsEquivalent(a, b);
      case 'array':
        return arrayIsEquivalent(a, b);
      default:
        return a === b;
    }
  }

  function arrayIsEquivalent(arrayA, arrayB) {
    if (arrayA.length !== arrayB.length) {
      return false;
    }
    return arrayA.every(function (item, index) {
      return isEquivalent(item, arrayB[index]);
    });
  }

  function objectIsEquivalent(objectA, objectB) {
    var aProps = Object.keys(objectA);
    var bProps = Object.keys(objectB);
    if (aProps.length !== bProps.length) {
      return false;
    }
    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];
      var aEntry = objectA[propName];
      var bEntry = objectB[propName];
      if (!isEquivalent(aEntry, bEntry)) {
        return false;
      }
    }
    return true;
  }

  exports.isEquivalent = isEquivalent;
});
define('ember-data-factory-guy/utils/load-factories', ['exports'], function (exports) {
  /* global requirejs, require */
  /*jslint node: true */

  'use strict';

  exports['default'] = function () {
    var factoryFileRegExp = new RegExp('/tests/factories');

    Object.keys(requirejs._eak_seen).filter(function (key) {
      return factoryFileRegExp.test(key);
    }).forEach(function (moduleName) {
      if (moduleName.match('.jshint')) {
        // ignore autogenerated .jshint files
        return;
      }
      if (moduleName.match('.jscs')) {
        // ignore autogenerated .jscs files
        return;
      }
      require(moduleName, null, null, true);
    });
  };
});
define('ember-data-factory-guy/utils/manual-setup', ['exports', 'ember-data-factory-guy/factory-guy', 'ember-data-factory-guy/factory-guy-test-helper', 'ember-data-factory-guy/utils/load-factories'], function (exports, _emberDataFactoryGuyFactoryGuy, _emberDataFactoryGuyFactoryGuyTestHelper, _emberDataFactoryGuyUtilsLoadFactories) {
  // For manually setting up FactoryGuy in unit/integration tests where the applicaiton is not started
  'use strict';

  exports['default'] = function (container) {
    _emberDataFactoryGuyFactoryGuy['default'].setStore(container.lookup('service:store'));
    _emberDataFactoryGuyFactoryGuyTestHelper['default'].set('container', container);
    _emberDataFactoryGuyFactoryGuy['default'].resetDefinitions();
    (0, _emberDataFactoryGuyUtilsLoadFactories['default'])();
  };
});
define("ember-inflector/index", ["exports", "ember", "ember-inflector/lib/system", "ember-inflector/lib/ext/string"], function (exports, _ember, _emberInflectorLibSystem, _emberInflectorLibExtString) {
  /* global define, module */

  "use strict";

  _emberInflectorLibSystem.Inflector.defaultRules = _emberInflectorLibSystem.defaultRules;
  _ember["default"].Inflector = _emberInflectorLibSystem.Inflector;

  _ember["default"].String.pluralize = _emberInflectorLibSystem.pluralize;
  _ember["default"].String.singularize = _emberInflectorLibSystem.singularize;exports["default"] = _emberInflectorLibSystem.Inflector;
  exports.pluralize = _emberInflectorLibSystem.pluralize;
  exports.singularize = _emberInflectorLibSystem.singularize;
  exports.defaultRules = _emberInflectorLibSystem.defaultRules;

  if (typeof define !== 'undefined' && define.amd) {
    define('ember-inflector', ['exports'], function (__exports__) {
      __exports__['default'] = _emberInflectorLibSystem.Inflector;
      return _emberInflectorLibSystem.Inflector;
    });
  } else if (typeof module !== 'undefined' && module['exports']) {
    module['exports'] = _emberInflectorLibSystem.Inflector;
  }
});
define('ember-inflector/lib/ext/string', ['exports', 'ember', 'ember-inflector/lib/system/string'], function (exports, _ember, _emberInflectorLibSystemString) {
  'use strict';

  if (_ember['default'].EXTEND_PROTOTYPES === true || _ember['default'].EXTEND_PROTOTYPES.String) {
    /**
      See {{#crossLink "Ember.String/pluralize"}}{{/crossLink}}
       @method pluralize
      @for String
    */
    String.prototype.pluralize = function () {
      return (0, _emberInflectorLibSystemString.pluralize)(this);
    };

    /**
      See {{#crossLink "Ember.String/singularize"}}{{/crossLink}}
       @method singularize
      @for String
    */
    String.prototype.singularize = function () {
      return (0, _emberInflectorLibSystemString.singularize)(this);
    };
  }
});
define('ember-inflector/lib/helpers/pluralize', ['exports', 'ember-inflector', 'ember-inflector/lib/utils/make-helper'], function (exports, _emberInflector, _emberInflectorLibUtilsMakeHelper) {
  'use strict';

  /**
   *
   * If you have Ember Inflector (such as if Ember Data is present),
   * pluralize a word. For example, turn "ox" into "oxen".
   *
   * Example:
   *
   * {{pluralize count myProperty}}
   * {{pluralize 1 "oxen"}}
   * {{pluralize myProperty}}
   * {{pluralize "ox"}}
   *
   * @for Ember.HTMLBars.helpers
   * @method pluralize
   * @param {Number|Property} [count] count of objects
   * @param {String|Property} word word to pluralize
  */
  exports['default'] = (0, _emberInflectorLibUtilsMakeHelper['default'])(function (params) {
    var count = undefined,
        word = undefined;

    if (params.length === 1) {
      word = params[0];
      return (0, _emberInflector.pluralize)(word);
    } else {
      count = params[0];
      word = params[1];

      if (parseFloat(count) !== 1) {
        word = (0, _emberInflector.pluralize)(word);
      }

      return count + " " + word;
    }
  });
});
define('ember-inflector/lib/helpers/singularize', ['exports', 'ember-inflector', 'ember-inflector/lib/utils/make-helper'], function (exports, _emberInflector, _emberInflectorLibUtilsMakeHelper) {
  'use strict';

  /**
   *
   * If you have Ember Inflector (such as if Ember Data is present),
   * singularize a word. For example, turn "oxen" into "ox".
   *
   * Example:
   *
   * {{singularize myProperty}}
   * {{singularize "oxen"}}
   *
   * @for Ember.HTMLBars.helpers
   * @method singularize
   * @param {String|Property} word word to singularize
  */
  exports['default'] = (0, _emberInflectorLibUtilsMakeHelper['default'])(function (params) {
    return (0, _emberInflector.singularize)(params[0]);
  });
});
define('ember-inflector/lib/system/inflections', ['exports'], function (exports) {
  'use strict';

  exports['default'] = {
    plurals: [[/$/, 's'], [/s$/i, 's'], [/^(ax|test)is$/i, '$1es'], [/(octop|vir)us$/i, '$1i'], [/(octop|vir)i$/i, '$1i'], [/(alias|status)$/i, '$1es'], [/(bu)s$/i, '$1ses'], [/(buffal|tomat)o$/i, '$1oes'], [/([ti])um$/i, '$1a'], [/([ti])a$/i, '$1a'], [/sis$/i, 'ses'], [/(?:([^f])fe|([lr])f)$/i, '$1$2ves'], [/(hive)$/i, '$1s'], [/([^aeiouy]|qu)y$/i, '$1ies'], [/(x|ch|ss|sh)$/i, '$1es'], [/(matr|vert|ind)(?:ix|ex)$/i, '$1ices'], [/^(m|l)ouse$/i, '$1ice'], [/^(m|l)ice$/i, '$1ice'], [/^(ox)$/i, '$1en'], [/^(oxen)$/i, '$1'], [/(quiz)$/i, '$1zes']],

    singular: [[/s$/i, ''], [/(ss)$/i, '$1'], [/(n)ews$/i, '$1ews'], [/([ti])a$/i, '$1um'], [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)(sis|ses)$/i, '$1sis'], [/(^analy)(sis|ses)$/i, '$1sis'], [/([^f])ves$/i, '$1fe'], [/(hive)s$/i, '$1'], [/(tive)s$/i, '$1'], [/([lr])ves$/i, '$1f'], [/([^aeiouy]|qu)ies$/i, '$1y'], [/(s)eries$/i, '$1eries'], [/(m)ovies$/i, '$1ovie'], [/(x|ch|ss|sh)es$/i, '$1'], [/^(m|l)ice$/i, '$1ouse'], [/(bus)(es)?$/i, '$1'], [/(o)es$/i, '$1'], [/(shoe)s$/i, '$1'], [/(cris|test)(is|es)$/i, '$1is'], [/^(a)x[ie]s$/i, '$1xis'], [/(octop|vir)(us|i)$/i, '$1us'], [/(alias|status)(es)?$/i, '$1'], [/^(ox)en/i, '$1'], [/(vert|ind)ices$/i, '$1ex'], [/(matr)ices$/i, '$1ix'], [/(quiz)zes$/i, '$1'], [/(database)s$/i, '$1']],

    irregularPairs: [['person', 'people'], ['man', 'men'], ['child', 'children'], ['sex', 'sexes'], ['move', 'moves'], ['cow', 'kine'], ['zombie', 'zombies']],

    uncountable: ['equipment', 'information', 'rice', 'money', 'species', 'series', 'fish', 'sheep', 'jeans', 'police']
  };
});
define('ember-inflector/lib/system/inflector', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  var capitalize = _ember['default'].String.capitalize;

  var BLANK_REGEX = /^\s*$/;
  var LAST_WORD_DASHED_REGEX = /([\w/-]+[_/\s-])([a-z\d]+$)/;
  var LAST_WORD_CAMELIZED_REGEX = /([\w/\s-]+)([A-Z][a-z\d]*$)/;
  var CAMELIZED_REGEX = /[A-Z][a-z\d]*$/;

  function loadUncountable(rules, uncountable) {
    for (var i = 0, length = uncountable.length; i < length; i++) {
      rules.uncountable[uncountable[i].toLowerCase()] = true;
    }
  }

  function loadIrregular(rules, irregularPairs) {
    var pair;

    for (var i = 0, length = irregularPairs.length; i < length; i++) {
      pair = irregularPairs[i];

      //pluralizing
      rules.irregular[pair[0].toLowerCase()] = pair[1];
      rules.irregular[pair[1].toLowerCase()] = pair[1];

      //singularizing
      rules.irregularInverse[pair[1].toLowerCase()] = pair[0];
      rules.irregularInverse[pair[0].toLowerCase()] = pair[0];
    }
  }

  /**
    Inflector.Ember provides a mechanism for supplying inflection rules for your
    application. Ember includes a default set of inflection rules, and provides an
    API for providing additional rules.
  
    Examples:
  
    Creating an inflector with no rules.
  
    ```js
    var inflector = new Ember.Inflector();
    ```
  
    Creating an inflector with the default ember ruleset.
  
    ```js
    var inflector = new Ember.Inflector(Ember.Inflector.defaultRules);
  
    inflector.pluralize('cow'); //=> 'kine'
    inflector.singularize('kine'); //=> 'cow'
    ```
  
    Creating an inflector and adding rules later.
  
    ```javascript
    var inflector = Ember.Inflector.inflector;
  
    inflector.pluralize('advice'); // => 'advices'
    inflector.uncountable('advice');
    inflector.pluralize('advice'); // => 'advice'
  
    inflector.pluralize('formula'); // => 'formulas'
    inflector.irregular('formula', 'formulae');
    inflector.pluralize('formula'); // => 'formulae'
  
    // you would not need to add these as they are the default rules
    inflector.plural(/$/, 's');
    inflector.singular(/s$/i, '');
    ```
  
    Creating an inflector with a nondefault ruleset.
  
    ```javascript
    var rules = {
      plurals:  [ /$/, 's' ],
      singular: [ /\s$/, '' ],
      irregularPairs: [
        [ 'cow', 'kine' ]
      ],
      uncountable: [ 'fish' ]
    };
  
    var inflector = new Ember.Inflector(rules);
    ```
  
    @class Inflector
    @namespace Ember
  */
  function Inflector(ruleSet) {
    ruleSet = ruleSet || {};
    ruleSet.uncountable = ruleSet.uncountable || makeDictionary();
    ruleSet.irregularPairs = ruleSet.irregularPairs || makeDictionary();

    var rules = this.rules = {
      plurals: ruleSet.plurals || [],
      singular: ruleSet.singular || [],
      irregular: makeDictionary(),
      irregularInverse: makeDictionary(),
      uncountable: makeDictionary()
    };

    loadUncountable(rules, ruleSet.uncountable);
    loadIrregular(rules, ruleSet.irregularPairs);

    this.enableCache();
  }

  if (!Object.create && !Object.create(null).hasOwnProperty) {
    throw new Error("This browser does not support Object.create(null), please polyfil with es5-sham: http://git.io/yBU2rg");
  }

  function makeDictionary() {
    var cache = Object.create(null);
    cache['_dict'] = null;
    delete cache['_dict'];
    return cache;
  }

  Inflector.prototype = {
    /**
      @public
       As inflections can be costly, and commonly the same subset of words are repeatedly
      inflected an optional cache is provided.
       @method enableCache
    */
    enableCache: function enableCache() {
      this.purgeCache();

      this.singularize = function (word) {
        this._cacheUsed = true;
        return this._sCache[word] || (this._sCache[word] = this._singularize(word));
      };

      this.pluralize = function (word) {
        this._cacheUsed = true;
        return this._pCache[word] || (this._pCache[word] = this._pluralize(word));
      };
    },

    /**
      @public
       @method purgedCache
    */
    purgeCache: function purgeCache() {
      this._cacheUsed = false;
      this._sCache = makeDictionary();
      this._pCache = makeDictionary();
    },

    /**
      @public
      disable caching
       @method disableCache;
    */
    disableCache: function disableCache() {
      this._sCache = null;
      this._pCache = null;
      this.singularize = function (word) {
        return this._singularize(word);
      };

      this.pluralize = function (word) {
        return this._pluralize(word);
      };
    },

    /**
      @method plural
      @param {RegExp} regex
      @param {String} string
    */
    plural: function plural(regex, string) {
      if (this._cacheUsed) {
        this.purgeCache();
      }
      this.rules.plurals.push([regex, string.toLowerCase()]);
    },

    /**
      @method singular
      @param {RegExp} regex
      @param {String} string
    */
    singular: function singular(regex, string) {
      if (this._cacheUsed) {
        this.purgeCache();
      }
      this.rules.singular.push([regex, string.toLowerCase()]);
    },

    /**
      @method uncountable
      @param {String} regex
    */
    uncountable: function uncountable(string) {
      if (this._cacheUsed) {
        this.purgeCache();
      }
      loadUncountable(this.rules, [string.toLowerCase()]);
    },

    /**
      @method irregular
      @param {String} singular
      @param {String} plural
    */
    irregular: function irregular(singular, plural) {
      if (this._cacheUsed) {
        this.purgeCache();
      }
      loadIrregular(this.rules, [[singular, plural]]);
    },

    /**
      @method pluralize
      @param {String} word
    */
    pluralize: function pluralize(word) {
      return this._pluralize(word);
    },

    _pluralize: function _pluralize(word) {
      return this.inflect(word, this.rules.plurals, this.rules.irregular);
    },
    /**
      @method singularize
      @param {String} word
    */
    singularize: function singularize(word) {
      return this._singularize(word);
    },

    _singularize: function _singularize(word) {
      return this.inflect(word, this.rules.singular, this.rules.irregularInverse);
    },

    /**
      @protected
       @method inflect
      @param {String} word
      @param {Object} typeRules
      @param {Object} irregular
    */
    inflect: function inflect(word, typeRules, irregular) {
      var inflection, substitution, result, lowercase, wordSplit, firstPhrase, lastWord, isBlank, isCamelized, rule, isUncountable;

      isBlank = !word || BLANK_REGEX.test(word);

      isCamelized = CAMELIZED_REGEX.test(word);
      firstPhrase = "";

      if (isBlank) {
        return word;
      }

      lowercase = word.toLowerCase();
      wordSplit = LAST_WORD_DASHED_REGEX.exec(word) || LAST_WORD_CAMELIZED_REGEX.exec(word);

      if (wordSplit) {
        firstPhrase = wordSplit[1];
        lastWord = wordSplit[2].toLowerCase();
      }

      isUncountable = this.rules.uncountable[lowercase] || this.rules.uncountable[lastWord];

      if (isUncountable) {
        return word;
      }

      for (rule in this.rules.irregular) {
        if (lowercase.match(rule + "$")) {
          substitution = irregular[rule];

          if (isCamelized && irregular[lastWord]) {
            substitution = capitalize(substitution);
            rule = capitalize(rule);
          }

          return word.replace(rule, substitution);
        }
      }

      for (var i = typeRules.length, min = 0; i > min; i--) {
        inflection = typeRules[i - 1];
        rule = inflection[0];

        if (rule.test(word)) {
          break;
        }
      }

      inflection = inflection || [];

      rule = inflection[0];
      substitution = inflection[1];

      result = word.replace(rule, substitution);

      return result;
    }
  };

  exports['default'] = Inflector;
});
define('ember-inflector/lib/system/string', ['exports', 'ember-inflector/lib/system/inflector'], function (exports, _emberInflectorLibSystemInflector) {
  'use strict';

  function pluralize(word) {
    return _emberInflectorLibSystemInflector['default'].inflector.pluralize(word);
  }

  function singularize(word) {
    return _emberInflectorLibSystemInflector['default'].inflector.singularize(word);
  }

  exports.pluralize = pluralize;
  exports.singularize = singularize;
});
define("ember-inflector/lib/system", ["exports", "ember-inflector/lib/system/inflector", "ember-inflector/lib/system/string", "ember-inflector/lib/system/inflections"], function (exports, _emberInflectorLibSystemInflector, _emberInflectorLibSystemString, _emberInflectorLibSystemInflections) {
  "use strict";

  _emberInflectorLibSystemInflector["default"].inflector = new _emberInflectorLibSystemInflector["default"](_emberInflectorLibSystemInflections["default"]);

  exports.Inflector = _emberInflectorLibSystemInflector["default"];
  exports.singularize = _emberInflectorLibSystemString.singularize;
  exports.pluralize = _emberInflectorLibSystemString.pluralize;
  exports.defaultRules = _emberInflectorLibSystemInflections["default"];
});
define('ember-inflector/lib/utils/make-helper', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  exports['default'] = makeHelper;

  function makeHelper(helperFunction) {
    if (_ember['default'].Helper) {
      return _ember['default'].Helper.helper(helperFunction);
    }
    if (_ember['default'].HTMLBars) {
      return _ember['default'].HTMLBars.makeBoundHelper(helperFunction);
    }
    return _ember['default'].Handlebars.makeBoundHelper(helperFunction);
  }
});
define('ember-load-initializers/index', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  exports['default'] = function (app, prefix) {
    var regex = new RegExp('^' + prefix + '\/((?:instance-)?initializers)\/');
    var getKeys = Object.keys || _ember['default'].keys;

    getKeys(requirejs._eak_seen).map(function (moduleName) {
      return {
        moduleName: moduleName,
        matches: regex.exec(moduleName)
      };
    }).filter(function (dep) {
      return dep.matches && dep.matches.length === 2;
    }).forEach(function (dep) {
      var moduleName = dep.moduleName;

      var module = require(moduleName, null, null, true);
      if (!module) {
        throw new Error(moduleName + ' must export an initializer.');
      }

      var initializerType = _ember['default'].String.camelize(dep.matches[1].substring(0, dep.matches[1].length - 1));
      var initializer = module['default'];
      if (!initializer.name) {
        var initializerName = moduleName.match(/[^\/]+\/?$/)[0];
        initializer.name = initializerName;
      }

      if (app[initializerType]) {
        app[initializerType](initializer);
      }
    });
  };
});
define('ember-resolver/container-debug-adapter', ['exports', 'ember', 'ember-resolver/utils/module-registry'], function (exports, _ember, _emberResolverUtilsModuleRegistry) {
  'use strict';

  var ContainerDebugAdapter = _ember['default'].ContainerDebugAdapter;

  var ModulesContainerDebugAdapter = null;

  function getPod(type, key, prefix) {
    var match = key.match(new RegExp('^/?' + prefix + '/(.+)/' + type + '$'));
    if (match) {
      return match[1];
    }
  }

  // Support Ember < 1.5-beta.4
  // TODO: Remove this after 1.5.0 is released
  if (typeof ContainerDebugAdapter !== 'undefined') {

    /*
     * This module defines a subclass of Ember.ContainerDebugAdapter that adds two
     * important features:
     *
     *  1) is able provide injections to classes that implement `extend`
     *     (as is typical with Ember).
     */

    ModulesContainerDebugAdapter = ContainerDebugAdapter.extend({
      _moduleRegistry: null,

      init: function init() {
        this._super.apply(this, arguments);

        if (!this._moduleRegistry) {
          this._moduleRegistry = new _emberResolverUtilsModuleRegistry['default']();
        }
      },

      /**
        The container of the application being debugged.
        This property will be injected
        on creation.
         @property container
        @default null
      */

      /**
        The resolver instance of the application
        being debugged. This property will be injected
        on creation.
         @property resolver
        @default null
      */

      /**
        Returns true if it is possible to catalog a list of available
        classes in the resolver for a given type.
         @method canCatalogEntriesByType
        @param {string} type The type. e.g. "model", "controller", "route"
        @return {boolean} whether a list is available for this type.
      */
      canCatalogEntriesByType: function canCatalogEntriesByType() /* type */{
        return true;
      },

      /**
        Returns the available classes a given type.
         @method catalogEntriesByType
        @param {string} type The type. e.g. "model", "controller", "route"
        @return {Array} An array of classes.
      */
      catalogEntriesByType: function catalogEntriesByType(type) {
        var moduleNames = this._moduleRegistry.moduleNames();
        var types = _ember['default'].A();

        var prefix = this.namespace.modulePrefix;

        for (var i = 0, l = moduleNames.length; i < l; i++) {
          var key = moduleNames[i];

          if (key.indexOf(type) !== -1) {
            // Check if it's a pod module
            var name = getPod(type, key, this.namespace.podModulePrefix || prefix);
            if (!name) {
              // Not pod
              name = key.split(type + 's/').pop();

              // Support for different prefix (such as ember-cli addons).
              // Uncomment the code below when
              // https://github.com/ember-cli/ember-resolver/pull/80 is merged.

              //var match = key.match('^/?(.+)/' + type);
              //if (match && match[1] !== prefix) {
              // Different prefix such as an addon
              //name = match[1] + '@' + name;
              //}
            }
            types.addObject(name);
          }
        }
        return types;
      }
    });
  }

  exports['default'] = ModulesContainerDebugAdapter;
});
define('ember-resolver/index', ['exports', 'ember-resolver/resolver'], function (exports, _emberResolverResolver) {
  'use strict';

  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberResolverResolver['default'];
    }
  });
});
define('ember-resolver/resolver', ['exports', 'ember', 'ember-resolver/utils/module-registry', 'ember-resolver/utils/class-factory', 'ember-resolver/utils/make-dictionary'], function (exports, _ember, _emberResolverUtilsModuleRegistry, _emberResolverUtilsClassFactory, _emberResolverUtilsMakeDictionary) {
  /*globals require */

  'use strict';

  /*
   * This module defines a subclass of Ember.DefaultResolver that adds two
   * important features:
   *
   *  1) The resolver makes the container aware of es6 modules via the AMD
   *     output. The loader's _moduleEntries is consulted so that classes can be
   *     resolved directly via the module loader, without needing a manual
   *     `import`.
   *  2) is able to provide injections to classes that implement `extend`
   *     (as is typical with Ember).
   */

  var _Ember$String = _ember['default'].String;
  var underscore = _Ember$String.underscore;
  var classify = _Ember$String.classify;
  var get = _ember['default'].get;
  var DefaultResolver = _ember['default'].DefaultResolver;

  function parseName(fullName) {
    /*jshint validthis:true */

    if (fullName.parsedName === true) {
      return fullName;
    }

    var prefix, type, name;
    var fullNameParts = fullName.split('@');

    // HTMLBars uses helper:@content-helper which collides
    // with ember-cli namespace detection.
    // This will be removed in a future release of HTMLBars.
    if (fullName !== 'helper:@content-helper' && fullNameParts.length === 2) {
      var prefixParts = fullNameParts[0].split(':');

      if (prefixParts.length === 2) {
        prefix = prefixParts[1];
        type = prefixParts[0];
        name = fullNameParts[1];
      } else {
        var nameParts = fullNameParts[1].split(':');

        prefix = fullNameParts[0];
        type = nameParts[0];
        name = nameParts[1];
      }
    } else {
      fullNameParts = fullName.split(':');
      type = fullNameParts[0];
      name = fullNameParts[1];
    }

    var fullNameWithoutType = name;
    var namespace = get(this, 'namespace');
    var root = namespace;

    return {
      parsedName: true,
      fullName: fullName,
      prefix: prefix || this.prefix({ type: type }),
      type: type,
      fullNameWithoutType: fullNameWithoutType,
      name: name,
      root: root,
      resolveMethodName: "resolve" + classify(type)
    };
  }

  function resolveOther(parsedName) {
    /*jshint validthis:true */

    _ember['default'].assert('`modulePrefix` must be defined', this.namespace.modulePrefix);

    var normalizedModuleName = this.findModuleName(parsedName);

    if (normalizedModuleName) {
      var defaultExport = this._extractDefaultExport(normalizedModuleName, parsedName);

      if (defaultExport === undefined) {
        throw new Error(" Expected to find: '" + parsedName.fullName + "' within '" + normalizedModuleName + "' but got 'undefined'. Did you forget to `export default` within '" + normalizedModuleName + "'?");
      }

      if (this.shouldWrapInClassFactory(defaultExport, parsedName)) {
        defaultExport = (0, _emberResolverUtilsClassFactory['default'])(defaultExport);
      }

      return defaultExport;
    } else {
      return this._super(parsedName);
    }
  }

  // Ember.DefaultResolver docs:
  //   https://github.com/emberjs/ember.js/blob/master/packages/ember-application/lib/system/resolver.js
  var Resolver = DefaultResolver.extend({
    resolveOther: resolveOther,
    parseName: parseName,
    resolveTemplate: resolveOther,
    pluralizedTypes: null,
    moduleRegistry: null,

    makeToString: function makeToString(factory, fullName) {
      return '' + this.namespace.modulePrefix + '@' + fullName + ':';
    },

    shouldWrapInClassFactory: function shouldWrapInClassFactory() /* module, parsedName */{
      return false;
    },

    init: function init() {
      this._super();
      this.moduleBasedResolver = true;

      if (!this._moduleRegistry) {
        this._moduleRegistry = new _emberResolverUtilsModuleRegistry['default']();
      }

      this._normalizeCache = (0, _emberResolverUtilsMakeDictionary['default'])();

      this.pluralizedTypes = this.pluralizedTypes || (0, _emberResolverUtilsMakeDictionary['default'])();

      if (!this.pluralizedTypes.config) {
        this.pluralizedTypes.config = 'config';
      }

      this._deprecatedPodModulePrefix = false;
    },

    normalize: function normalize(fullName) {
      return this._normalizeCache[fullName] || (this._normalizeCache[fullName] = this._normalize(fullName));
    },

    _normalize: function _normalize(fullName) {
      // replace `.` with `/` in order to make nested controllers work in the following cases
      // 1. `needs: ['posts/post']`
      // 2. `{{render "posts/post"}}`
      // 3. `this.render('posts/post')` from Route
      var split = fullName.split(':');
      if (split.length > 1) {
        return split[0] + ':' + _ember['default'].String.dasherize(split[1].replace(/\./g, '/'));
      } else {
        return fullName;
      }
    },

    pluralize: function pluralize(type) {
      return this.pluralizedTypes[type] || (this.pluralizedTypes[type] = type + 's');
    },

    podBasedLookupWithPrefix: function podBasedLookupWithPrefix(podPrefix, parsedName) {
      var fullNameWithoutType = parsedName.fullNameWithoutType;

      if (parsedName.type === 'template') {
        fullNameWithoutType = fullNameWithoutType.replace(/^components\//, '');
      }

      return podPrefix + '/' + fullNameWithoutType + '/' + parsedName.type;
    },

    podBasedModuleName: function podBasedModuleName(parsedName) {
      var podPrefix = this.namespace.podModulePrefix || this.namespace.modulePrefix;

      return this.podBasedLookupWithPrefix(podPrefix, parsedName);
    },

    podBasedComponentsInSubdir: function podBasedComponentsInSubdir(parsedName) {
      var podPrefix = this.namespace.podModulePrefix || this.namespace.modulePrefix;
      podPrefix = podPrefix + '/components';

      if (parsedName.type === 'component' || parsedName.fullNameWithoutType.match(/^components/)) {
        return this.podBasedLookupWithPrefix(podPrefix, parsedName);
      }
    },

    mainModuleName: function mainModuleName(parsedName) {
      // if router:main or adapter:main look for a module with just the type first
      var tmpModuleName = parsedName.prefix + '/' + parsedName.type;

      if (parsedName.fullNameWithoutType === 'main') {
        return tmpModuleName;
      }
    },

    defaultModuleName: function defaultModuleName(parsedName) {
      return parsedName.prefix + '/' + this.pluralize(parsedName.type) + '/' + parsedName.fullNameWithoutType;
    },

    prefix: function prefix(parsedName) {
      var tmpPrefix = this.namespace.modulePrefix;

      if (this.namespace[parsedName.type + 'Prefix']) {
        tmpPrefix = this.namespace[parsedName.type + 'Prefix'];
      }

      return tmpPrefix;
    },

    /**
      A listing of functions to test for moduleName's based on the provided
     `parsedName`. This allows easy customization of additional module based
     lookup patterns.
      @property moduleNameLookupPatterns
     @returns {Ember.Array}
     */
    moduleNameLookupPatterns: _ember['default'].computed(function () {
      return [this.podBasedModuleName, this.podBasedComponentsInSubdir, this.mainModuleName, this.defaultModuleName];
    }),

    findModuleName: function findModuleName(parsedName, loggingDisabled) {
      var moduleNameLookupPatterns = this.get('moduleNameLookupPatterns');
      var moduleName;

      for (var index = 0, _length = moduleNameLookupPatterns.length; index < _length; index++) {
        var item = moduleNameLookupPatterns[index];

        var tmpModuleName = item.call(this, parsedName);

        // allow treat all dashed and all underscored as the same thing
        // supports components with dashes and other stuff with underscores.
        if (tmpModuleName) {
          tmpModuleName = this.chooseModuleName(tmpModuleName);
        }

        if (tmpModuleName && this._moduleRegistry.has(tmpModuleName)) {
          moduleName = tmpModuleName;
        }

        if (!loggingDisabled) {
          this._logLookup(moduleName, parsedName, tmpModuleName);
        }

        if (moduleName) {
          return moduleName;
        }
      }
    },

    chooseModuleName: function chooseModuleName(moduleName) {
      var underscoredModuleName = underscore(moduleName);

      if (moduleName !== underscoredModuleName && this._moduleRegistry.has(moduleName) && this._moduleRegistry.has(underscoredModuleName)) {
        throw new TypeError("Ambiguous module names: `" + moduleName + "` and `" + underscoredModuleName + "`");
      }

      if (this._moduleRegistry.has(moduleName)) {
        return moduleName;
      } else if (this._moduleRegistry.has(underscoredModuleName)) {
        return underscoredModuleName;
      } else {
        // workaround for dasherized partials:
        // something/something/-something => something/something/_something
        var partializedModuleName = moduleName.replace(/\/-([^\/]*)$/, '/_$1');

        if (this._moduleRegistry.has(partializedModuleName)) {
          _ember['default'].deprecate('Modules should not contain underscores. ' + 'Attempted to lookup "' + moduleName + '" which ' + 'was not found. Please rename "' + partializedModuleName + '" ' + 'to "' + moduleName + '" instead.', false);

          return partializedModuleName;
        } else {
          return moduleName;
        }
      }
    },

    // used by Ember.DefaultResolver.prototype._logLookup
    lookupDescription: function lookupDescription(fullName) {
      var parsedName = this.parseName(fullName);

      var moduleName = this.findModuleName(parsedName, true);

      return moduleName;
    },

    // only needed until 1.6.0-beta.2 can be required
    _logLookup: function _logLookup(found, parsedName, description) {
      if (!_ember['default'].ENV.LOG_MODULE_RESOLVER && !parsedName.root.LOG_RESOLVER) {
        return;
      }

      var symbol, padding;

      if (found) {
        symbol = '[✓]';
      } else {
        symbol = '[ ]';
      }

      if (parsedName.fullName.length > 60) {
        padding = '.';
      } else {
        padding = new Array(60 - parsedName.fullName.length).join('.');
      }

      if (!description) {
        description = this.lookupDescription(parsedName);
      }

      _ember['default'].Logger.info(symbol, parsedName.fullName, padding, description);
    },

    knownForType: function knownForType(type) {
      var moduleKeys = this._moduleRegistry.moduleNames();

      var items = (0, _emberResolverUtilsMakeDictionary['default'])();
      for (var index = 0, length = moduleKeys.length; index < length; index++) {
        var moduleName = moduleKeys[index];
        var fullname = this.translateToContainerFullname(type, moduleName);

        if (fullname) {
          items[fullname] = true;
        }
      }

      return items;
    },

    translateToContainerFullname: function translateToContainerFullname(type, moduleName) {
      var prefix = this.prefix({ type: type });

      // Note: using string manipulation here rather than regexes for better performance.
      // pod modules
      // '^' + prefix + '/(.+)/' + type + '$'
      var podPrefix = prefix + '/';
      var podSuffix = '/' + type;
      var start = moduleName.indexOf(podPrefix);
      var end = moduleName.indexOf(podSuffix);

      if (start === 0 && end === moduleName.length - podSuffix.length && moduleName.length > podPrefix.length + podSuffix.length) {
        return type + ':' + moduleName.slice(start + podPrefix.length, end);
      }

      // non-pod modules
      // '^' + prefix + '/' + pluralizedType + '/(.+)$'
      var pluralizedType = this.pluralize(type);
      var nonPodPrefix = prefix + '/' + pluralizedType + '/';

      if (moduleName.indexOf(nonPodPrefix) === 0 && moduleName.length > nonPodPrefix.length) {
        return type + ':' + moduleName.slice(nonPodPrefix.length);
      }
    },

    _extractDefaultExport: function _extractDefaultExport(normalizedModuleName) {
      var module = require(normalizedModuleName, null, null, true /* force sync */);

      if (module && module['default']) {
        module = module['default'];
      }

      return module;
    }
  });

  Resolver.reopenClass({
    moduleBasedResolver: true
  });

  exports['default'] = Resolver;
});
define('ember-resolver/utils/class-factory', ['exports'], function (exports) {
  'use strict';

  exports['default'] = classFactory;

  function classFactory(klass) {
    return {
      create: function create(injections) {
        if (typeof klass.extend === 'function') {
          return klass.extend(injections);
        } else {
          return klass;
        }
      }
    };
  }
});
define("ember-resolver/utils/create", ["exports", "ember"], function (exports, _ember) {
  "use strict";

  var create = Object.create || _ember["default"].create;
  if (!(create && !create(null).hasOwnProperty)) {
    throw new Error("This browser does not support Object.create(null), please polyfil with es5-sham: http://git.io/yBU2rg");
  }

  exports["default"] = create;
});
define('ember-resolver/utils/make-dictionary', ['exports', 'ember-resolver/utils/create'], function (exports, _emberResolverUtilsCreate) {
  'use strict';

  exports['default'] = makeDictionary;

  function makeDictionary() {
    var cache = (0, _emberResolverUtilsCreate['default'])(null);
    cache['_dict'] = null;
    delete cache['_dict'];
    return cache;
  }
});
define('ember-resolver/utils/module-registry', ['exports', 'ember'], function (exports, _ember) {
  /*globals requirejs, require */

  'use strict';

  if (typeof requirejs.entries === 'undefined') {
    requirejs.entries = requirejs._eak_seen;
  }

  function ModuleRegistry(entries) {
    this._entries = entries || requirejs.entries;
  }

  ModuleRegistry.prototype.moduleNames = function ModuleRegistry_moduleNames() {
    return (Object.keys || _ember['default'].keys)(this._entries);
  };

  ModuleRegistry.prototype.has = function ModuleRegistry_has(moduleName) {
    return moduleName in this._entries;
  };

  ModuleRegistry.prototype.get = function ModuleRegistry_get(moduleName) {
    var exportName = arguments.length <= 1 || arguments[1] === undefined ? 'default' : arguments[1];

    var module = require(moduleName);
    return module && module[exportName];
  };

  exports['default'] = ModuleRegistry;
});//# sourceMappingURL=addons.map