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