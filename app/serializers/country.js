import DS from 'ember-data';
import JSONSerializer from 'ember-factory-fragments/serializers/application';

export default JSONSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    cities: { embedded: 'always' },
    weather: { embedded: 'always' },
    regions: {
      serialize: false,
      deserialize: 'records'
    }
  }
});
