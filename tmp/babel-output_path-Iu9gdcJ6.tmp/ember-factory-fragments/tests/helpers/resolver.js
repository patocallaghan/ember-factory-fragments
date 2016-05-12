define('ember-factory-fragments/tests/helpers/resolver', ['exports', 'ember-factory-fragments/resolver', 'ember-factory-fragments/config/environment'], function (exports, _emberFactoryFragmentsResolver, _emberFactoryFragmentsConfigEnvironment) {

  var resolver = _emberFactoryFragmentsResolver['default'].create();

  resolver.namespace = {
    modulePrefix: _emberFactoryFragmentsConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _emberFactoryFragmentsConfigEnvironment['default'].podModulePrefix
  };

  exports['default'] = resolver;
});