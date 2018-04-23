const { readFileSync, writeFileSync } = require('./lib/storage')
const CACHE_FILE = 'cache.json'
const weakCache = new Map()

/**
 * Get cache data from HOME/.supermodel/cache.json
 *
 * @param {string} [key=null] to return exact property
 * @returns {any}
 */
function get(key = null) {
  let cache = weakCache.get('content')

  if (!cache) {
    try {
      const cacheContent = readFileSync(CACHE_FILE)
      cache = JSON.parse(cacheContent)
    } catch (err) {
      cache = {}
    }

    weakCache.set('content', cache)
  }

  return key === null ? cache : cache[key]
}

/**
 * Save new content of cache
 *
 * @param {any} cache
 */
function set(cache) {
  weakCache.set('content', cache)
  return writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
}

/**
 * Change one property of cache
 *
 * @param {string} key
 * @param {any} value
 */
function update(key, value) {
  const cache = get()

  return set({
    ...cache,
    [key]: value
  })
}

module.exports = {
  get,
  set,
  update
}
