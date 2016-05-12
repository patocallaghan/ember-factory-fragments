define('ember-data-factory-guy/index', ['exports', 'ember-data-factory-guy/factory-guy', 'ember-data-factory-guy/factory-guy-test-helper', 'ember-data-factory-guy/utils/manual-setup'], function (exports, _emberDataFactoryGuyFactoryGuy, _emberDataFactoryGuyFactoryGuyTestHelper, _emberDataFactoryGuyUtilsManualSetup) {
  'use strict';

  exports['default'] = _emberDataFactoryGuyFactoryGuy['default'];
  exports.make = _emberDataFactoryGuyFactoryGuy.make;
  exports.makeList = _emberDataFactoryGuyFactoryGuy.makeList;
  exports.build = _emberDataFactoryGuyFactoryGuy.build;
  exports.buildList = _emberDataFactoryGuyFactoryGuy.buildList;
  exports.clearStore = _emberDataFactoryGuyFactoryGuy.clearStore;
  exports.manualSetup = _emberDataFactoryGuyUtilsManualSetup['default'];
  exports.mockSetup = _emberDataFactoryGuyFactoryGuyTestHelper.mockSetup;
  exports.mockTeardown = _emberDataFactoryGuyFactoryGuyTestHelper.mockTeardown;
  exports.mockFind = _emberDataFactoryGuyFactoryGuyTestHelper.mockFind;
  exports.mockFindAll = _emberDataFactoryGuyFactoryGuyTestHelper.mockFindAll;
  exports.mockReload = _emberDataFactoryGuyFactoryGuyTestHelper.mockReload;
  exports.mockQuery = _emberDataFactoryGuyFactoryGuyTestHelper.mockQuery;
  exports.mockQueryRecord = _emberDataFactoryGuyFactoryGuyTestHelper.mockQueryRecord;
  exports.mockCreate = _emberDataFactoryGuyFactoryGuyTestHelper.mockCreate;
  exports.mockUpdate = _emberDataFactoryGuyFactoryGuyTestHelper.mockUpdate;
  exports.mockDelete = _emberDataFactoryGuyFactoryGuyTestHelper.mockDelete;
});