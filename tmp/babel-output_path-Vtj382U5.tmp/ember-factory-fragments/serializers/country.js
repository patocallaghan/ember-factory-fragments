define('ember-factory-fragments/serializers/country', ['exports', 'ember-data', 'ember-factory-fragments/serializers/application'], function (exports, _emberData, _emberFactoryFragmentsSerializersApplication) {
  exports['default'] = _emberFactoryFragmentsSerializersApplication['default'].extend(_emberData['default'].EmbeddedRecordsMixin, {
    attrs: {
      cities: { embedded: 'always' },
      weather: { embedded: 'always' },
      regions: {
        serialize: false,
        deserialize: 'records'
      }
    }
  });
});