import DS from 'ember-data';

let restSerializer = DS.RESTSerializer.create();

export default DS.JSONSerializer.extend({
  serialize(snapshot, options = {}) {
    options.includeId = true;
    return this._super(snapshot, options);
  },
  keyForAttribute(attr) {
    return Em.String.decamelize(attr);
  },
  keyForRelationship(attr) {
    return Em.String.decamelize(attr);
  },
  modelNameFromPayloadKey: restSerializer.modelNameFromPayloadKey,
  pushPayload: restSerializer.pushPayload
});
