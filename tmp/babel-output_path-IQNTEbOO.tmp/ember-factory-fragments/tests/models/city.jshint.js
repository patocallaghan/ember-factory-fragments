define('ember-factory-fragments/tests/models/city.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/city.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'models/city.js should pass jshint.\nmodels/city.js: line 0, col 0, Bad option: \'ender\'.\nmodels/city.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/city.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
  });
});