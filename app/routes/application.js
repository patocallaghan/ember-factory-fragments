import Em from 'ember';

export default Em.Route.extend({
  model() {
    return this.store.findAll('country', 1)
  }
});