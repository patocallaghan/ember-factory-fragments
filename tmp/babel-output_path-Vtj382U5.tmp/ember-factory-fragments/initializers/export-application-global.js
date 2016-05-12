define('ember-factory-fragments/initializers/export-application-global', ['exports', 'ember', 'ember-factory-fragments/config/environment'], function (exports, _ember, _emberFactoryFragmentsConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_emberFactoryFragmentsConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var value = _emberFactoryFragmentsConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_emberFactoryFragmentsConfigEnvironment['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});