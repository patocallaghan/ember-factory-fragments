define('ember-factory-fragments/tests/models/state.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/state.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'models/state.js should pass jshint.\nmodels/state.js: line 0, col 0, Bad option: \'ender\'.\nmodels/state.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/state.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
  });
});