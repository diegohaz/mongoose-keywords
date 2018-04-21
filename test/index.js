import test from 'tape'
import _ from 'lodash'
import mongoose from 'mongoose'
import mongooseKeywords from '../src'

mongoose.connect('mongodb://localhost/mongoose-keywords-test')

test('mongooseKeywords no path', (t) => {
  t.plan(2)

  const TestSchema = new mongoose.Schema({name: String})

  t.false(TestSchema.path('keywords'), 'should not have keywords path before plugin')

  TestSchema.plugin(mongooseKeywords)

  t.false(TestSchema.path('keywords'), 'should not have keywords path after plugin')
})

test('mongooseKeywords field option', (t) => {
  t.plan(3)

  const TestSchema = new mongoose.Schema({name: String})

  t.false(TestSchema.path('keywords'), 'should not have keywords path before plugin')

  TestSchema.plugin(mongooseKeywords, {paths: ['name'], field: 'terms'})

  t.false(TestSchema.path('keywords'), 'should not have keywords path')
  t.true(TestSchema.path('terms'), 'should have terms path')
})

test('mongooseKeywords already defined path', (t) => {
  t.plan(2)

  const TestSchema = new mongoose.Schema({
    name: String,
    keywords: {
      type: String,
      unique: true
    }
  })

  TestSchema.plugin(mongooseKeywords, {paths: ['name']})

  t.same(TestSchema.path('keywords').options.type, [String], 'should not override type')
  t.true(TestSchema.path('keywords').options.unique, 'should have unique option')
})

test('mongooseKeywords transform option', (t) => {
  t.plan(3)

  const TestSchema = new mongoose.Schema({name: String})

  t.false(TestSchema.path('keywords'), 'should not have keywords path before plugin')

  TestSchema.plugin(mongooseKeywords, {
    paths: ['name'],
    transform: (value) => `${value}!!!`})

  t.true(TestSchema.path('keywords'), 'should have keywords path after plugin')

  const Test = mongoose.model('Test14', TestSchema)
  const object = new Test()
  object.name = 'test'

  t.same(_.toArray(object.keywords), ['test!!!'], 'should apply custom transform function')
})

test('mongooseKeywords single path', (t) => {
  t.plan(6)
  const TestSchema = new mongoose.Schema({name: String})

  t.false(TestSchema.path('keywords'), 'should not have keywords path before plugin')

  TestSchema.plugin(mongooseKeywords, {paths: ['name']})

  t.true(TestSchema.path('keywords'), 'should have keywords path after plugin')

  const Test = mongoose.model('Test1', TestSchema)

  Test.remove({}).then(() => {
    const doc = new Test()

    doc.name = 'Test'
    t.same(_.toArray(doc.keywords), ['test'], 'should set keywords path after set any path')

    doc.name = 'Hello'
    t.same(_.toArray(doc.keywords), ['hello'], 'should set keywords path after set any path')

    doc.name = 'Hello'
    t.same(_.toArray(doc.keywords), ['hello'], 'should set keywords path after set any path')
    return Test.create({name: 'Test'})
  }).then((doc) => {
    t.same(_.toArray(doc.keywords), ['test'], 'should still have keywords set after creating document')
  }).catch(console.log)
})

test('mongooseKeywords single path array', (t) => {
  t.plan(3)
  const TestSchema = new mongoose.Schema({name: [String]})

  t.false(TestSchema.path('keywords'), 'should not have keywords path before plugin')

  TestSchema.plugin(mongooseKeywords, {paths: ['name']})

  t.true(TestSchema.path('keywords'), 'should have keywords path after plugin')

  const Test = mongoose.model('Test15', TestSchema)

  Test.remove({}).then(() => {
    const doc = new Test()

    doc.name.push('Test', 'Hello')
    t.same(_.toArray(doc.keywords), ['test', 'hello'], 'should set keywords path after set any path')
  }).catch(console.log)
})

test('mongooseKeywords multiple path', (t) => {
  t.plan(4)

  const TestSchema = new mongoose.Schema({
    name: String,
    genre: String
  })

  t.false(TestSchema.path('keywords'), 'should not have keywords path before plugin')

  TestSchema.plugin(mongooseKeywords, {paths: ['name', 'genre']})

  t.true(TestSchema.path('keywords'), 'should have keywords path after plugin')

  const Test = mongoose.model('Test2', TestSchema)

  Test.remove({}).then(() => {
    const doc = new Test()
    doc.name = 'Test'

    t.same(_.toArray(doc.keywords), ['test'], 'should set keywords path after set any path')

    doc.genre = 'Rock'

    t.same(_.toArray(doc.keywords), ['test', 'rock'], 'should set keywords path after set any path')
  }).catch(console.log)
})

test('mongooseKeywords multiple path with model', (t) => {
  t.plan(5)

  const TestSchema = new mongoose.Schema({
    name: String,
    reference: {
      type: mongoose.Schema.ObjectId,
      ref: 'Test1'
    }
  })

  t.false(TestSchema.path('keywords'), 'should not have keywords path before plugin')

  TestSchema.plugin(mongooseKeywords, {paths: ['name', 'reference']})

  t.true(TestSchema.path('keywords'), 'should have keywords path after plugin')

  const Test3 = mongoose.model('Test3', TestSchema)
  const Test1 = mongoose.model('Test1')

  Test3.remove({}).then(() => {
    const doc = new Test3()

    doc.name = 'Test'
    t.same(_.toArray(doc.keywords), ['test'], 'should set keywords path after set any path')

    doc.reference = new Test1({name: 'Hello'})
    t.same(_.toArray(doc.keywords), ['test', 'hello'], 'should set keywords path after set any path')

    doc.reference = new Test1({name: 'Hi'})
    t.same(_.toArray(doc.keywords), ['test', 'hi'], 'should set keywords path after set any path')
  }).catch(console.log)
})

test('mongooseKeywords findOne by non _id path', (t) => {
  t.plan(1)

  const TestSchema = new mongoose.Schema({
    name: String,
    genre: String
  })

  TestSchema.plugin(mongooseKeywords, {paths: ['name', 'genre']})

  const Test = mongoose.model('TestFindOne', TestSchema)

  const doc = {
    name: 'Test',
    genre: 'Rock'
  }

  function create() {
    return Test.create(doc)
  }

  function find() {
    return Test.findOne({ name: doc.name })
  }

  function testResults(found) {
    const arr = ['test', 'rock']
    const major = mongoose.version.charAt(0)
    if (major < 5) {
      arr.sort()
    }

    t.same(_.toArray(found.keywords), arr, 'should work with findone by name')
  }

  Test.remove({})
    .then(create)
    .then(find)
    .then(testResults).catch(console.error)

})

test.onFinish(() => {
  mongoose.disconnect()
})
