QUnit.module('JSHint - routes/example.js');
QUnit.test('should pass jshint', function(assert) {
  assert.expect(1);
  assert.ok(false, 'routes/example.js should pass jshint.\nroutes/example.js: line 0, col 0, Bad option: \'ender\'.\nroutes/example.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nroutes/example.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\nroutes/example.js: line 4, col 3, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nroutes/example.js: line 5, col 5, Missing "use strict" statement.\n\n5 errors');
});
