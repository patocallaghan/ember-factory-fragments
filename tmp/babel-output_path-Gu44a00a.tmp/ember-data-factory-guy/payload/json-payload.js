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