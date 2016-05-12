define('ember-data-factory-guy/factory-guy-test-helper', ['exports', 'ember', 'ember-data', 'jquery', 'ember-data-factory-guy/factory-guy', 'ember-data-factory-guy/mocks/mock-update-request', 'ember-data-factory-guy/mocks/mock-create-request', 'ember-data-factory-guy/mocks/mock-query-request', 'ember-data-factory-guy/mocks/mock-query-record-request', 'ember-data-factory-guy/mocks/mock-find-request', 'ember-data-factory-guy/mocks/mock-reload-request', 'ember-data-factory-guy/mocks/mock-find-all-request'], function (exports, _ember, _emberData, _jquery, _emberDataFactoryGuyFactoryGuy, _emberDataFactoryGuyMocksMockUpdateRequest, _emberDataFactoryGuyMocksMockCreateRequest, _emberDataFactoryGuyMocksMockQueryRequest, _emberDataFactoryGuyMocksMockQueryRecordRequest, _emberDataFactoryGuyMocksMockFindRequest, _emberDataFactoryGuyMocksMockReloadRequest, _emberDataFactoryGuyMocksMockFindAllRequest) {
  'use strict';

  var MockServer = _ember['default'].Object.extend({

    setup: function setup() {
      _jquery['default'].mockjaxSettings.logging = false;
      _jquery['default'].mockjaxSettings.responseTime = 0;
    },

    teardown: function teardown() {
      _jquery['default'].mockjax.clear();
    },

    // Look up a controller from the current container
    controllerFor: function controllerFor(name) {
      return this.get('container').lookup('controller:' + name);
    },

    // Set a property on a controller in the current container
    setControllerProp: function setControllerProp(controller_name, property, value) {
      var controller = this.controllerFor(controller_name);
      controller.set(property, value);
    },

    /**
     Using mockjax to stub an http request.
      @param {String} url request url
     @param {Object} json response
     @param {Object} options ajax request options
     */
    stubEndpointForHttpRequest: function stubEndpointForHttpRequest(url, json) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var request = {
        url: url,
        dataType: 'json',
        responseText: json,
        type: options.type || 'GET',
        status: options.status || 200
      };
      if (options.urlParams) {
        request.urlParams = options.urlParams;
      }
      if (options.data) {
        request.data = options.data;
      }

      return _jquery['default'].mockjax(request);
    },
    /**
     Handling ajax GET for handling finding a model
     You can mock failed find by calling `fails()`
      ```js
     // Typically you will use like:
      // To return default factory 'user'
     let mockFind = TestHelper.mockFind('user');
     let userId = mockFind.get('id');
      // or to return custom factory built json object
     let json = FactoryGuy.build('user', 'with_whacky_name', {isDude: true});
     let mockFind = TestHelper.mockFind('user').returns({json});
     let userId = json.get('id');
      // To mock failure case use method fails
     TestHelper.mockFind('user').fails();
      // Then to 'find' the user
     store.find('user', userId);
      // or in acceptance test
     visit('/user'+userId);
     ```
      @param {String} name  name of the fixture ( or modelName ) to find
     @param {String} trait  optional traits (one or more)
     @param {Object} opts  optional fixture options
     */
    mockFind: function mockFind() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var modelName = args[0];

      _ember['default'].assert('[ember-data-factory-guy] mockFind requires at least a model\n     name as first parameter', args.length > 0);

      var json = _emberDataFactoryGuyFactoryGuy['default'].build.apply(_emberDataFactoryGuyFactoryGuy['default'], arguments);
      return new _emberDataFactoryGuyMocksMockFindRequest['default'](modelName).returns({ json: json });
    },
    handleFind: function handleFind() {
      _ember['default'].deprecate("`handleFind` - has been deprecated. Use `mockFind` method instead`", false, { id: 'ember-data-factory-guy.handle-find', until: '2.4.0' });
      return this.mockFind.apply(this, arguments);
    },
    /**
     Handling ajax GET for reloading a record
     You can mock failed find by calling fails
      ```js
     // Typically you will make a model
     let user = make('user');
     // and then to handle reload, use the testHelper.mockReload call to mock a reload
     testHelper.mockReload(user);
      // to mock failure case use method fails
     testHelper.mockReload(user).fails();
     ```
      @param {String} type  model type like 'user' for User model, or a model instance
     @param {String} id  id of record to find
     */
    mockReload: function mockReload() {
      var args = Array.prototype.slice.call(arguments);

      var modelName = undefined,
          id = undefined;
      if (args[0] instanceof _emberData['default'].Model) {
        var record = args[0];
        modelName = record.constructor.modelName;
        id = record.id;
      } else if (typeof args[0] === "string" && typeof parseInt(args[1]) === "number") {
        modelName = args[0];
        id = args[1];
      }

      _ember['default'].assert("To handleFind pass in a model instance or a model type name and an id", modelName && id);

      var json = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertForBuild(modelName, { id: id });
      return new _emberDataFactoryGuyMocksMockReloadRequest['default'](modelName).returns({ json: json });
    },
    handleReload: function handleReload() {
      _ember['default'].deprecate("`handleReload` - has been deprecated. Use `mockReload` method instead`", false, { id: 'ember-data-factory-guy.handle-reload', until: '2.4.0' });
      return this.mockReload.apply(this, arguments);
    },
    /**
     Handling ajax GET for finding all records for a type of model.
     You can mock failed find by passing in success argument as false.
      ```js
     // Pass in the parameters you would normally pass into FactoryGuy.makeList,
     // like fixture name, number of fixtures to make, and optional traits,
     // or fixture options
     let mockFindAll = testHelper.mockFindAll('user', 2, 'with_hats');
      // or to return custom FactoryGuy built json object
     let json = FactoryGuy.buildList('user', 'with_whacky_name', {isDude: true});
     let mockFindAll = TestHelper.mockFindAll('user').returns({json});
      store.findAll('user').then(function(users){
        // 2 users, fisrt with whacky name, second isDude
     });
     ```
      @param {String} name  name of the fixture ( or model ) to find
     @param {Number} number  number of fixtures to create
     @param {String} trait  optional traits (one or more)
     @param {Object} opts  optional fixture options
     */
    mockFindAll: function mockFindAll() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var modelName = args[0];

      _ember['default'].assert('[ember-data-factory-guy] mockFindAll requires at least a model\n     name as first parameter', args.length > 0);

      var mockFindAll = new _emberDataFactoryGuyMocksMockFindAllRequest['default'](modelName);

      if (args.length > 1) {
        var json = _emberDataFactoryGuyFactoryGuy['default'].buildList.apply(_emberDataFactoryGuyFactoryGuy['default'], args);
        mockFindAll.returns({ json: json });
      }
      return mockFindAll;
    },
    handleFindAll: function handleFindAll() {
      _ember['default'].deprecate("`handleFindAll` - has been deprecated. Use `mockFindAll` method instead`", false, { id: 'ember-data-factory-guy.handle-find-all', until: '2.4.0' });
      return this.mockFindAll.apply(this, arguments);
    },
    /**
     Handling ajax GET for finding all records for a type of model with query parameters.
       ```js
      // Create model instances
     let users = FactoryGuy.makeList('user', 2, 'with_hats');
      // Pass in the array of model instances as last argument
     testHelper.mockQuery('user', {name:'Bob', age: 10}).returns({models: users});
      store.query('user', {name:'Bob', age: 10}}).then(function(userInstances){
       // userInstances will be the same of the users that were passed in
     })
     ```
      By omitting the last argument (pass in no records), this simulates a findQuery
     request that returns no records
      ```js
     // Simulate a query that returns no results
     testHelper.mockQuery('user', {age: 10000});
      store.query('user', {age: 10000}}).then(function(userInstances){
       // userInstances will be empty
     })
     ```
      @param {String} modelName  name of the mode like 'user' for User model type
     @param {String} queryParams  the parameters that will be queried
     @param {Array}  array of DS.Model records to be 'returned' by query
     */
    mockQuery: function mockQuery(modelName, queryParams) {
      if (queryParams) {
        _ember['default'].assert('The second argument ( queryParams ) must be an object', _ember['default'].typeOf(queryParams) === 'object');
      }

      return new _emberDataFactoryGuyMocksMockQueryRequest['default'](modelName, queryParams);
    },
    handleQuery: function handleQuery() {
      _ember['default'].deprecate("`handleQuery` - has been deprecated. Use `mockQuery` method instead`", false, { id: 'ember-data-factory-guy.handle-query', until: '2.4.0' });
      return this.mockQuery.apply(this, arguments);
    },
    /**
     Handling ajax GET for finding one record for a type of model with query parameters.
       ```js
      // Create json payload
     let json = FactoryGuy.build('user');
      // Pass in the json in a returns method
     testHelper.mockQueryRecord('user', {name:'Bob', age: 10}).returns({json});
      store.query('user', {name:'Bob', age: 10}}).then(function(userInstance){
       // userInstance will be created from the json payload
     })
     ```
      ```js
      // Create model instance
     let user = FactoryGuy.make('user');
      // Pass in the array of model instances in the returns method
     testHelper.mockQueryRecord('user', {name:'Bob', age: 10}).returns({model:user});
      store.query('user', {name:'Bob', age: 10}}).then(function(userInstance){
       // userInstance will be the same of the users that were passed in
     })
     ```
      By not using returns method to return anything, this simulates a
     store.queryRecord request that returns no records
      ```js
     // Simulate a store.queryRecord that returns no results
     testHelper.mockQueryRecord('user', {age: 10000});
      store.queryRecord('user', {age: 10000}}).then(function(userInstance){
       // userInstance will be empty
     })
     ```
      @param {String} modelName  name of the mode like 'user' for User model type
     @param {String} queryParams  the parameters that will be queried
     @param {Object|DS.Model}  JSON object or DS.Model record to be 'returned' by query
     */
    mockQueryRecord: function mockQueryRecord(modelName, queryParams) {
      if (queryParams) {
        _ember['default'].assert('The second argument ( queryParams ) must be an object', _ember['default'].typeOf(queryParams) === 'object');
      }

      return new _emberDataFactoryGuyMocksMockQueryRecordRequest['default'](modelName, queryParams);
    },
    handleQueryRecord: function handleQueryRecord() {
      _ember['default'].deprecate("`handleQueryRecord` - has been deprecated. Use `mockQueryRecord` method instead`", false, { id: 'ember-data-factory-guy.handle-query-record', until: '2.4.0' });
      return this.mockQueryRecord.apply(this, arguments);
    },
    /**
     Handling ajax POST ( create record ) for a model.
      ```js
     mockCreate('post')
     mockCreate('post').match({title: 'foo'});
     mockCreate('post').match({title: 'foo', user: user});
     mockCreate('post').andReturn({createdAt: new Date()});
     mockCreate('post').match({title: 'foo'}).andReturn({createdAt: new Date()});
     mockCreate('post').match({title: 'foo'}.fails();
     ```
      match - attributes that must be in request json,
     andReturn - attributes to include in response json,
     fails - can include optional status and response attributes
      ```js
     TestHelper.mockCreate('project').fails({
          status: 422, response: {errors: {name: ['Moo bad, Bahh better']}}
        });
     ```
      Note:
     1) Any attributes in match will be added to the response json automatically,
     so you don't need to include them in the returns hash.
      2) As long as all the match attributes are found in the record being created,
     the create will succeed. In other words, there may be other attributes in the
     createRecord call, but you don't have to match them all. For example:
      ```js
     mockCreate('post').match({title: 'foo'});
     store.createRecord('post', {title: 'foo', created_at: new Date()})
     ```
      2) If you match on a belongsTo association, you don't have to include that in the
     returns hash either.
      @param {String} modelName  name of model your creating like 'profile' for Profile
     @param {Object} options  hash of options for handling request
     */
    mockCreate: function mockCreate(modelName) {
      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var url = _emberDataFactoryGuyFactoryGuy['default'].buildURL(modelName);
      return new _emberDataFactoryGuyMocksMockCreateRequest['default'](url, modelName, opts);
    },
    handleCreate: function handleCreate() {
      _ember['default'].deprecate("`handleCreate` - has been deprecated. Use `mockCreate` method instead`", false, { id: 'ember-data-factory-guy.handle-create', until: '2.4.0' });
      return this.mockCreate.apply(this, arguments);
    },
    /**
     Handling ajax PUT ( update record ) for a model type. You can mock
     failed update by calling 'fails' method after setting up the mock
      ```js
     // Typically you will make a model
     let user = make('user');
     // and then to handle update, use the testHelper.mockUpdate call to mock a update
     testHelper.mockUpdate(user);
     or
     // testHelper.mockUpdate('user', user.id);
      // and to mock failure case use method fails
     testHelper.mockUpdate(user).fails();
     ```
      @param {String} type  model type like 'user' for User model, or a model instance
     @param {String} id  id of record to update
     @param {Object} options options object
     */
    mockUpdate: function mockUpdate() {
      var args = Array.prototype.slice.call(arguments);
      _ember['default'].assert("To mockUpdate pass in a model instance or a type and an id", args.length > 0);

      var options = {};
      if (args.length > 1 && typeof args[args.length - 1] === 'object') {
        options = args.pop();
      }

      var model = undefined,
          type = undefined,
          id = undefined;
      var store = _emberDataFactoryGuyFactoryGuy['default'].store;

      if (args[0] instanceof _emberData['default'].Model) {
        model = args[0];
        id = model.id;
        type = model.constructor.modelName;
      } else if (typeof args[0] === "string" && typeof parseInt(args[1]) === "number") {
        type = args[0];
        id = args[1];
        model = store.peekRecord(type, id);
      }
      _ember['default'].assert("To mockUpdate pass in a model instance or a model type name and an id", type && id);

      var url = _emberDataFactoryGuyFactoryGuy['default'].buildURL(type, id);
      return new _emberDataFactoryGuyMocksMockUpdateRequest['default'](url, model, options);
    },
    handleUpdate: function handleUpdate() {
      _ember['default'].deprecate("`handleUpdate` - has been deprecated. Use `mockUpdate` method instead`", false, { id: 'ember-data-factory-guy.handle-update', until: '2.4.0' });
      return this.mockUpdate.apply(this, arguments);
    },
    /**
     Handling ajax DELETE ( delete record ) for a model type. You can mock
     failed delete by passing in success argument as false.
      @param {String} type  model type like 'user' for User model
     @param {String} id  id of record to update
     @param {Boolean} succeed  optional flag to indicate if the request
     should succeed ( default is true )
     */
    mockDelete: function mockDelete(type, id) {
      var succeed = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      // TODO Turn this into a MockClass so it provides `andSuccess`, `fails`, `returns`...
      //succeed = succeed === undefined ? true : succeed;
      this.stubEndpointForHttpRequest(_emberDataFactoryGuyFactoryGuy['default'].buildURL(type, id), null, {
        type: 'DELETE',
        status: succeed ? 200 : 500
      });
    },
    handleDelete: function handleDelete() {
      _ember['default'].deprecate("`handleDelete` - has been deprecated. Use `mockDelete` method instead`", false, { id: 'ember-data-factory-guy.handle-delete', until: '2.4.0' });
      return this.mockDelete.apply(this, arguments);
    }

  });

  var mockServer = MockServer.create();

  var mockSetup = mockServer.setup.bind(mockServer);
  var mockTeardown = mockServer.teardown.bind(mockServer);

  var mockFind = mockServer.mockFind.bind(mockServer);
  var mockFindAll = mockServer.mockFindAll.bind(mockServer);
  var mockReload = mockServer.mockReload.bind(mockServer);
  var mockQuery = mockServer.mockQuery.bind(mockServer);
  var mockQueryRecord = mockServer.mockQueryRecord.bind(mockServer);
  var mockCreate = mockServer.mockCreate.bind(mockServer);
  var mockUpdate = mockServer.mockUpdate.bind(mockServer);
  var mockDelete = mockServer.mockDelete.bind(mockServer);

  exports.mockSetup = mockSetup;
  exports.mockTeardown = mockTeardown;
  exports.mockFind = mockFind;
  exports.mockFindAll = mockFindAll;
  exports.mockReload = mockReload;
  exports.mockQuery = mockQuery;
  exports.mockQueryRecord = mockQueryRecord;
  exports.mockCreate = mockCreate;
  exports.mockUpdate = mockUpdate;
  exports.mockDelete = mockDelete;
  exports['default'] = mockServer;
});