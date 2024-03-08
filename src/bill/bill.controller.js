'use strict'

import Product from '../product/product.model.js'
import User from '../user/user.model.js'
import Cart from '../cart/cart.model.js'
import Bill from './bill.model.js'
import jwt from 'jsonwebtoken'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'


export const test = (req, res)=>{
    console.log('Test is running Cart')
    return res.send({message: 'Test is running'})
}

export const completarCompra = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(404).send({ message: "Usuario no encontrado." });
        }

        const secretKey = process.env.SECRET_KEY;
        const token = req.headers.authorization;

        const decodedToken = jwt.verify(token, secretKey);
        const tokenUserId = decodedToken.uid;

        if (tokenUserId !== user._id.toString()) {
            return res.status(401).send({ message: "No estás autorizado para realizar esta acción." });
        }

        const userId = user._id;

        const carts = await Cart.find({ user: userId, status: 'CREATED' });

        // Verificar si no hay ningún carrito con el estado "CREATED"
        if (carts.length === 0) {
            return res.status(400).send({ message: "No hay facturas para generar." });
        }

        const bills = [];
        let totalAPagar = 0;

        for (const cart of carts) {
            const product = await Product.findById(cart.product);
            if (!product) {
                throw new Error("Producto no encontrado.");
            }
            if (cart.amount > product.stock) {
                return res.status(400).send({ message: `Insufficient stock for product: ${product.name}` });
            }
            const totalProducto = cart.amount * product.price;

            const bill = new Bill({
                date: new Date(),
                cart: cart._id,
                total: totalProducto
            });
            await bill.save();

            product.stock -= cart.amount;
            await product.save();

            cart.status = 'COMPLETED';
            await cart.save();

            bills.push(bill);

            totalAPagar += totalProducto;
        }
        const pdfFolder = './invoices'
        if(!fs.existsSync(pdfFolder)){
            fs.mkdirSync(pdfFolder)
        }
        // Generación del PDF si hay carritos
        const pdfPath = path.resolve(pdfFolder, `invoices_${Date.now()}.pdf`)
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(pdfPath));

        doc.font('Helvetica-Bold').fontSize(25).text('Empresa Amazon', { align: 'center' }).moveDown();
        doc.font('Helvetica-Bold').fontSize(25).text('Facturas', { align: 'center' }).moveDown()
    
        for (const bill of bills) {
            const cart = await Cart.findById(bill.cart).populate('product');
            const total = bill.total;

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
            doc.moveDown()
            doc.fontSize(16).text(`Fecha: ${bill.date.toLocaleDateString()}`).moveDown();
            doc.fontSize(16).text(`ID del carrito: ${cart._id}`).moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
            doc.moveDown()
            doc.fontSize(16).text('Productos:')
            doc.moveDown()
            const product = await Product.findById(cart.product)
            doc.fontSize(14).text(`- ${product.name}`)
            doc.moveDown()
            doc.fontSize(14).text(`(Cantidad: ${cart.amount}`)
            doc.moveDown()
            doc.fontSize(14).text(`Precio unitario: Q.${product.price})`)
            doc.moveDown()
            doc.moveDown()
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
            doc.moveDown()
            doc.fontSize(16).text(`Total del producto: Q.${total}`).moveDown();

            doc.moveDown()
        }

        // Mostramos el total a pagar en el documento
        doc.fontSize(16).text(`Total a pagar: Q.${totalAPagar}`).moveDown();

        doc.end();

        return res.status(200).sendFile(pdfPath);
    } catch (error) {
        return res.status(500).send({ message: `Error al completar la compra: ${error.message}` });
    }
}

export const updateBill = async (req, res) => {
    try {
        const { id } = req.params
        const newData = req.body

        // Verificar si se proporciona el cartAmount
        if (!newData.cartAmount) {
            return res.status(400).send({ message: 'cartAmount is required' })
        }

        // Verificar si el bill existe
        const existingBill = await Bill.findById(id)
        if (!existingBill) {
            return res.status(404).send({ message: 'Bill not found' })
        }

        // Obtener el carrito asociado al bill
        const cartId = existingBill.cart;
        const cart = await Cart.findById(cartId).populate('product')
        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' })
        }

        // Calcular la diferencia entre el nuevo cartAmount y el actual
        const cartAmountDiff = newData.cartAmount - cart.amount

        // Actualizar el amount del carrito
        cart.amount = newData.cartAmount
        await cart.save()

        // Validar y actualizar el stock del producto
        const product = cart.product
        if (cartAmountDiff > 0) {
            // Se están agregando productos al carrito, restar del stock
            if (product.stock < cartAmountDiff) {
                return res.status(400).send({ message: 'Insufficient stock to add products to the cart' })
            }
            product.stock -= cartAmountDiff
        } else if (cartAmountDiff < 0) {
            // Se están quitando productos del carrito, sumar al stock
            product.stock -= cartAmountDiff
        }

        // Calcular el total del bill
        const totalPrice = product.price * cart.amount
        existingBill.total = totalPrice

        // Actualizar la fecha
        existingBill.date = new Date()

        // Guardar los cambios en el producto y el bill
        await product.save();
        const updatedBill = await existingBill.save()

        return res.send({ message: 'Bill and cart updated successfully', updatedBill })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating bill' })
    }
}

export const invoicesByUser = async (req, res) => {
    try {
        // Obtener el ID del usuario del cuerpo de la solicitud
        const userId = req.body.userId

        // Buscar los carritos asociados al usuario
        const carts = await Cart.find({ user: userId })

        // Verificar si se encontraron carritos
        if (!carts || carts.length === 0) {
            return res.status(404).send({ message: 'No carts found for this user' })
        }

        // Obtener los IDs de los carritos encontrados
        const cartIds = carts.map(cart => cart._id)

        // Buscar las facturas asociadas a los carritos encontrados
        const invoices = await Bill.find({ cart: { $in: cartIds } })

        // Verificar si se encontraron facturas
        if (!invoices || invoices.length === 0) {
            return res.status(404).send({ message: 'No invoices found for this user' })
        }

        // Devolver las facturas encontradas
        return res.send({ invoices })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error listing invoices by user' })
    }
}

export const invoicesDetailProduct = async (req, res) => {
    try {
        // Obtener el ID del usuario del cuerpo de la solicitud
        const userId = req.body.userId

        // Buscar los carritos asociados al usuario
        const carts = await Cart.find({ user: userId })

        // Verificar si se encontraron carritos
        if (!carts || carts.length === 0) {
            return res.status(404).send({ message: 'No carts found for this user' })
        }

        // Obtener los IDs de los carritos encontrados
        const cartIds = carts.map(cart => cart._id)

        // Buscar las facturas asociadas a los carritos encontrado
        const invoices = await Bill.find({ cart: { $in: cartIds } })

        // Verificar si se encontraron facturas
        if (!invoices || invoices.length === 0) {
            return res.status(404).send({ message: 'No invoices found for this user' })
        }

        // Obtener los detalles de los productos en las facturas
        const products = [];
        for (const invoice of invoices) {
            const cart = await Cart.findById(invoice.cart).populate('product')
            if (cart) {
                products.push(cart.product)
            }
        }

        // Devolver los productos encontrados
        return res.send({ products })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error listing products in invoices by user' })
    }
}

