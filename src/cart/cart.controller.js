'use strict'

import Product from '../product/product.model.js'
import User from '../user/user.model.js'
import Cart from './cart.model.js'
import jwt from 'jsonwebtoken'

export const test = (req, res)=>{
    console.log('Test is running Cart')
    return res.send({message: 'Test is running'})
}

export const saveProductCart = async (req, res) => {
    try {
        const data = req.body;
        const secretKey = process.env.SECRET_KEY;
        const token = req.headers.authorization;

        const decodedToken = jwt.verify(token, secretKey);
        const tokenUserId = decodedToken.uid;

        // Verificar si el ID de usuario en el token coincide con el ID de usuario en la solicitud
        if (tokenUserId !== data.user) {
            return res.status(401).send({ message: "No estás autorizado para realizar esta acción." });
        }

        // Buscar al usuario por su ID
        const user = await User.findById(data.user);
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        // Buscar el producto por su ID
        const product = await Product.findById(data.product);
        if (!product) {
            return res.status(400).send({ message: "Product not found" });
        }

        // Verificar si el producto está en stock
        if (product.stock === 0) {
            return res.status(400).send({ message: "Product out of stock" });
        }

        // Verificar si la cantidad del producto es positiva
        if (data.amount <= 0) {
            return res.status(400).send({ message: "Amount must be positive" });
        }

        // Buscar un carrito activo para el usuario y el producto específico que no esté marcado como "COMPLETED"
        let cart = await Cart.findOne({ 
            user: data.user, 
            product: data.product, 
            status: { $ne: 'COMPLETED' } 
        })

        if (cart) {
            // Si encontramos un carrito activo, actualizamos su cantidad
            cart.amount = +cart.amount + +data.amount;
        } else {
            // Si no encontramos un carrito activo, creamos uno nuevo
            cart = new Cart({
                date: new Date(),
                amount: data.amount,
                status: "CREATED",
                product: data.product,
                user: data.user
            })
        }

        // Verificar si la cantidad solicitada para el carrito es mayor que el stock disponible
        if (cart.amount > product.stock) {
            return res.status(400).send({ message: "Insufficient stock" })
        }

        // Guardar o actualizar el carrito de compra
        await cart.save();

        return res.send({ message: "Cart added successfully" })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Error adding Cart" })
    }
}

//Mejorar el delete y meter validaciones
export const deleteProductCart = async (req, res) => {
    try {
        const { id } = req.params;
        const secretKey = process.env.SECRET_KEY;
        const token = req.headers.authorization;

        const decodedToken = jwt.verify(token, secretKey);
        const tokenUserId = decodedToken.uid;

        const cart = await Cart.findById(id);

        if (!cart) {
            return res.status(404).send({ message: "Shopping Cart not found" });
        }

        // Verificar si el usuario del token coincide con el usuario del carrito
        if (tokenUserId !== cart.user.toString()) {
            return res.status(401).send({ message: "No estás autorizado para realizar esta acción." });
        }

        // Verificar si el carrito tiene el estado "COMPLETED"
        if (cart.status === 'COMPLETED') {
            return res.status(403).send({ message: "No puedes eliminar un carrito completado." });
        }

        // Eliminar el carrito
        const deletedCart = await Cart.deleteOne({ _id: id });

        // Validar que se eliminó
        if (deletedCart.deletedCount === 0) {
            return res.status(404).send({ message: 'Shopping Cart not found and not deleted' });
        }

        // Responder
        return res.send({ message: 'Deleted Product successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting Product' });
    }
}