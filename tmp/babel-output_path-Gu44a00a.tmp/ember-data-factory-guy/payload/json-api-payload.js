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