import express from 'express'
import { validateJwt, isAdmin, isCliente} from '../middlewares/validate.jwt.js'
import { saveProduct, test, listProducts, updateProduct, deleteProduct } from './product.controller.js'

const api = express.Router()

api.get('/test', test)
api.post('/saveProduct', saveProduct)//[validateJwt, isAdmin],
api.get('/listProducts', listProducts)
api.put('/updateProduct/:id', updateProduct)
api.delete('/deleteProduct/:id', deleteProduct)

export default api