define('ember-factory-fragments/router', ['exports', 'ember', 'ember-factory-fragments/config/environment'], function (exports, _ember, _emberFactoryFragmentsConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _emberFactoryFragmentsConfigEnvironment['default'].locationType
  });

  Router.map(function () {
    this.route('example');
  });

  exports['default'] = Router;
});