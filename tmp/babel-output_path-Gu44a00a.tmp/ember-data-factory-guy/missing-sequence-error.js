define("ember-data-factory-guy/missing-sequence-error", ["exports"], function (exports) {
  "use strict";

  exports["default"] = function (message) {
    this.toString = function () {
      return message;
    };
  };
});