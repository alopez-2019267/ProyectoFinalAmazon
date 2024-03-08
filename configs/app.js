'use strict'

import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import { config } from "dotenv"
import userRoutes from '../src/user/user.routes.js'
import productRoutes from '../src/product/product.routes.js'
import categoryRoutes from '../src/category/category.routes.js'
import cartRoutes from '../src/cart/cart.routes.js'
import billRoutes from '../src/bill/bill.routes.js'
const app = express()
config()
const port = process.env.PORT || 3056

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))

app.use('/user', userRoutes)
app.use('/category', categoryRoutes)
app.use('/product', productRoutes)
app.use('/cart', cartRoutes)
app.use('/bill', billRoutes)
export const initServer = () => {
    app.listen(port)
    console.log(`Server HTTP running in port ${port}`)
}