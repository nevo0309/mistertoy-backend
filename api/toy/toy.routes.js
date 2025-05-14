import express from 'express'
import { requireAuth, requireAdmin } from '../../middleware/requireAuth.middleware.js'

import {
  getToys,
  getToyById,
  addToy,
  updateToy,
  removeToy,
  getLabels,
  getToysStats,
} from './toy.controller.js'

export const toyRoutes = express.Router()

toyRoutes.get('/', getToys)
toyRoutes.get('/stats', getToysStats)
toyRoutes.get('/labels', getLabels)
toyRoutes.get('/:toyId', getToyById)
toyRoutes.post('/', addToy)
toyRoutes.put('/:toyId', updateToy)
toyRoutes.delete('/:toyId', removeToy)
// app.get('/api/toy/stats', (req, res) => {
//   toyService.getToysStats().then(stats => res.send(stats))
// })
// toyRoutes.post('/', requireAuth, requireAdmin, addToy)
// toyRoutes.put('/:toyId', requireAuth, requireAdmin, updateToy)
// toyRoutes.delete('/:toyId', requireAuth, requireAdmin, removeToy)
