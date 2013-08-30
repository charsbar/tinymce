define(
  'ephox.phoenix.api.general.Extract',

  [
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.extract.Find'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Extract, Find) {

    var from = function (universe, item) {
      return Extract.typed(universe, item);
    };

    var all = function (universe, item) {
      return Extract.items(universe, item);
    };

    var extract = function (universe, child, offset) {
      return Extract.extract(universe, child, offset);
    };

    var extractTo = function (universe, child, offset, pred) {
      return Extract.extractTo(universe, child, offset, pred);
    };

    var find = function (universe, parent, offset) {
      return Find.find(universe, parent, offset);
    };

    return {
      extract: extract,
      extractTo: extractTo,
      all: all,
      from: from,
      find: find
    };
  }
);
