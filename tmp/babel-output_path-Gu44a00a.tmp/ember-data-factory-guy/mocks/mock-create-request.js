define('ember-data-factory-guy/mocks/mock-create-request', ['exports', 'ember', 'ember-data-factory-guy/factory-guy', 'jquery'], function (exports, _ember, _emberDataFactoryGuyFactoryGuy, _jquery) {
  'use strict';

  var MockCreateRequest = function MockCreateRequest(url, modelName, options) {
    var status = options.status;
    var succeed = options.succeed === undefined ? true : options.succeed;
    var matchArgs = options.match;
    var returnArgs = options.returns;
    var responseJson = {};
    var expectedRequest = {};
    var store = _emberDataFactoryGuyFactoryGuy['default'].store;

    this.calculate = function () {
      if (matchArgs) {
        // Using this technique to get properly serialized payload.
        // Although it's not ideal to have to create and delete a record,
        // TODO: Figure out how to use serializer without a record instance
        var tmpRecord = store.createRecord(modelName, matchArgs);
        expectedRequest = tmpRecord.serialize();
        tmpRecord.deleteRecord();
      }

      if (succeed) {
        var modelClass = store.modelFor(modelName);
        responseJson = _jquery['default'].extend({}, matchArgs, returnArgs);
        // Remove belongsTo associations since they will already be set when you called
        // createRecord, so they don't need to be returned.
        _ember['default'].get(modelClass, 'relationshipsByName').forEach(function (relationship) {
          if (relationship.kind === 'belongsTo') {
            delete responseJson[relationship.key];
          }
        });
      }
    };

    this.match = function (matches) {
      matchArgs = matches;
      this.calculate();
      return this;
    };

    this.returns = function (returns) {
      returnArgs = returns;
      this.calculate();
      return this;
    };

    this.andReturn = function (returns) {
      _ember['default'].deprecate('[ember-data-factory-guy] mockCreate.andReturn method has been deprecated.\n        Use chainable method `returns()` instead', !options.hasOwnProperty('succeed'), { id: 'ember-data-factory-guy.handle-create-and-return', until: '2.4.0' });
      return this.returns(returns);
    };

    this.andFail = function () {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _ember['default'].deprecate("`andFail` - has been deprecated. Use `fails(options)` method instead`", false, { id: 'ember-data-factory-guy.and-fail', until: '2.4.0' });
      return this.fails(options);
    };

    this.fails = function () {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      succeed = false;
      status = options.status || 500;
      if (options.response) {
        var errors = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertResponseErrors(options.response);
        responseJson = errors;
      }
      return this;
    };

    // for supporting older ( non chaining methods ) style of passing in options
    _ember['default'].deprecate('[ember-data-factory-guy] TestHelper.mockCreate - options.succeed has been deprecated.\n      Use chainable method `andFail()` instead', !options.hasOwnProperty('succeed'), { id: 'ember-data-factory-guy.handle-create-succeed-options', until: '2.4.0' });
    _ember['default'].deprecate('[ember-data-factory-guy] TestHelper.mockCreate - options.match has been deprecated.\n      Use chainable method `match()` instead', !options.hasOwnProperty('match'), { id: 'ember-data-factory-guy.handle-create-match-options', until: '2.4.0' });
    _ember['default'].deprecate('[ember-data-factory-guy] TestHelper.mockCreate - options.returns has been deprecated.\n      Use chainable method `returns()` instead', !options.hasOwnProperty('returns'), { id: 'ember-data-factory-guy.handle-create-returns-options', until: '2.4.0' });
    if (succeed) {
      this.calculate();
    } else {
      this.fails(options);
    }

    var attributesMatch = function attributesMatch(requestData, expectedData) {
      // convert to json-api style data for standardization purposes
      var allMatch = true;
      if (!expectedData.data) {
        expectedData = store.normalize(modelName, expectedData);
      }
      if (!requestData.data) {
        var serializer = store.serializerFor(modelName);
        var transformedModelKey = serializer.payloadKeyFromModelName(modelName);
        if (requestData[transformedModelKey]) {
          requestData = store.normalize(modelName, requestData[transformedModelKey]);
        }
      }
      var expectedAttributes = expectedData.data.attributes;
      var requestedAttributes = requestData.data.attributes;
      for (var attribute in expectedAttributes) {
        if (expectedAttributes[attribute]) {
          // compare as strings for date comparison
          var requestAttribute = requestedAttributes[attribute].toString();
          var expectedAttribute = expectedAttributes[attribute].toString();
          if (requestAttribute !== expectedAttribute) {
            allMatch = false;
            break;
          }
        }
      }
      return allMatch;
    };

    /*
     Setting the id at the very last minute, so that calling calculate
     again and again does not mess with id, and it's reset for each call.
     */
    function modelId() {
      if (_ember['default'].isPresent(returnArgs) && _ember['default'].isPresent(returnArgs['id'])) {
        return returnArgs['id'];
      } else {
        var definition = _emberDataFactoryGuyFactoryGuy['default'].findModelDefinition(modelName);
        return definition.nextId();
      }
    }

    this.handler = function (settings) {
      // need to clone the response since it could be used a few times in a row,
      // in a loop where you're doing createRecord of same model type
      var finalResponseJson = _jquery['default'].extend({}, true, responseJson);

      if (succeed) {
        if (matchArgs) {
          var requestData = JSON.parse(settings.data);
          if (!attributesMatch(requestData, expectedRequest)) {
            return false;
          }
        }
        this.status = 200;
        // Setting the id at the very last minute, so that calling calculate
        // again and again does not mess with id, and it's reset for each call
        finalResponseJson.id = modelId();
        finalResponseJson = _emberDataFactoryGuyFactoryGuy['default'].fixtureBuilder.convertForBuild(modelName, finalResponseJson);
      } else {
        this.status = status;
      }
      this.responseText = finalResponseJson;
    };

    var requestConfig = {
      url: url,
      dataType: 'json',
      type: 'POST',
      response: this.handler
    };

    _jquery['default'].mockjax(requestConfig);
  };

  exports['default'] = MockCreateRequest;
});