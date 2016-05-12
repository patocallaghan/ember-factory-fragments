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