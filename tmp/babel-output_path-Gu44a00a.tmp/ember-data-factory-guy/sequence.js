define("ember-data-factory-guy/sequence", ["exports"], function (exports) {
  "use strict";

  exports["default"] = function (fn) {
    var index = 1;
    this.next = function () {
      return fn.call(this, index++);
    };
    this.reset = function () {
      index = 1;
    };
  };
});