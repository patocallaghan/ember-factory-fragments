define('ember-data-factory-guy/utils/manual-setup', ['exports', 'ember-data-factory-guy/factory-guy', 'ember-data-factory-guy/factory-guy-test-helper', 'ember-data-factory-guy/utils/load-factories'], function (exports, _emberDataFactoryGuyFactoryGuy, _emberDataFactoryGuyFactoryGuyTestHelper, _emberDataFactoryGuyUtilsLoadFactories) {
  // For manually setting up FactoryGuy in unit/integration tests where the applicaiton is not started
  'use strict';

  exports['default'] = function (container) {
    _emberDataFactoryGuyFactoryGuy['default'].setStore(container.lookup('service:store'));
    _emberDataFactoryGuyFactoryGuyTestHelper['default'].set('container', container);
    _emberDataFactoryGuyFactoryGuy['default'].resetDefinitions();
    (0, _emberDataFactoryGuyUtilsLoadFactories['default'])();
  };
});