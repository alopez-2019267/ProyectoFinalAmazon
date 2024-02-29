import express from 'express'
import { validateJwt, isAdmin, isCliente} from '../middlewares/validate.jwt.js'
import { test, saveCategory, listCategories, updateCategory, deleteCategory } from './category.controller.js'

const api = express.Router()

api.get('/test', test)
api.post('/saveCategory', saveCategory) //,[validateJwt, isAdmin]
api.get('/listCategories', listCategories)
api.put('/updateCategory/:id', updateCategory)
api.delete('/deleteCategory/:id', deleteCategory)
export default api