import DS from 'ember-data';
import BaseSerializer from 'ember-factory-fragments/serializers/application';

export default BaseSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    cities: { embedded: 'always' },
    weather: { embedded: 'always' }
  }
});
