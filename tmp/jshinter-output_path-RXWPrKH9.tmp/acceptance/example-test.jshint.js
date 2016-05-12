QUnit.module('JSHint - acceptance/example-test.js');
QUnit.test('should pass jshint', function(assert) {
  assert.expect(1);
  assert.ok(false, 'acceptance/example-test.js should pass jshint.\nacceptance/example-test.js: line 2, col 21, \'mockFindAll\' is defined but never used.\n\n1 error');
});
