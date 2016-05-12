import { test } from 'qunit';
import { buildList, mockFindAll, mockSetup, mockTeardown } from 'ember-data-factory-guy';
import moduleForAcceptance from 'ember-factory-fragments/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | example', {
  beforeEach() {
    mockSetup();
  },
  afterEach() {
    mockTeardown();
  }
});

test('visiting /', function(assert) {
  let mock = buildList('country', 2);
  mock.unwrap();
  $.mockjax({
    url: "/countries",
    responseText: JSON.stringify(mock.countries)
  });
  // mockFindAll('country').returns({ json: mock });
  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/');
  });
});
