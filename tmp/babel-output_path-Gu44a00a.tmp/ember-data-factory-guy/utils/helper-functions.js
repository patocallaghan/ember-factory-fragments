define('ember-data-factory-guy/utils/helper-functions', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  function isEquivalent(a, b) {
    var type = _ember['default'].typeOf(a);
    if (type !== _ember['default'].typeOf(b)) {
      return false;
    }
    switch (type) {
      case 'object':
        return objectIsEquivalent(a, b);
      case 'array':
        return arrayIsEquivalent(a, b);
      default:
        return a === b;
    }
  }

  function arrayIsEquivalent(arrayA, arrayB) {
    if (arrayA.length !== arrayB.length) {
      return false;
    }
    return arrayA.every(function (item, index) {
      return isEquivalent(item, arrayB[index]);
    });
  }

  function objectIsEquivalent(objectA, objectB) {
    var aProps = Object.keys(objectA);
    var bProps = Object.keys(objectB);
    if (aProps.length !== bProps.length) {
      return false;
    }
    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];
      var aEntry = objectA[propName];
      var bEntry = objectB[propName];
      if (!isEquivalent(aEntry, bEntry)) {
        return false;
      }
    }
    return true;
  }

  exports.isEquivalent = isEquivalent;
});