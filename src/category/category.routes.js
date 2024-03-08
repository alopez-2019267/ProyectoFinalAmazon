import express from 'express'
import { validateJwt, isAdmin, isCliente} from '../middlewares/validate.jwt.js'
import { test, saveCategory, listCategories, updateCategory, deleteCategory, listCategory, productsByCategory } from './category.controller.js'

const api = express.Router()

api.get('/test', test)
api.post('/saveCategory', [validateJwt, isAdmin], saveCategory) //,[validateJwt, isAdmin]
api.get('/listCategories', [validateJwt, isAdmin], listCategories)
api.put('/updateCategory/:id', [validateJwt, isAdmin], updateCategory)
api.delete('/deleteCategory/:id', [validateJwt, isAdmin], deleteCategory)
api.get('/listCategory', [validateJwt, isCliente], listCategory)
api.post('/productsByCategory', [validateJwt, isCliente], productsByCategory)

export default api