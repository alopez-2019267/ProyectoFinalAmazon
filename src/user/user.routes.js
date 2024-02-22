import express from 'express'
import { validateJwt, isAdmin, isCliente} from '../middlewares/validate.jwt.js'
import { test, registerCliente, login, updateCliente } from './user.controller.js'

const api = express.Router()

api.get('/test', test)
api.post('/registerCliente', registerCliente)
api.post('/login', login)
api.put('/updateCliente/:id', [validateJwt, isCliente], updateCliente)


export default api