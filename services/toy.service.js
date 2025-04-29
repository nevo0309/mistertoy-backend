import fs from 'fs'
import { utilService } from './util.service.js'

const toys = utilService.readJsonFile('data/toys.json')
const toyLabels = [
  'On wheels',
  'Box game',
  'Art',
  'Baby',
  'Doll',
  'Puzzle',
  'Outdoor',
  'Battery Powered',
]
export const toyService = {
  query,
  get,
  remove,
  save,
  getLabels,
}

function query(filterBy = {}) {
  console.log('toys from server', filterBy)

  let filteredToys = [...toys]

  if (filterBy.name) {
    const regExp = new RegExp(filterBy.name, 'i')
    filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
  }

  // Convert price to number
  if (filterBy.price && !isNaN(+filterBy.price)) {
    const maxPrice = +filterBy.price
    filteredToys = filteredToys.filter(toy => toy.price <= maxPrice)
  }

  // Handle inStock correctly
  if (filterBy.inStock === 'true' || filterBy.inStock === 'false') {
    const isInStock = filterBy.inStock === 'true'
    filteredToys = filteredToys.filter(toy => toy.inStock === isInStock)
  }

  // Handle labels array (when sent as a single value, or array)
  if (filterBy.labels) {
    let labels = filterBy.labels
    if (typeof labels === 'string') labels = [labels] // if it's a single value, wrap it in array

    filteredToys = filteredToys.filter(toy => labels.every(label => toy.labels.includes(label)))
  }

  return Promise.resolve(filteredToys)
}

function get(toyId) {
  const toy = toys.find(toy => toy._id === toyId)
  if (!toy) return Promise.reject('Toy not found')
  console.log('toy from server')

  const toyWithNextPrev = _setNextPrevToyId(toy)
  return Promise.resolve(toyWithNextPrev)
}

function remove(toyId) {
  const idx = toys.findIndex(toy => toy._id === toyId)
  if (idx === -1) return Promise.reject('No such toy')
  toys.splice(idx, 1)
  return _saveToysToFile()
}

function save(toy) {
  if (toy._id) {
    const idx = toys.findIndex(currToy => currToy._id === toy._id)
    toys[idx] = { ...toys[idx], ...toy }
  } else {
    toy._id = _makeId()
    toy.createdAt = Date.now()
    toy.inStock = true
    toys.unshift(toy)
  }
  ;``
  return _saveToysToFile().then(() => toy)
}

function _makeId(length = 5) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function getLabels() {
  return Promise.resolve(toyLabels)
}

function _saveToysToFile() {
  return new Promise((resolve, reject) => {
    const toysStr = JSON.stringify(toys, null, 4)
    fs.writeFile('data/toys.json', toysStr, err => {
      if (err) {
        return console.log(err)
      }
      resolve()
    })
  })
}
function _setNextPrevToyId(toy) {
  const toyIdx = toys.findIndex(currToy => currToy._id === toy._id)
  const nextToy = toys[toyIdx + 1] ? toys[toyIdx + 1] : toys[0]
  const prevToy = toys[toyIdx - 1] ? toys[toyIdx - 1] : toys[toys.length - 1]

  return {
    ...toy,
    nextToyId: nextToy._id,
    prevToyId: prevToy._id,
  }
}
