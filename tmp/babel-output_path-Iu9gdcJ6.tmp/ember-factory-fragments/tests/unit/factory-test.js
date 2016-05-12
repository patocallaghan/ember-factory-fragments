define('ember-factory-fragments/tests/unit/factory-test', ['exports', 'ember-qunit', 'ember-data-factory-guy'], function (exports, _emberQunit, _emberDataFactoryGuy) {

  (0, _emberQunit.moduleForModel)('country', 'Unit | Model | country', {
    needs: ['model:city', 'model:weather'],
    beforeEach: function beforeEach() {
      (0, _emberDataFactoryGuy.manualSetup)(this.container);
    }
  });

  (0, _emberQunit.test)('Creates a country', function () {
    var country = (0, _emberDataFactoryGuy.make)('country');
    ok(country);
  });
});