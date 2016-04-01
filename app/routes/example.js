import Em from 'ember';

export default Em.Route.extend({
  model() {
    this.store.findRecord('country', 1);
  }
});