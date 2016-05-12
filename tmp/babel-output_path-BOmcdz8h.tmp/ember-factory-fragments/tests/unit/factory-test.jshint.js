define('ember-factory-fragments/tests/unit/factory-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/factory-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'unit/factory-test.js should pass jshint.\nunit/factory-test.js: line 13, col 3, \'ok\' is not defined.\n\n1 error');
  });
});