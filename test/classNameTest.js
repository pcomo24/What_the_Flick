var chai = require('chai');
var assert = chai.assert;

var className = require('../js/className.js');
var addClass = className.addClass;

describe('addClass', function() {
  it('should add class to element', function() {
    var element = { className: 'exists' };

    addClass(element, 'test-class');

    assert.equal(element.className, 'test-class');
  });

  it('should not add a class which already exists');
});
