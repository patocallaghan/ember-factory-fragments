define('ember-factory-fragments/initializers/ember-data-factory-guy', ['exports', 'ember-data-factory-guy/utils/manual-setup'], function (exports, _emberDataFactoryGuyUtilsManualSetup) {
  exports['default'] = {
    name: 'ember-data-factory-guy',
    after: 'ember-data',

    initialize: function initialize(application) {
      if (arguments.length > 1) {
        application = arguments[1];
      }
      var container = application.__container__;
      (0, _emberDataFactoryGuyUtilsManualSetup['default'])(container);
    }
  };
});