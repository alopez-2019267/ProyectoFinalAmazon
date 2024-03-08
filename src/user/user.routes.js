import express from 'express'
import { validateJwt, isAdmin, isCliente} from '../middlewares/validate.jwt.js'
import { test, registerCliente, login, updateCliente, createUser, updateAdmin, updateClientAdmin, deleteAdmin, deleteClientAdmin, updateClientePass, deleteCliente, getPurchases } from './user.controller.js'

const api = express.Router()

api.get('/test', test)
api.post('/registerCliente', registerCliente)
api.post('/login', login)
api.post('/createUser', [validateJwt, isAdmin], createUser)
api.put('/updateAdmin/:id', [validateJwt, isAdmin], updateAdmin)
api.put('/updateClientAdmin/:id', [validateJwt, isAdmin], updateClientAdmin)
api.delete('/deleteAdmin/:id', [validateJwt, isAdmin], deleteAdmin)
api.delete('/deleteClientAdmin/:id', [validateJwt, isAdmin], deleteClientAdmin)
api.put('/updateCliente/:id', [validateJwt, isCliente], updateCliente)
api.put('/updateClientePass/:id', [validateJwt, isCliente], updateClientePass)
api.delete('/deleteCliente/:id', [validateJwt, isCliente], deleteCliente)
api.get('/getPurchases', [validateJwt, isCliente], getPurchases)

export default api