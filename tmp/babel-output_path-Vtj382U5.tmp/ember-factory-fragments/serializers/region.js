define('ember-factory-fragments/serializers/region', ['exports', 'ember-data', 'ember-factory-fragments/serializers/application'], function (exports, _emberData, _emberFactoryFragmentsSerializersApplication) {
  exports['default'] = _emberFactoryFragmentsSerializersApplication['default'].extend(_emberData['default'].EmbeddedRecordsMixin, {
    attrs: {
      capital: {
        key: 'capital_id'
      }
    }
  });
});