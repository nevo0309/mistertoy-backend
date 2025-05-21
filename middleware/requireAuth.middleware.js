import { authService } from '../api/auth/auth.service.js'
import { toyService } from '../api/toy/toy.service.js'
import { asyncLocalStorage } from '../services/als.service.js'
import { loggerService } from '../services/logger.service.js'

export function requireAuth(req, res, next) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  req.loggedinUser = loggedinUser

  if (!loggedinUser) return res.status(401).send('Not Authenticated')
  next()
}

export async function requireOwner(req, res, next) {
  const { toyId } = req.params
  const toy = await toyService.getById(toyId)

  if (!toy) return res.status(404).send('Toy not found')
  if (req.loggedinUser.isAdmin) return next()

  const ownerId = toy.owner._id.toString()
  if (ownerId !== req.loggedinUser._id) {
    return res.status(403).send('Not authorized to modify this toy')
  }

  next()
}

export async function requireAdmin(req, res, next) {
  if (!req?.cookies?.loginToken) {
    return res.status(401).send('Not Authenticated')
  }

  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedinUser.isAdmin) {
    loggerService.warn(loggedinUser.fullname + 'attempted to perform admin action')
    res.status(403).end('Not Authorized')
    return
  }
  next()
}
