define('ember-factory-fragments/tests/models/weather.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/weather.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'models/weather.js should pass jshint.\nmodels/weather.js: line 0, col 0, Bad option: \'ender\'.\nmodels/weather.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/weather.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/weather.js: line 4, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n4 errors');
  });
});