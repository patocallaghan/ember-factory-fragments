QUnit.module('JSHint - routes/application.js');
QUnit.test('should pass jshint', function(assert) {
  assert.expect(1);
  assert.ok(false, 'routes/application.js should pass jshint.\nroutes/application.js: line 0, col 0, Bad option: \'ender\'.\nroutes/application.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nroutes/application.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\nroutes/application.js: line 4, col 3, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nroutes/application.js: line 5, col 5, Missing "use strict" statement.\nroutes/application.js: line 5, col 44, Missing semicolon.\n\n6 errors');
});
