import _ from 'lodash'
import {SchemaTypes} from 'mongoose'

const normalize = (value) => _.kebabCase(value).replace(/\-/g, ' ')

const keywordsPlugin = (schema, {paths, field = 'keywords', transform = normalize} = {}) => {
  paths = paths && paths.map((p) => schema.path(p))

  if (!paths || !paths.length) return

  schema.add({
    [field]: {
      type: [String],
      index: true
    }
  })

  paths.forEach((path) => {
    schema.path(path.path).set(function (value) {
      const oldValue = this[path.path]

      if (value === oldValue) return value

      const parsePath = (path, value) => {
        if (path instanceof SchemaTypes.ObjectId) {
          value[field] && value[field].forEach((keyword) => {
            oldValue && oldValue[field] && this[field].pull(...oldValue[field])
            this[field].addToSet(keyword)
          })
        } else {
          oldValue && this[field].pull(transform(oldValue))
          this[field].addToSet(transform(value))
        }
      }

      if (path instanceof SchemaTypes.Array) {
        value.forEach((val) => {
          parsePath(path.caster, val)
        })
      } else {
        parsePath(path, value)
      }

      return value
    })
  })
}

export default keywordsPlugin

module.exports = exports = keywordsPlugin
