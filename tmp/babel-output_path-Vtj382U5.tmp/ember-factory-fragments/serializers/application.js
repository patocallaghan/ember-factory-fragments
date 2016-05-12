define('ember-factory-fragments/serializers/application', ['exports', 'ember', 'ember-data'], function (exports, _ember, _emberData) {

  var restSerializer = _emberData['default'].RESTSerializer.create();

  exports['default'] = _emberData['default'].JSONSerializer.extend({
    serialize: function serialize(snapshot) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      options.includeId = true;
      return this._super(snapshot, options);
    },
    keyForAttribute: function keyForAttribute(attr) {
      return _ember['default'].String.decamelize(attr);
    },
    keyForRelationship: function keyForRelationship(attr) {
      return _ember['default'].String.decamelize(attr);
    },
    modelNameFromPayloadKey: restSerializer.modelNameFromPayloadKey,
    pushPayload: restSerializer.pushPayload
  });
});