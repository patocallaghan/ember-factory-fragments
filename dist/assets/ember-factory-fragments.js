"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('ember-factory-fragments/adapters/application', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].RESTAdapter.extend();
});
define('ember-factory-fragments/app', ['exports', 'ember', 'ember-factory-fragments/resolver', 'ember-load-initializers', 'ember-factory-fragments/config/environment'], function (exports, _ember, _emberFactoryFragmentsResolver, _emberLoadInitializers, _emberFactoryFragmentsConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _emberFactoryFragmentsConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _emberFactoryFragmentsConfigEnvironment['default'].podModulePrefix,
    Resolver: _emberFactoryFragmentsResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _emberFactoryFragmentsConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('ember-factory-fragments/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'ember-factory-fragments/config/environment'], function (exports, _emberCliAppVersionComponentsAppVersion, _emberFactoryFragmentsConfigEnvironment) {

  var name = _emberFactoryFragmentsConfigEnvironment['default'].APP.name;
  var version = _emberFactoryFragmentsConfigEnvironment['default'].APP.version;

  exports['default'] = _emberCliAppVersionComponentsAppVersion['default'].extend({
    version: version,
    name: name
  });
});
define('ember-factory-fragments/controllers/application', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller.extend({});
});
define('ember-factory-fragments/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('ember-factory-fragments/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('ember-factory-fragments/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'ember-factory-fragments/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _emberFactoryFragmentsConfigEnvironment) {
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(_emberFactoryFragmentsConfigEnvironment['default'].APP.name, _emberFactoryFragmentsConfigEnvironment['default'].APP.version)
  };
});
define('ember-factory-fragments/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('ember-factory-fragments/initializers/ember-data-factory-guy', ['exports', 'ember-data-factory-guy/utils/manual-setup'], function (exports, _emberDataFactoryGuyUtilsManualSetup) {
  exports['default'] = {
    name: 'ember-data-factory-guy',
    after: 'ember-data',

    initialize: function initialize(application) {
      if (arguments.length > 1) {
        application = arguments[1];
      }
      var container = application.__container__;
      (0, _emberDataFactoryGuyUtilsManualSetup['default'])(container);
    }
  };
});
define('ember-factory-fragments/initializers/export-application-global', ['exports', 'ember', 'ember-factory-fragments/config/environment'], function (exports, _ember, _emberFactoryFragmentsConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_emberFactoryFragmentsConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var value = _emberFactoryFragmentsConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_emberFactoryFragmentsConfigEnvironment['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('ember-factory-fragments/models/city', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    name: _emberData['default'].attr()
  });
});
define('ember-factory-fragments/models/country', ['exports', 'ember-data', 'model-fragments'], function (exports, _emberData, _modelFragments) {
  exports['default'] = _emberData['default'].Model.extend({
    name: _emberData['default'].attr(),
    cities: _emberData['default'].hasMany('city'),
    weather: _modelFragments['default'].fragment('weather'),
    // states: DS.hasMany('state'),
    regions: _emberData['default'].hasMany('region')
  });
});
define('ember-factory-fragments/models/region', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    name: _emberData['default'].attr('string'),
    capital: _emberData['default'].belongsTo('city')
  });
});
define('ember-factory-fragments/models/state', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    name: _emberData['default'].attr()
  });
});
define('ember-factory-fragments/models/weather', ['exports', 'ember-data', 'model-fragments'], function (exports, _emberData, _modelFragments) {
  exports['default'] = _modelFragments['default'].Fragment.extend({
    temperature: _emberData['default'].attr('number'),
    description: _emberData['default'].attr('string')
  });
});
define('ember-factory-fragments/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('ember-factory-fragments/router', ['exports', 'ember', 'ember-factory-fragments/config/environment'], function (exports, _ember, _emberFactoryFragmentsConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _emberFactoryFragmentsConfigEnvironment['default'].locationType
  });

  Router.map(function () {
    this.route('example');
  });

  exports['default'] = Router;
});
define('ember-factory-fragments/routes/application', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    model: function model() {
      return this.store.findAll('country', 1);
    }
  });
});
define('ember-factory-fragments/routes/example', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    model: function model() {
      this.store.findRecord('country', 1);
    }
  });
});
define('ember-factory-fragments/serializers/application', ['exports', 'ember', 'ember-data'], function (exports, _ember, _emberData) {

  var restSerializer = _emberData['default'].RESTSerializer.create();

  exports['default'] = _emberData['default'].JSONSerializer.extend({
    serialize: function serialize(snapshot) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      options.includeId = true;
      return this._super(snapshot, options);
    },
    keyForAttribute: function keyForAttribute(attr) {
      return _ember['default'].String.decamelize(attr);
    },
    keyForRelationship: function keyForRelationship(attr) {
      return _ember['default'].String.decamelize(attr);
    },
    modelNameFromPayloadKey: restSerializer.modelNameFromPayloadKey,
    pushPayload: restSerializer.pushPayload
  });
});
define('ember-factory-fragments/serializers/country', ['exports', 'ember-data', 'ember-factory-fragments/serializers/application'], function (exports, _emberData, _emberFactoryFragmentsSerializersApplication) {
  exports['default'] = _emberFactoryFragmentsSerializersApplication['default'].extend(_emberData['default'].EmbeddedRecordsMixin, {
    attrs: {
      cities: { embedded: 'always' },
      weather: { embedded: 'always' },
      regions: {
        serialize: false,
        deserialize: 'records'
      }
    }
  });
});
define('ember-factory-fragments/serializers/region', ['exports', 'ember-data', 'ember-factory-fragments/serializers/application'], function (exports, _emberData, _emberFactoryFragmentsSerializersApplication) {
  exports['default'] = _emberFactoryFragmentsSerializersApplication['default'].extend(_emberData['default'].EmbeddedRecordsMixin, {
    attrs: {
      capital: {
        key: 'capital_id'
      }
    }
  });
});
define('ember-factory-fragments/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define("ember-factory-fragments/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.4.3",
            "loc": {
              "source": null,
              "start": {
                "line": 12,
                "column": 6
              },
              "end": {
                "line": 14,
                "column": 6
              }
            },
            "moduleName": "ember-factory-fragments/templates/application.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
            return morphs;
          },
          statements: [["content", "city.name", ["loc", [null, [13, 12], [13, 25]]]]],
          locals: ["city"],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.4.3",
            "loc": {
              "source": null,
              "start": {
                "line": 28,
                "column": 6
              },
              "end": {
                "line": 31,
                "column": 6
              }
            },
            "moduleName": "ember-factory-fragments/templates/application.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createTextNode("Name: ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createTextNode("Capital: ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(2);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
            morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]), 1, 1);
            return morphs;
          },
          statements: [["content", "region.name", ["loc", [null, [29, 18], [29, 33]]]], ["content", "region.capital.name", ["loc", [null, [30, 21], [30, 44]]]]],
          locals: ["region"],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.3",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 0
            },
            "end": {
              "line": 35,
              "column": 0
            }
          },
          "moduleName": "ember-factory-fragments/templates/application.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("ul");
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("ID: ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("Name: ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("hr");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("\n    Cities:\n    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("ul");
          var el4 = dom.createTextNode("\n");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("    ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n  ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("hr");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("\n    Weather:\n    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("ul");
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("li");
          var el5 = dom.createTextNode("Temperature: ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("li");
          var el5 = dom.createTextNode("Description: ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n    ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n  ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("\n    Regions:\n    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("ul");
          var el4 = dom.createTextNode("\n");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("    ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n  ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [0]);
          var element1 = dom.childAt(element0, [11, 1]);
          var morphs = new Array(6);
          morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 1, 1);
          morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]), 1, 1);
          morphs[2] = dom.createMorphAt(dom.childAt(element0, [7, 1]), 1, 1);
          morphs[3] = dom.createMorphAt(dom.childAt(element1, [1]), 1, 1);
          morphs[4] = dom.createMorphAt(dom.childAt(element1, [3]), 1, 1);
          morphs[5] = dom.createMorphAt(dom.childAt(element0, [13, 1]), 1, 1);
          return morphs;
        },
        statements: [["content", "country.id", ["loc", [null, [6, 10], [6, 24]]]], ["content", "country.name", ["loc", [null, [7, 12], [7, 28]]]], ["block", "each", [["get", "country.cities", ["loc", [null, [12, 14], [12, 28]]]]], [], 0, null, ["loc", [null, [12, 6], [14, 15]]]], ["content", "country.weather.temperature", ["loc", [null, [21, 23], [21, 54]]]], ["content", "country.weather.description", ["loc", [null, [22, 23], [22, 54]]]], ["block", "each", [["get", "country.regions", ["loc", [null, [28, 14], [28, 29]]]]], [], 1, null, ["loc", [null, [28, 6], [31, 15]]]]],
        locals: ["country"],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes", "wrong-type"]
        },
        "revision": "Ember@2.4.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 38,
            "column": 0
          }
        },
        "moduleName": "ember-factory-fragments/templates/application.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        dom.setAttribute(el1, "id", "title");
        var el2 = dom.createTextNode("Welcome to Ember");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("h3");
        var el2 = dom.createTextNode("This is a 'Country' model");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        morphs[1] = dom.createMorphAt(fragment, 6, 6, contextualElement);
        return morphs;
      },
      statements: [["block", "each", [["get", "model", ["loc", [null, [4, 8], [4, 13]]]]], [], 0, null, ["loc", [null, [4, 0], [35, 9]]]], ["content", "outlet", ["loc", [null, [37, 0], [37, 10]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("ember-factory-fragments/templates/example", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes"]
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
            "column": 50
          }
        },
        "moduleName": "ember-factory-fragments/templates/example.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("Example!");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "test__model-name");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [2]), 0, 0);
        return morphs;
      },
      statements: [["content", "model.name", ["loc", [null, [2, 30], [2, 44]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("ember-factory-fragments/transforms/array", ["exports"], function (exports) {
  exports["default"] = MF.ArrayTransform;
});
define("ember-factory-fragments/transforms/fragment-array", ["exports"], function (exports) {
  exports["default"] = MF.FragmentArrayTransform;
});
define("ember-factory-fragments/transforms/fragment", ["exports"], function (exports) {
  exports["default"] = MF.FragmentTransform;
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('ember-factory-fragments/config/environment', ['ember'], function(Ember) {
  var prefix = 'ember-factory-fragments';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("ember-factory-fragments/app")["default"].create({"name":"ember-factory-fragments","version":"0.0.0+6a1ac42f"});
}

/* jshint ignore:end */
//# sourceMappingURL=ember-factory-fragments.map