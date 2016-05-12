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