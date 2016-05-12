define('ember-data-factory-guy/mocks/mock-update-request', ['exports', 'ember', 'jquery', 'ember-data-factory-guy/factory-guy'], function (exports, _ember, _jquery, _emberDataFactoryGuyFactoryGuy) {
  'use strict';

  var MockUpdateRequest = function MockUpdateRequest(url, model, options) {
    var status = options.status || 200;
    var succeed = true;
    var response = null;
    this.timesCalled = 0;
    var self = this;

    if ('succeed' in options) {
      _ember['default'].deprecate('[ember-data-factory-guy] TestHelper.mockUpdate - options.succeed has been deprecated.\n        Use chainable method `succeeds(options)` method instead', options.hasOwnProperty('succeed'), { id: 'ember-data-factory-guy.handle-update', until: '2.4.0' });
      succeed = options.succeed;
    }

    if ('response' in options) {
      response = options.response;
    }

    this.andSucceed = function (options) {
      _ember['default'].deprecate("`andSucceed` - has been deprecated. Use `succeeds(options)` method instead`", false, { id: 'ember-data-factory-guy.and-succeed', until: '2.4.0' });
      return this.succeeds(options);
    };

    this.succeeds = function (options) {
      succeed = true;
      status = options && options.status || 200;
      return this;
    };

    this.andFail = function () {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _ember['default'].deprecate("`andFail` - has been deprecated. Use `fails(options)` method instead`", false, { id: 'ember-data-factory-guy.and-fail', until: '2.4.0' });
      return this.fails(options);
    };

    this.fails = function (options) {
      succeed = false;
      status = options.status || 500;
      if ('response' in options) {
        response = options.response;
      }
      return this;
    };

    this.handler = function () {
      self.timesCalled++;
      if (!succeed) {
        this.status = status;
        if (response !== null) {
          this.responseText = response;
        }
      } else {
        // need to use serialize instead of toJSON to handle polymorphic belongsTo
        var json = model.serialize({ includeId: true });
        this.responseText = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.normalize(model.constructor.modelName, json);
        this.status = 200;
      }
    };
    var requestConfig = {
      url: url,
      dataType: 'json',
      type: _emberDataFactoryGuyFactoryGuy['default'].updateHTTPMethod(),
      response: this.handler
    };

    _jquery['default'].mockjax(requestConfig);
  };

  exports['default'] = MockUpdateRequest;
});