define('ember-factory-fragments/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'ember-factory-fragments/tests/helpers/start-app', 'ember-factory-fragments/tests/helpers/destroy-app'], function (exports, _qunit, _emberFactoryFragmentsTestsHelpersStartApp, _emberFactoryFragmentsTestsHelpersDestroyApp) {
  exports['default'] = function (name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _emberFactoryFragmentsTestsHelpersStartApp['default'])();

        if (options.beforeEach) {
          options.beforeEach.apply(this, arguments);
        }
      },

      afterEach: function afterEach() {
        if (options.afterEach) {
          options.afterEach.apply(this, arguments);
        }

        (0, _emberFactoryFragmentsTestsHelpersDestroyApp['default'])(this.application);
      }
    });
  };
});