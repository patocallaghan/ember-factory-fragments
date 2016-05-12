define('ember-factory-fragments/routes/example', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    model: function model() {
      this.store.findRecord('country', 1);
    }
  });
});