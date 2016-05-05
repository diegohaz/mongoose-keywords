import test from "tape"
import _ from 'lodash'
import mongoose from 'mongoose'
import mongooseKeywords from "../src"

mongoose.connect('mongodb://localhost/mongoose-keywords-test')

test("mongooseKeywords no path", (t) => {
  t.plan(2)

  let TestSchema = new mongoose.Schema({name: String})

  t.false(TestSchema.path('keywords'), 'should not have keywords path before plugin')

  TestSchema.plugin(mongooseKeywords)

  t.false(TestSchema.path('keywords'), 'should not have keywords path after plugin')
})

test("mongooseKeywords single path", (t) => {
  t.plan(6)
  let TestSchema = new mongoose.Schema({name: String})

  t.false(TestSchema.path('keywords'), 'should not have keywords path before plugin')

  TestSchema.plugin(mongooseKeywords, {paths: ['name']})

  t.true(TestSchema.path('keywords'), 'should have keywords path after plugin')

  let Test = mongoose.model('Test1', TestSchema)

  Test.remove({}).then(() => {
    let doc = new Test()

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

test("mongooseKeywords single path array", (t) => {
  t.plan(3)
  let TestSchema = new mongoose.Schema({name: [String]})

  t.false(TestSchema.path('keywords'), 'should not have keywords path before plugin')

  TestSchema.plugin(mongooseKeywords, {paths: ['name']})

  t.true(TestSchema.path('keywords'), 'should have keywords path after plugin')

  let Test = mongoose.model('Test15', TestSchema)

  Test.remove({}).then(() => {
    let doc = new Test()

    doc.name.push('Test', 'Hello')
    t.same(_.toArray(doc.keywords), ['test', 'hello'], 'should set keywords path after set any path')
  }).catch(console.log)
})

test("mongooseKeywords multiple path", (t) => {
  t.plan(4)

  let TestSchema = new mongoose.Schema({
    name: String,
    genre: String
  })

  t.false(TestSchema.path('keywords'), 'should not have keywords path before plugin')

  TestSchema.plugin(mongooseKeywords, {paths: ['name', 'genre']})

  t.true(TestSchema.path('keywords'), 'should have keywords path after plugin')

  let Test = mongoose.model('Test2', TestSchema)

  Test.remove({}).then(() => {
    let doc = new Test()
    doc.name = 'Test'

    t.same(_.toArray(doc.keywords), ['test'], 'should set keywords path after set any path')

    doc.genre = 'Rock'

    t.same(_.toArray(doc.keywords), ['test', 'rock'], 'should set keywords path after set any path')
  }).catch(console.log)
})

test("mongooseKeywords multiple path with model", (t) => {
  t.plan(5)

  let TestSchema = new mongoose.Schema({
    name: String,
    reference: {
      type: mongoose.Schema.ObjectId,
      ref: 'Test1'
    }
  })

  t.false(TestSchema.path('keywords'), 'should not have keywords path before plugin')

  TestSchema.plugin(mongooseKeywords, {paths: ['name', 'reference']})

  t.true(TestSchema.path('keywords'), 'should have keywords path after plugin')

  let Test3 = mongoose.model('Test3', TestSchema)
  let Test1 = mongoose.model('Test1')

  Test3.remove({}).then(() => {
    let doc = new Test3()

    doc.name = 'Test'
    t.same(_.toArray(doc.keywords), ['test'], 'should set keywords path after set any path')

    doc.reference = new Test1({name: 'Hello'})
    t.same(_.toArray(doc.keywords), ['test', 'hello'], 'should set keywords path after set any path')

    doc.reference = new Test1({name: 'Hi'})
    t.same(_.toArray(doc.keywords), ['test', 'hi'], 'should set keywords path after set any path')
  }).catch(console.log)
})

test.onFinish(() => {
  mongoose.disconnect()
})
