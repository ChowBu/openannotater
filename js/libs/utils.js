const toString = Object.prototype.toString;
const MAX_SAFE_INTEGER = 9007199254740991;
const HASH_UNDEFINED = '__lodash_hash_undefined__';

function isLength(value) {
  return typeof value === 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER
}
function isArrayLike(value) {
  return value != null && typeof value !== 'function' && isLength(value.length)
}
function isObjectLike(value) {
  return typeof value === 'object' && value !== null
}
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value)
}
function castArrayLikeObject(value) {
  return isArrayLikeObject(value) ? value : []
}
class Hash {

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  constructor(entries) {
    let index = -1
    const length = entries == null ? 0 : entries.length

    this.clear()
    while (++index < length) {
      const entry = entries[index]
      this.set(entry[0], entry[1])
    }
  }

  /**
   * Removes all key-value entries from the hash.
   *
   * @memberOf Hash
   */
  clear() {
    this.__data__ = Object.create(null)
    this.size = 0
  }

  /**
   * Removes `key` and its value from the hash.
   *
   * @memberOf Hash
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  delete(key) {
    const result = this.has(key) && delete this.__data__[key]
    this.size -= result ? 1 : 0
    return result
  }

  /**
   * Gets the hash value for `key`.
   *
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  get(key) {
    const data = this.__data__
    const result = data[key]
    return result === HASH_UNDEFINED ? undefined : result
  }

  /**
   * Checks if a hash value for `key` exists.
   *
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  has(key) {
    const data = this.__data__
    return data[key] !== undefined
  }

  /**
   * Sets the hash `key` to `value`.
   *
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  set(key, value) {
    const data = this.__data__
    this.size += this.has(key) ? 0 : 1
    data[key] = value === undefined ? HASH_UNDEFINED : value
    return this
  }
}
/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData({ __data__ }, key) {
  const data = __data__
  return isKeyable(key)
    ? data[typeof key === 'string' ? 'string' : 'hash']
    : data.map
}
/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  const type = typeof value
  return (type === 'string' || type === 'number' || type === 'symbol' || type === 'boolean')
    ? (value !== '__proto__')
    : (value === null)
}
class MapCache {

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  constructor(entries) {
    let index = -1
    const length = entries == null ? 0 : entries.length

    this.clear()
    while (++index < length) {
      const entry = entries[index]
      this.set(entry[0], entry[1])
    }
  }

  /**
   * Removes all key-value entries from the map.
   *
   * @memberOf MapCache
   */
  clear() {
    this.size = 0
    this.__data__ = {
      'hash': new Hash,
      'map': new Map,
      'string': new Hash
    }
  }

  /**
   * Removes `key` and its value from the map.
   *
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  delete(key) {
    const result = getMapData(this, key)['delete'](key)
    this.size -= result ? 1 : 0
    return result
  }

  /**
   * Gets the map value for `key`.
   *
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  get(key) {
    return getMapData(this, key).get(key)
  }

  /**
   * Checks if a map value for `key` exists.
   *
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  has(key) {
    return getMapData(this, key).has(key)
  }

  /**
   * Sets the map `key` to `value`.
   *
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  set(key, value) {
    const data = getMapData(this, key)
    const size = data.size

    data.set(key, value)
    this.size += data.size == size ? 0 : 1
    return this
  }
}
class SetCache {

  /**
   * Creates an array cache object to store unique values.
   *
   * @private
   * @constructor
   * @param {Array} [values] The values to cache.
   */
  constructor(values) {
    let index = -1
    const length = values == null ? 0 : values.length

    this.__data__ = new MapCache
    while (++index < length) {
      this.add(values[index])
    }
  }

  /**
   * Adds `value` to the array cache.
   *
   * @memberOf SetCache
   * @alias push
   * @param {*} value The value to cache.
   * @returns {Object} Returns the cache instance.
   */
  add(value) {
    this.__data__.set(value, HASH_UNDEFINED)
    return this
  }

  /**
   * Checks if `value` is in the array cache.
   *
   * @memberOf SetCache
   * @param {*} value The value to search for.
   * @returns {boolean} Returns `true` if `value` is found, else `false`.
   */
  has(value) {
    return this.__data__.has(value)
  }
}
SetCache.prototype.push = SetCache.prototype.add
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  const { length } = array
  let index = fromIndex + (fromRight ? 1 : -1)

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index
    }
  }
  return -1
}
function baseIsNaN(value) {
  return value !== value
}
function strictIndexOf(array, value, fromIndex) {
  let index = fromIndex - 1
  const { length } = array

  while (++index < length) {
    if (array[index] === value) {
      return index
    }
  }
  return -1
}
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex)
}
function arrayIncludes(array, value) {
  const length = array == null ? 0 : array.length
  return !!length && baseIndexOf(array, value, 0) > -1
}
function arrayIncludesWith(array, target, comparator) {
  if (array == null) {
    return false
  }

  for (const value of array) {
    if (comparator(target, value)) {
      return true
    }
  }
  return false
}
function map(array, iteratee) {
  let index = -1
  const length = array == null ? 0 : array.length
  const result = new Array(length)

  while (++index < length) {
    result[index] = iteratee(array[index], index, array)
  }
  return result
}
function cacheHas(cache, key) {
  return cache.has(key)
}
function baseIntersection(arrays, iteratee, comparator) {
  const includes = comparator ? arrayIncludesWith : arrayIncludes
  const length = arrays[0].length
  const othLength = arrays.length
  const caches = new Array(othLength)
  const result = []

  let array
  let maxLength = Infinity
  let othIndex = othLength

  while (othIndex--) {
    array = arrays[othIndex]
    if (othIndex && iteratee) {
      array = map(array, (value) => iteratee(value))
    }
    maxLength = Math.min(array.length, maxLength)
    caches[othIndex] = !comparator && (iteratee || (length >= 120 && array.length >= 120))
      ? new SetCache(othIndex && array)
      : undefined
  }
  array = arrays[0]

  let index = -1
  const seen = caches[0]

  outer:
  while (++index < length && result.length < maxLength) {
    let value = array[index]
    const computed = iteratee ? iteratee(value) : value

    value = (comparator || value !== 0) ? value : 0
    if (!(seen
      ? cacheHas(seen, computed)
      : includes(result, computed, comparator)
    )) {
      othIndex = othLength
      while (--othIndex) {
        const cache = caches[othIndex]
        if (!(cache
          ? cacheHas(cache, computed)
          : includes(arrays[othIndex], computed, comparator))
        ) {
          continue outer
        }
      }
      if (seen) {
        seen.push(computed)
      }
      result.push(value)
    }
  }
  return result
}
function last(array) {
  const length = array == null ? 0 : array.length
  return length ? array[length - 1] : undefined
}
function getTag(value) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }
  return toString.call(value)
}

function isSymbol(value) {
    const type = typeof value
    return type == 'symbol' || (type === 'object' && value != null && getTag(value) == '[object Symbol]')
}

function minBy(array, iteratee) {
    let result
    if (array == null) {
      return result
    }
    let computed
    for (const value of array) {
      const current = iteratee(value)
  
      if (current != null && (computed === undefined
        ? (current === current && !isSymbol(current))
        : (current < computed)
      )) {
        computed = current
        result = value
      }
    }
    return result
}

function maxBy(array, iteratee) {
    let result
    if (array == null) {
      return result
    }
    let computed
    for (const value of array) {
      const current = iteratee(value)
  
      if (current != null && (computed === undefined
        ? (current === current && !isSymbol(current))
        : (current > computed)
      )) {
        computed = current
        result = value
      }
    }
    return result
}

function intersectionBy(...arrays) {
  let iteratee = last(arrays)
  const mapped = map(arrays, castArrayLikeObject)

  if (iteratee === last(mapped)) {
    iteratee = undefined
  } else {
    mapped.pop()
  }
  return (mapped.length && mapped[0] === arrays[0])
    ? baseIntersection(mapped, iteratee)
    : []
}

export { getTag, isSymbol, minBy, maxBy, intersectionBy }