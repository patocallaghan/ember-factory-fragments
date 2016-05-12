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