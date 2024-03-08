'use strict'

import Product from './product.model.js'
import Category from '../category/category.model.js'
import Cart from '../cart/cart.model.js'


export const test = (req, res)=>{
    console.log('Test is running Product')
    return res.send({message: 'Test is running'})
}

export const saveProduct = async(req, res)=>{
    try {
        //Capturar la data
        let data = req.body
        const existProduct = await Product.findOne({name: data.name})
        if (existProduct){
            return res.status(400).send({message: 'The product already exists'})
        }
        //Validar que la categoria exista
        let category = await Category.findOne({_id: data.categoria})
        if(!category) return res.status(404).send({message: 'Category not found'})
        //Crear la instancia del 'producto'
        let product = new Product(data)
        //Guardar el producto
        await product.save()
        //Responder si todo sale bien
        return res.send({message: 'Product saved successfully'})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error saving product'})
    }
}

export const searchProductById = async (req, res) => {
    try {
        let { search } = req.body;
        
        let product = await Product.find({_id: search})
        if(!product) return res.status(404).send({message: 'Product not found'})

        return res.send({ message: 'Product found', product });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error getting product' });
    }
}

export const listProducts = async(req, res) => {
    try {
        let products = await Product.find().populate(['name', 'description', 'stock', 'price', 'categoria']);

        if (!products || products.length === 0) {
            return res.status(404).send({ message: 'No products found' });
        }
        return res.send({ message: 'Products found', products });
    } catch(err) {
        console.error(err);
        return res.status(500).send({ message: 'Error listing products' });
    }
}

export const updateProduct = async(req, res)=>{
    try {
        //Capturar la data
        let data = req.body
        const existProduct = await Product.findOne({name: data.name})
        if (existProduct){
            return res.status(400).send({message: 'The product already exists'})
        }
        //Capturar el id del producto a actualizar
        let {id} = req.params
        //Actualizar
        let updatedProduct = await Product.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        ).populate('categoria', ['name', 'description'])
        //Validar la actualizacion
        if(!updatedProduct) return res.status(404).send({message: 'Producto not found and not updated'})
        
        //Responder si todo sale bien
        return res.send({message: 'Product updated successfully', updatedProduct})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error updating product'})
    }
}

export const controlInventory = async (req, res) => {
    try {
        // Calcular la cantidad total de productos en stock
        const totalProducts = await Product.countDocuments();
        
        // Calcular la cantidad total de productos agotados
        const soldOutProductsCount = await Product.countDocuments({ stock: 0 });
        
        // Calcular la cantidad total de productos no agotados
        const availableProductsCount = totalProducts - soldOutProductsCount;

        // Calcular la cantidad total de productos que se han comprado
        const purchasedProductsCount = await Cart.aggregate([
            { $match: { status: 'COMPLETED' } }, // Filtrar solo los carritos completados
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } } // Sumar las cantidades de productos en todos los carritos
        ]);

        const totalPurchasedProducts = purchasedProductsCount.length > 0 ? purchasedProductsCount[0].totalAmount : 0;

        // Responder con los resultados
        return res.json({
            totalProducts,
            soldOutProductsCount,
            availableProductsCount,
            totalPurchasedProducts
        });
    } catch (error) {
        console.error(error);

        // Manejar errores específicos
        if (error.name === 'MongoError') {
            return res.status(500).send({ message: 'Database error' })
        }

        return res.status(500).send({ message: 'Inventory control error' })
    }
}


export const findSoldOut = async (req, res) => {
    try {
        // Buscar productos con stock igual a cero
        const soldOut = await Product.find({ stock: 0 })

        // Verificar si se encontraron productos agotados
        if (soldOut.length === 0) {
            return res.send({ message: 'No product out of stock' })
        }

        // Responder con los productos agotados
        return res.send({ soldOut })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error when searching for out of stock products' })
    }
}

export const getInfoMostSoldProducts = async (req, res) => {
    try {
        const completedCarts = await Cart.find({ status: 'COMPLETED' }).populate('product', ['name', 'description', 'stock', 'price', 'categoria'])

        const soldProducts = {}

        completedCarts.forEach(cart => {
            const productId = cart.product._id.toString()
            if (soldProducts[productId]) {
                soldProducts[productId].totalAmount += cart.amount
            } else {
                soldProducts[productId] = {
                    productName: cart.product.name,
                    description: cart.product.description,
                    stock: cart.product.stock,
                    price: cart.product.price,
                    categoria: cart.product.categoria,
                    totalAmount: cart.amount
                };
            }
        })

        const mostSoldProducts = Object.values(soldProducts).sort((a, b) => b.totalAmount - a.totalAmount)

        return res.send({ message: 'Most sold products found', mostSoldProducts })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error getting most sold products' })
    }
}

export const deleteProduct = async(req, res)=>{
    try{
      //Capturar el id de la categoria a eliminar
      let { id } = req.params
      //Eliminar
      let deletedProduct = await Product.deleteOne({_id: id})
      //Validar que se elimino
      if(deletedProduct.deleteCount === 0)return res.status(404).send({message: 'Product not found and not deleted'})
      //Responder
      return res.send({message: 'Deleted Product successfully'})
    }catch(err){
      console.error(err)
      return res.status(404).send({message: 'Error deleting Product'})
    }
}

//Exploración de Productos:

export const getMostSoldProducts = async (req, res) => {
    try {
        const completedCarts = await Cart.find({ status: 'COMPLETED' }).populate('product', ['name', 'price'])

        const soldProducts = {}

        completedCarts.forEach(cart => {
            const productId = cart.product._id.toString()
            if (soldProducts[productId]) {
                soldProducts[productId].totalAmount += cart.amount
            } else {
                soldProducts[productId] = {
                    productName: cart.product.name,
                    price: cart.product.price,
                    totalAmount: cart.amount
                };
            }
        })

        const mostSoldProducts = Object.values(soldProducts).sort((a, b) => b.totalAmount - a.totalAmount)

        return res.send({ message: 'Most sold products found', mostSoldProducts })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error getting most sold products' })
    }
}

export const searchProductByName = async (req, res) => {
    try {
        let { search } = req.body;
        
        let product = await Product.find({name: search})
        if(!product) return res.status(404).send({message: 'Product not found'})

        return res.send({ message: 'Product found', product });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error getting product' });
    }
}

