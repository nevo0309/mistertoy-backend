import express from 'express'

import { log } from '../../middleware/logger.middleware.js'
import { requireAuth } from '../../middleware/requireAuth.middleware.js'

import { addReview, deleteReview, getReviews } from './review.controller.js'

const router = express.Router()

router.get('/', log, getReviews)
router.post('/', log, requireAuth, addReview)
router.delete('/:id', requireAuth, deleteReview)

export const reviewRoutes = router
