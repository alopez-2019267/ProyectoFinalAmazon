import express from 'express'
import { validateJwt, isAdmin, isCliente} from '../middlewares/validate.jwt.js'
import { saveProduct, test, listProducts, updateProduct, deleteProduct, getMostSoldProducts, searchProductByName, searchProductById, findSoldOut, getInfoMostSoldProducts, controlInventory } from './product.controller.js'

const api = express.Router()

api.get('/test', test)
api.post('/saveProduct', [validateJwt, isAdmin], saveProduct)
api.get('/searchProductById', [validateJwt, isAdmin], searchProductById)
api.get('/listProducts', [validateJwt, isAdmin], listProducts)
api.put('/updateProduct/:id', [validateJwt, isAdmin], updateProduct)
api.get('/controlInventory', [validateJwt, isAdmin], controlInventory)
api.get('/findSoldOut', [validateJwt, isAdmin], findSoldOut)
api.get('/getInfoMostSoldProducts', [validateJwt, isAdmin], getInfoMostSoldProducts)
api.delete('/deleteProduct/:id', [validateJwt, isAdmin], deleteProduct)
api.get('/getMostSoldProducts', [validateJwt, isCliente], getMostSoldProducts)
api.get('/searchProductByName', [validateJwt, isCliente], searchProductByName)


export default api