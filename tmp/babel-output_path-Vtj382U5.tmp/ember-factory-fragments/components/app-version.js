define('ember-factory-fragments/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'ember-factory-fragments/config/environment'], function (exports, _emberCliAppVersionComponentsAppVersion, _emberFactoryFragmentsConfigEnvironment) {

  var name = _emberFactoryFragmentsConfigEnvironment['default'].APP.name;
  var version = _emberFactoryFragmentsConfigEnvironment['default'].APP.version;

  exports['default'] = _emberCliAppVersionComponentsAppVersion['default'].extend({
    version: version,
    name: name
  });
});