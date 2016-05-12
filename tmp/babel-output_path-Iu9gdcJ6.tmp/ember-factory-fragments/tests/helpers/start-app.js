define('ember-factory-fragments/tests/helpers/start-app', ['exports', 'ember', 'ember-factory-fragments/app', 'ember-factory-fragments/config/environment'], function (exports, _ember, _emberFactoryFragmentsApp, _emberFactoryFragmentsConfigEnvironment) {
  exports['default'] = startApp;

  function startApp(attrs) {
    var application = undefined;

    var attributes = _ember['default'].merge({}, _emberFactoryFragmentsConfigEnvironment['default'].APP);
    attributes = _ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    _ember['default'].run(function () {
      application = _emberFactoryFragmentsApp['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }
});