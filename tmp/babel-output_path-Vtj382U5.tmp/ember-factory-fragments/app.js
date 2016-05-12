define('ember-factory-fragments/app', ['exports', 'ember', 'ember-factory-fragments/resolver', 'ember-load-initializers', 'ember-factory-fragments/config/environment'], function (exports, _ember, _emberFactoryFragmentsResolver, _emberLoadInitializers, _emberFactoryFragmentsConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _emberFactoryFragmentsConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _emberFactoryFragmentsConfigEnvironment['default'].podModulePrefix,
    Resolver: _emberFactoryFragmentsResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _emberFactoryFragmentsConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});