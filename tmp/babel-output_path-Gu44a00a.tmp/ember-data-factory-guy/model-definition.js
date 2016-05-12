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