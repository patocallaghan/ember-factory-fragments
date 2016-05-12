define('ember-factory-fragments/tests/models/region.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/region.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'models/region.js should pass jshint.\nmodels/region.js: line 0, col 0, Bad option: \'ender\'.\nmodels/region.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/region.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
  });
});