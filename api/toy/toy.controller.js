// api/toy/toy.controller.js
import { loggerService } from '../../services/logger.service.js'
import { toyService } from './toy.service.js'

export async function getToys(req, res) {
  try {
    const filterBy = {
      name: req.query.name || '',
      price: req.query.price || undefined,
      inStock: req.query.inStock || undefined,
      labels: req.query.labels ? [].concat(req.query.labels) : [],
    }
    const toys = await toyService.query(filterBy)
    res.send(toys)
  } catch (error) {
    loggerService.error('Cannot load toys', error)
    res.status(500).send('Cannot load toys')
  }
}

export async function getToyById(req, res) {
  try {
    const toy = await toyService.getById(req.params.toyId)
    res.send(toy)
  } catch (error) {
    loggerService.error('Cannot get toy', error)
    res.status(500).send('Cannot get toy')
  }
}

export async function addToy(req, res) {
  const { loggedinUser } = req

  try {
    const toy = req.body
    toy.owner = loggedinUser
    const added = await toyService.add(toy)
    res.send(added)
  } catch (error) {
    loggerService.error('Cannot add toy', error)
    res.status(500).send('Cannot add toy')
  }
}

export async function updateToy(req, res) {
  try {
    const toy = req.body
    const updated = await toyService.update(toy)
    res.send(updated)
  } catch (error) {
    loggerService.error('Cannot update toy', error)
    res.status(500).send('Cannot update toy')
  }
}

export async function removeToy(req, res) {
  try {
    await toyService.remove(req.params.toyId)
    res.send()
  } catch (error) {
    loggerService.error('Cannot delete toy', error)
    res.status(500).send('Cannot delete toy')
  }
}
export async function getLabels(req, res) {
  try {
    const labels = await toyService.getLabels()
    res.send(labels)
  } catch (err) {
    loggerService.error('Cannot load labels', err)
    res.status(500).send('Cannot load labels')
  }
}
export async function getToysStats(req, res) {
  try {
    const stats = await toyService.getToysStats()
    res.send(stats)
  } catch (error) {
    loggerService.error('Cannot load toy stats', error)
    res.status(500).send('Cannot load toy stats')
  }
}
