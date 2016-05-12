define('ember-factory-fragments/tests/serializers/region.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - serializers/region.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'serializers/region.js should pass jshint.\nserializers/region.js: line 0, col 0, Bad option: \'ender\'.\nserializers/region.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nserializers/region.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nserializers/region.js: line 4, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n4 errors');
  });
});