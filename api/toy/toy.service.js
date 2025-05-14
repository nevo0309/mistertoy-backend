// services/toy.service.js
import { ObjectId } from 'mongodb'

import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

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
  getById,
  add,
  update,
  remove,
  getLabels,
  getToysStats,
}

async function query(filterBy = {}) {
  try {
    const { filterCriteria } = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('toy')
    return await collection.find(filterCriteria).toArray()
  } catch (error) {
    loggerService.error('Cannot query toys', error)
    throw error
  }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection('toy')

    const toys = await collection.find({}).sort({ createdAt: -1 }).toArray()
    const idx = toys.findIndex(t => t._id.toString() === toyId)
    if (idx === -1) throw new Error('Toy not found')
    const toy = toys[idx]
    const nextToy = toys[idx + 1] || toys[0]
    const prevToy = toys[idx - 1] || toys[toys.length - 1]
    return {
      ...toy,
      nextToyId: nextToy._id.toString(),
      prevToyId: prevToy._id.toString(),
    }
  } catch (error) {
    loggerService.error(`Error finding toy ${toyId}`, error)
    throw error
  }
}

async function add(toy) {
  try {
    toy.createdAt = Date.now()
    toy.inStock = true
    const collection = await dbService.getCollection('toy')
    await collection.insertOne(toy)
    return toy
  } catch (error) {
    loggerService.error('Cannot insert toy', error)
    throw error
  }
}

async function update(toy) {
  try {
    const { name, price, inStock, labels, _id } = toy
    const toUpdate = { name, price, inStock, labels }
    const collection = await dbService.getCollection('toy')
    await collection.updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: toUpdate })
    return toy
  } catch (error) {
    loggerService.error(`Cannot update toy ${toy._id}`, error)
    throw error
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
  } catch (error) {
    loggerService.error(`Cannot remove toy ${toyId}`, error)
    throw error
  }
}

function _buildCriteria(filterBy) {
  const filterCriteria = {}
  if (filterBy.name) {
    filterCriteria.name = { $regex: filterBy.name, $options: 'i' }
  }

  if (filterBy.price && +filterBy.price > 0) {
    filterCriteria.price = { $lte: +filterBy.price }
  }
  if (filterBy.inStock !== undefined) {
    filterCriteria.inStock = JSON.parse(filterBy.inStock)
  }
  if (filterBy.labels && filterBy.labels.length) {
    filterCriteria.labels = { $all: filterBy.labels }
  }
  return { filterCriteria }
}
export async function getLabels() {
  return toyLabels
}

async function getToysStats() {
  const stats = {}
  const all = await (await dbService.getCollection('toy')).find({}).toArray()
  toyLabels.forEach(label => {
    const toys = all.filter(t => t.labels.includes(label))
    const total = toys.reduce((sum, t) => sum + t.price, 0)
    stats[label] = {
      avgPrice: toys.length ? total / toys.length : 0,
      stockPercent: toys.length ? (toys.filter(t => t.inStock).length / toys.length) * 100 : 0,
    }
  })
  return stats
}
