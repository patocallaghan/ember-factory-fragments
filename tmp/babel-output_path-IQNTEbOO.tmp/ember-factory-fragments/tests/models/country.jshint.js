define('ember-factory-fragments/tests/models/country.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/country.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'models/country.js should pass jshint.\nmodels/country.js: line 0, col 0, Bad option: \'ender\'.\nmodels/country.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/country.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/country.js: line 4, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n4 errors');
  });
});