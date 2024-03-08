import express from 'express'
import { validateJwt, isAdmin, isCliente} from '../middlewares/validate.jwt.js'
import { test, completarCompra, updateBill, invoicesByUser, invoicesDetailProduct } from './bill.controller.js'

const api = express.Router()

api.get('/test', test)
api.post('/completarCompra', [validateJwt, isCliente], completarCompra)
api.put('/updateBill/:id', [validateJwt, isAdmin], updateBill)
api.get('/invoicesByUser', [validateJwt, isAdmin], invoicesByUser)
api.get('/invoicesDetailProduct', [validateJwt, isAdmin], invoicesDetailProduct)

export default api