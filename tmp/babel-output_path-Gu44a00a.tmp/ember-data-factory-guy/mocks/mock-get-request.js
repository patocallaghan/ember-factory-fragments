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