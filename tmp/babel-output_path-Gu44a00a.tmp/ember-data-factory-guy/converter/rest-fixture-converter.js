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