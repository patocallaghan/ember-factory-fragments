define('ember-factory-fragments/tests/acceptance/example-test', ['exports', 'qunit', 'ember-data-factory-guy', 'ember-factory-fragments/tests/helpers/module-for-acceptance'], function (exports, _qunit, _emberDataFactoryGuy, _emberFactoryFragmentsTestsHelpersModuleForAcceptance) {

  (0, _emberFactoryFragmentsTestsHelpersModuleForAcceptance['default'])('Acceptance | example', {
    beforeEach: function beforeEach() {
      (0, _emberDataFactoryGuy.mockSetup)();
    },
    afterEach: function afterEach() {
      (0, _emberDataFactoryGuy.mockTeardown)();
    }
  });

  (0, _qunit.test)('visiting /', function (assert) {
    var mock = (0, _emberDataFactoryGuy.buildList)('country', 2);
    mock.unwrap();
    console.log(mock.countries);
    $.mockjax({
      url: "/countries",
      responseText: JSON.stringify(mock.countries)
    });
    // mockFindAll('country').returns({ json: mock });
    visit('/');

    andThen(function () {
      assert.equal(currentURL(), '/');
    });
  });
});