import DS from 'ember-data';
import JSONSerializer from 'ember-factory-fragments/serializers/application';

export default JSONSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    capital: {
      key: 'capital_id'
    }
  }
});

