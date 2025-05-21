// server.js
import path from 'path'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { loggerService } from './services/logger.service.js'
import { toyRoutes } from './api/toy/toy.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { setupAsyncLocalStorage } from './middleware/setupAls.middleware.js'

dotenv.config()
const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY

const app = express()
app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'))
} else {
  const corsOptions = {
    origin: [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
    ],
    credentials: true,
  }
  app.use(cors(corsOptions))
}
app.all('/*all', setupAsyncLocalStorage)

app.use('/api/toy', toyRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)

// Config: expose Google Maps API key
app.get('/api/config/google-maps-key', (req, res) => {
  res.send({ apiKey: googleMapsKey })
})

// Fallback
app.get('/*all', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
  loggerService.info(`Server listening on http://127.0.0.1:${PORT}/`)
})
// import path from 'path'
// import express from 'express'
// import cors from 'cors'
// import cookieParser from 'cookie-parser'
// import { loggerService } from './services/logger.service.js'
// import { toyService } from './services/toy.service.js'
// import dotenv from 'dotenv'
// dotenv.config()

// const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY

// const toyLabels = [
//   'On wheels',
//   'Box game',
//   'Art',
//   'Baby',
//   'Doll',
//   'Puzzle',
//   'Outdoor',
//   'Battery Powered',
// ]

// const app = express()

// app.use(cookieParser())
// app.use(express.json())
// app.use(express.static('public'))

// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static('public'))
// } else {
//   const corsOptions = {
//     origin: [
//       'http://127.0.0.1:3000',
//       'http://localhost:3000',
//       'http://localhost:5173',
//       'http://127.0.0.1:5173',
//       'http://localhost:5174',
//       'http://127.0.0.1:5174',
//     ],
//     credentials: true,
//   }
//   app.use(cors(corsOptions))
// }

// ////////////// TOYS API ///////////

// app.get('/api/toy/labels', (req, res) => {
//   toyService.getLabels().then(labels => res.send(labels))
// })
// app.get('/api/toy', (req, res) => {
//   const filterBy = {
//     name: req.query.name || '',
//     price: req.query.price ? +req.query.price : 0,
//     inStock: req.query.inStock || '',
//     labels: req.query.labels ? req.query.labels.split(',').filter(label => label) : [],
//   }
//   console.log('Received filter:', filterBy)

//   toyService
//     .query(filterBy)
//     .then(toys => res.send(toys))
//     .catch(err => {
//       loggerService.error('Cannot load toys', err)
//       res.status(400).send('Cannot load toys')
//     })
// })
// app.get('/api/toy/stats', (req, res) => {
//   toyService.getToysStats().then(stats => res.send(stats))
// })

// app.get('/api/toy/:toyId', (req, res) => {
//   const { toyId } = req.params
//   toyService
//     .get(toyId)
//     .then(toy => res.send(toy))
//     .catch(err => {
//       loggerService.error('Cannot get toy', err)
//       res.status(400).send(err)
//     })
// })

// app.post('/api/toy', (req, res) => {
//   const { name, price, labels } = req.body
//   const toy = {
//     name,
//     price: +price,
//     labels,
//   }
//   toyService
//     .save(toy)
//     .then(newToy => res.send(newToy))
//     .catch(err => {
//       loggerService.error('Cannot add toy', err)
//       res.status(400).send('Cannot add toy')
//     })
// })
// app.put('/api/toy', (req, res) => {
//   const { name, price, _id, labels, inStock } = req.body
//   const toy = {
//     _id,
//     name,
//     price: +price,
//     labels,
//     inStock,
//   }
//   toyService
//     .save(toy)
//     .then(updatedToy => res.send(updatedToy))
//     .catch(err => {
//       loggerService.error('Cannot update toy', err)
//       res.status(400).send('Cannot update toy')
//     })
// })

// app.delete('/api/toy/:toyId', (req, res) => {
//   const { toyId } = req.params
//   toyService
//     .remove(toyId)
//     .then(res.send())
//     .catch(err => {
//       loggerService.error('Cannot delete toy', err)
//       res.status(400).send('Cannot delete toy, ' + err)
//     })
// })

// app.get('/api/config/google-maps-key', (req, res) => {
//   res.send({ apiKey: googleMapsKey })
// })

// // // Fallback
// app.use((req, res) => {
//   res.sendFile(path.resolve('public/index.html'))
// })

// const port = process.env.PORT || 3030
// app.listen(port, () => {
//   loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
// })
