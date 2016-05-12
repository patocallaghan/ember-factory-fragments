define('ember-factory-fragments/tests/acceptance/example-test', ['exports', 'qunit', 'ember-data-factory-guy', 'ember-factory-fragments/tests/helpers/module-for-acceptance'], function (exports, _qunit, _emberDataFactoryGuy, _emberFactoryFragmentsTestsHelpersModuleForAcceptance) {

  (0, _emberFactoryFragmentsTestsHelpersModuleForAcceptance['default'])('Acceptance | example', {
    beforeEach: function beforeEach() {
      (0, _emberDataFactoryGuy.mockSetup)();
    },
    afterEach: function afterEach() {
      (0, _emberDataFactoryGuy.mockTeardown)();
    }
  });

  (0, _qunit.test)('visiting /', function (assert) {
    var mock = (0, _emberDataFactoryGuy.buildList)('country', 2);
    mock.unwrap();
    console.log(mock.countries);
    $.mockjax({
      url: "/countries",
      responseText: JSON.stringify(mock.countries)
    });
    // mockFindAll('country').returns({ json: mock });
    visit('/');

    andThen(function () {
      assert.equal(currentURL(), '/');
    });
  });
});
define('ember-factory-fragments/tests/acceptance/example-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - acceptance/example-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'acceptance/example-test.js should pass jshint.\nacceptance/example-test.js: line 2, col 21, \'mockFindAll\' is defined but never used.\n\n1 error');
  });
});
define('ember-factory-fragments/tests/adapters/application.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - adapters/application.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'adapters/application.js should pass jshint.\nadapters/application.js: line 0, col 0, Bad option: \'ender\'.\nadapters/application.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nadapters/application.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
  });
});
define('ember-factory-fragments/tests/app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'app.js should pass jshint.\napp.js: line 0, col 0, Bad option: \'ender\'.\napp.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 3, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 4, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 6, col 1, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\napp.js: line 13, col 3, \'object short notation\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\napp.js: line 18, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n8 errors');
  });
});
define('ember-factory-fragments/tests/controllers/application.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - controllers/application.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'controllers/application.js should pass jshint.\ncontrollers/application.js: line 0, col 0, Bad option: \'ender\'.\ncontrollers/application.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/application.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
  });
});
define('ember-factory-fragments/tests/factories/city', ['exports', 'ember-data-factory-guy'], function (exports, _emberDataFactoryGuy) {

  _emberDataFactoryGuy['default'].define('city', {
    'default': {
      name: 'New York'
    },
    maine: {
      name: 'Maine'
    }
  });
});
define('ember-factory-fragments/tests/factories/city.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - factories/city.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'factories/city.js should pass jshint.');
  });
});
define('ember-factory-fragments/tests/factories/country', ['exports', 'ember-data-factory-guy'], function (exports, _emberDataFactoryGuy) {

  _emberDataFactoryGuy['default'].define('country', {
    'default': {
      name: 'America',
      cities: _emberDataFactoryGuy['default'].hasMany('city', 3),
      weather: _emberDataFactoryGuy['default'].belongsTo('weather'),
      regions: _emberDataFactoryGuy['default'].hasMany('region', 1)
    },
    european: {
      name: 'Ireland'
    }
  });
});
define('ember-factory-fragments/tests/factories/country.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - factories/country.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'factories/country.js should pass jshint.');
  });
});
define('ember-factory-fragments/tests/factories/region', ['exports', 'ember-data-factory-guy'], function (exports, _emberDataFactoryGuy) {

  _emberDataFactoryGuy['default'].define('region', {
    'default': {
      name: 'east',
      capital: _emberDataFactoryGuy['default'].belongsTo('city')
    }
  });
});
define('ember-factory-fragments/tests/factories/region.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - factories/region.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'factories/region.js should pass jshint.');
  });
});
define('ember-factory-fragments/tests/factories/state', ['exports', 'ember-data-factory-guy'], function (exports, _emberDataFactoryGuy) {

  _emberDataFactoryGuy['default'].define('state', {
    'default': {
      id: 'state.new_jersey',
      name: 'New Jersey'
    },
    nebraska: {
      id: 'state.nebraska',
      name: 'Nebraska'
    },
    delaware: {
      id: 'state.delaware',
      name: 'Delaware'
    }
  });
});
define('ember-factory-fragments/tests/factories/state.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - factories/state.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'factories/state.js should pass jshint.');
  });
});
define('ember-factory-fragments/tests/factories/weather', ['exports', 'ember-data-factory-guy'], function (exports, _emberDataFactoryGuy) {

  _emberDataFactoryGuy['default'].define('weather', {
    'default': {
      temperature: 20,
      description: 'Sunny'
    }
  });
});
define('ember-factory-fragments/tests/factories/weather.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - factories/weather.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'factories/weather.js should pass jshint.');
  });
});
define('ember-factory-fragments/tests/helpers/destroy-app', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = destroyApp;

  function destroyApp(application) {
    _ember['default'].run(application, 'destroy');
  }
});
define('ember-factory-fragments/tests/helpers/destroy-app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/destroy-app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/destroy-app.js should pass jshint.');
  });
});
define('ember-factory-fragments/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'ember-factory-fragments/tests/helpers/start-app', 'ember-factory-fragments/tests/helpers/destroy-app'], function (exports, _qunit, _emberFactoryFragmentsTestsHelpersStartApp, _emberFactoryFragmentsTestsHelpersDestroyApp) {
  exports['default'] = function (name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _emberFactoryFragmentsTestsHelpersStartApp['default'])();

        if (options.beforeEach) {
          options.beforeEach.apply(this, arguments);
        }
      },

      afterEach: function afterEach() {
        if (options.afterEach) {
          options.afterEach.apply(this, arguments);
        }

        (0, _emberFactoryFragmentsTestsHelpersDestroyApp['default'])(this.application);
      }
    });
  };
});
define('ember-factory-fragments/tests/helpers/module-for-acceptance.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/module-for-acceptance.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/module-for-acceptance.js should pass jshint.');
  });
});
define('ember-factory-fragments/tests/helpers/resolver', ['exports', 'ember-factory-fragments/resolver', 'ember-factory-fragments/config/environment'], function (exports, _emberFactoryFragmentsResolver, _emberFactoryFragmentsConfigEnvironment) {

  var resolver = _emberFactoryFragmentsResolver['default'].create();

  resolver.namespace = {
    modulePrefix: _emberFactoryFragmentsConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _emberFactoryFragmentsConfigEnvironment['default'].podModulePrefix
  };

  exports['default'] = resolver;
});
define('ember-factory-fragments/tests/helpers/resolver.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/resolver.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/resolver.js should pass jshint.');
  });
});
define('ember-factory-fragments/tests/helpers/start-app', ['exports', 'ember', 'ember-factory-fragments/app', 'ember-factory-fragments/config/environment'], function (exports, _ember, _emberFactoryFragmentsApp, _emberFactoryFragmentsConfigEnvironment) {
  exports['default'] = startApp;

  function startApp(attrs) {
    var application = undefined;

    var attributes = _ember['default'].merge({}, _emberFactoryFragmentsConfigEnvironment['default'].APP);
    attributes = _ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    _ember['default'].run(function () {
      application = _emberFactoryFragmentsApp['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }
});
define('ember-factory-fragments/tests/helpers/start-app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/start-app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/start-app.js should pass jshint.');
  });
});
define("ember-factory-fragments/tests/integration/example-test", ["exports"], function (exports) {});
define('ember-factory-fragments/tests/integration/example-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - integration/example-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/example-test.js should pass jshint.');
  });
});
define('ember-factory-fragments/tests/models/city.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/city.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'models/city.js should pass jshint.\nmodels/city.js: line 0, col 0, Bad option: \'ender\'.\nmodels/city.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/city.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
  });
});
define('ember-factory-fragments/tests/models/country.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/country.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'models/country.js should pass jshint.\nmodels/country.js: line 0, col 0, Bad option: \'ender\'.\nmodels/country.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/country.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/country.js: line 4, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n4 errors');
  });
});
define('ember-factory-fragments/tests/models/region.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/region.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'models/region.js should pass jshint.\nmodels/region.js: line 0, col 0, Bad option: \'ender\'.\nmodels/region.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/region.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
  });
});
define('ember-factory-fragments/tests/models/state.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/state.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'models/state.js should pass jshint.\nmodels/state.js: line 0, col 0, Bad option: \'ender\'.\nmodels/state.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/state.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
  });
});
define('ember-factory-fragments/tests/models/weather.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/weather.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'models/weather.js should pass jshint.\nmodels/weather.js: line 0, col 0, Bad option: \'ender\'.\nmodels/weather.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/weather.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/weather.js: line 4, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n4 errors');
  });
});
define('ember-factory-fragments/tests/resolver.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - resolver.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'resolver.js should pass jshint.\nresolver.js: line 0, col 0, Bad option: \'ender\'.\nresolver.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nresolver.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
  });
});
define('ember-factory-fragments/tests/router.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - router.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'router.js should pass jshint.\nrouter.js: line 0, col 0, Bad option: \'ender\'.\nrouter.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nrouter.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nrouter.js: line 4, col 1, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nrouter.js: line 9, col 3, Missing "use strict" statement.\nrouter.js: line 12, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n6 errors');
  });
});
define('ember-factory-fragments/tests/routes/application.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - routes/application.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'routes/application.js should pass jshint.\nroutes/application.js: line 0, col 0, Bad option: \'ender\'.\nroutes/application.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nroutes/application.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\nroutes/application.js: line 4, col 3, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nroutes/application.js: line 5, col 5, Missing "use strict" statement.\nroutes/application.js: line 5, col 44, Missing semicolon.\n\n6 errors');
  });
});
define('ember-factory-fragments/tests/routes/example.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - routes/example.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'routes/example.js should pass jshint.\nroutes/example.js: line 0, col 0, Bad option: \'ender\'.\nroutes/example.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nroutes/example.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\nroutes/example.js: line 4, col 3, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nroutes/example.js: line 5, col 5, Missing "use strict" statement.\n\n5 errors');
  });
});
define('ember-factory-fragments/tests/serializers/application.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - serializers/application.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'serializers/application.js should pass jshint.\nserializers/application.js: line 0, col 0, Bad option: \'ender\'.\nserializers/application.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nserializers/application.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nserializers/application.js: line 4, col 1, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nserializers/application.js: line 6, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\nserializers/application.js: line 7, col 3, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nserializers/application.js: line 7, col 31, \'default parameters\' is only available in ES6 (use \'esversion: 6\').\nserializers/application.js: line 8, col 5, Missing "use strict" statement.\nserializers/application.js: line 11, col 3, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nserializers/application.js: line 12, col 5, Missing "use strict" statement.\nserializers/application.js: line 14, col 3, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nserializers/application.js: line 15, col 5, Missing "use strict" statement.\n\n12 errors');
  });
});
define('ember-factory-fragments/tests/serializers/country.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - serializers/country.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'serializers/country.js should pass jshint.\nserializers/country.js: line 0, col 0, Bad option: \'ender\'.\nserializers/country.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nserializers/country.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nserializers/country.js: line 4, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n4 errors');
  });
});
define('ember-factory-fragments/tests/serializers/region.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - serializers/region.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'serializers/region.js should pass jshint.\nserializers/region.js: line 0, col 0, Bad option: \'ender\'.\nserializers/region.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nserializers/region.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nserializers/region.js: line 4, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n4 errors');
  });
});
define('ember-factory-fragments/tests/test-helper', ['exports', 'ember-factory-fragments/tests/helpers/resolver', 'ember-qunit'], function (exports, _emberFactoryFragmentsTestsHelpersResolver, _emberQunit) {

  (0, _emberQunit.setResolver)(_emberFactoryFragmentsTestsHelpersResolver['default']);
});
define('ember-factory-fragments/tests/test-helper.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - test-helper.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass jshint.');
  });
});
define('ember-factory-fragments/tests/unit/factory-test', ['exports', 'ember-qunit', 'ember-data-factory-guy'], function (exports, _emberQunit, _emberDataFactoryGuy) {

  (0, _emberQunit.moduleForModel)('country', 'Unit | Model | country', {
    needs: ['model:city', 'model:weather'],
    beforeEach: function beforeEach() {
      (0, _emberDataFactoryGuy.manualSetup)(this.container);
    }
  });

  (0, _emberQunit.test)('Creates a country', function () {
    var country = (0, _emberDataFactoryGuy.make)('country');
    ok(country);
  });
});
define('ember-factory-fragments/tests/unit/factory-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/factory-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'unit/factory-test.js should pass jshint.\nunit/factory-test.js: line 13, col 3, \'ok\' is not defined.\n\n1 error');
  });
});
define('ember-factory-fragments/tests/unit/models/region-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForModel)('region', 'Unit | Model | region', {
    // Specify the other units that are required for this test.
    needs: []
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });
});
define('ember-factory-fragments/tests/unit/models/region-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/models/region-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/region-test.js should pass jshint.');
  });
});
define('ember-factory-fragments/tests/unit/models/state-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForModel)('state', 'Unit | Model | state', {
    // Specify the other units that are required for this test.
    needs: []
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });
});
define('ember-factory-fragments/tests/unit/models/state-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/models/state-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/state-test.js should pass jshint.');
  });
});
/* jshint ignore:start */

require('ember-factory-fragments/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;

/* jshint ignore:end */
//# sourceMappingURL=tests.map