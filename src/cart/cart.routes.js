import express from 'express'
import { validateJwt, isAdmin, isCliente} from '../middlewares/validate.jwt.js'
import { test, saveProductCart, deleteProductCart } from './cart.controller.js'

const api = express.Router()

api.get('/test', test)
api.post('/saveProductCart',[validateJwt, isCliente], saveProductCart)
api.delete('/deleteProductCart/:id', [validateJwt, isCliente], deleteProductCart)

export default api