import _ from 'lodash'
import {SchemaTypes} from 'mongoose'

function normalize (value) {
  return _.kebabCase(value).replace(/\-/g, ' ')
}

export default function keywordsPlugin (schema, options = {}) {
  let paths = options.paths && options.paths.map((p) => schema.path(p))
  let field = options.field || 'keywords'

  if (paths && paths.length) {
    schema.add({
      [field]: {
        type: [String],
        index: true
      }
    })
  } else {
    return
  }

  paths.forEach((path) => {
    schema.path(path.path).set(function (value) {
      let oldValue = this[path.path]
      let parsePath = (path, value) => {
        if (path instanceof SchemaTypes.ObjectId) {
          value[field] && value[field].forEach((keyword) => {
            oldValue && oldValue[field] && this[field].pull(...oldValue[field])
            this[field].addToSet(keyword)
          })
        } else {
          oldValue && this[field].pull(normalize(oldValue))
          this[field].addToSet(normalize(value))
        }
      }

      if (value === oldValue) return value

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
