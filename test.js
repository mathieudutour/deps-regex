'use strict';

var assert = require('assert');
var DepsRegex = require('./');
var re = new DepsRegex();

function match(str) {
  var matches = [], m = re.exec(str);
  while (m) {
    matches.push(m[1]);
    str = str.slice(m.index + m[0].length);
    m = re.exec(str);
  }
  return matches;
}

describe('requires regex', function() {
  it('should match require statements', function() {
    assert(re.test('require(\'foo\');'));
    assert(re.test('require("foo");'));
    assert(re.test('require(`foo`);'));
    assert(re.test('require(\'foo\')'));
    assert(re.test('require( \'foo\' )'));
    assert(re.test('var bar = require( \'foo\' )'));
    assert(re.test('var bar = require( \'foo\' );'));
    assert(re.test('var bar= require( \'foo\' )'));
    assert(re.test('var bar=require( \'foo\' )'));
    assert(re.test('var bar=require(\'foo\')'));
    assert(re.test('let bar = require( \'foo\' )'));
    assert(re.test('const bar = require( \'foo\' )'));
  });

  it('should match ES6 import statements', function() {
    assert(re.test('import bar from \'foo\';'));
    assert(re.test('import bar from \'foo\''));
    assert(re.test('import * from \'foo\';'));
    assert(re.test('import bar as baz from \'foo\';'));
  });

  it('should match coffescript require statements', function() {
    assert(re.test('bar = require \'foo\''));
    assert(re.test('require \'foo\''));
  });

  it('should return the full statement and module name', function() {
    var a = re.exec('var isDir = require(\'is-directory\');');
    assert.equal(a[0], 'var isDir = require(\'is-directory\');');
    assert.equal(a[1], 'is-directory');

    var b = re.exec('var isDir = require(\'is-directory\')');
    assert.equal(b[0], 'var isDir = require(\'is-directory\')');
    assert.equal(b[1], 'is-directory');
  });

  it('should return an array of matches', function() {
    var str = 'var path = require(\'path\')var list = require(\'dirs\');';
    assert.deepEqual(match(str), ['path', 'dirs']);
    assert.deepEqual(match('require(\'path\')\nrequire(\'dirs\');'), ['path', 'dirs']);
    assert.deepEqual(match('require("path")\nrequire("dirs");'), ['path', 'dirs']);
    assert.deepEqual(match('require("path")require("dirs");'), ['path', 'dirs']);
    assert.deepEqual(match('var foo = require("path")require("dirs");'), ['path', 'dirs']);
    assert.deepEqual(match('var\nfoo\n=\nrequire("path")require("dirs");'), ['path', 'dirs']);
    assert.deepEqual(match('var foo = require("path")require("dirs")'), ['path', 'dirs']);
    assert.deepEqual(match('foo = require("path")require("dirs")'), ['path', 'dirs']);
    assert.deepEqual(match('foo = require("path")bar = require("dirs")'), ['path', 'dirs']);
    assert.deepEqual(match('foo = require("a-b")bar = require("c-d-e")'), ['a-b', 'c-d-e']);
    assert.deepEqual(match('foo = require("./path")bar = require("./dirs")'), ['./path', './dirs']);
    assert.deepEqual(match('const foo = require("./path")bar = require("./dirs")'), ['./path', './dirs']);
  });

  it('should match indented variables', function() {
    var str = '    var path = require(\'path\');\n\nvar list = require(\'dirs\');';
    assert.deepEqual(match(str), ['path', 'dirs']);
  });

  it('should return the dependencies', function() {
    var str = 'var path = require(\'path\')var list = require(\'dirs\');';
    assert.deepEqual(re.getDependencies(str), ['path', 'dirs']);
  });
});
