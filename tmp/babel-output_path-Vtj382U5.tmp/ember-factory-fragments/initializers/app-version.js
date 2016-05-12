define('ember-factory-fragments/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'ember-factory-fragments/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _emberFactoryFragmentsConfigEnvironment) {
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(_emberFactoryFragmentsConfigEnvironment['default'].APP.name, _emberFactoryFragmentsConfigEnvironment['default'].APP.version)
  };
});