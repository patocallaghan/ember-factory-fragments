QUnit.module('JSHint - serializers/country.js');
QUnit.test('should pass jshint', function(assert) {
  assert.expect(1);
  assert.ok(false, 'serializers/country.js should pass jshint.\nserializers/country.js: line 0, col 0, Bad option: \'ender\'.\nserializers/country.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nserializers/country.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nserializers/country.js: line 4, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n4 errors');
});
