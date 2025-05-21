import express from 'express'
import { requireAuth, requireAdmin, requireOwner } from '../../middleware/requireAuth.middleware.js'

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
// app.get('/api/toy/stats', (req, res) => {
//   toyService.getToysStats().then(stats => res.send(stats))
// })
toyRoutes.post('/', requireAuth, addToy)
toyRoutes.put('/:toyId', requireAuth, requireOwner, updateToy)
toyRoutes.delete('/:toyId', requireAuth, requireOwner, removeToy)
