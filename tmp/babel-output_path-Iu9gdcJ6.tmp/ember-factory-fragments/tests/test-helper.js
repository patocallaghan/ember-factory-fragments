define('ember-factory-fragments/tests/test-helper', ['exports', 'ember-factory-fragments/tests/helpers/resolver', 'ember-qunit'], function (exports, _emberFactoryFragmentsTestsHelpersResolver, _emberQunit) {

  (0, _emberQunit.setResolver)(_emberFactoryFragmentsTestsHelpersResolver['default']);
});