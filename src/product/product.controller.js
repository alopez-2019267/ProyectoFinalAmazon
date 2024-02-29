'use strict'

import Product from './product.model.js'
import Category from '../category/category.model.js'
import { encrypt, checkPassword, checkUpdate } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'//dejarlos para mientras pero si no se usan quitarlos

export const test = (req, res)=>{
    console.log('Test is running Product')
    return res.send({message: 'Test is running'})
}

export const saveProduct = async(req, res)=>{
    try {
        //Capturar la data
        let data = req.body
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
        //Capturar el id del producto a actualizar
        let {id} = req.params
        //Validar que vengan datos
        let update = checkUpdate(data, false)
        if(!update) return res.status(400).send({message: 'Have sumitted some data that cannot be updated or missing data'})
        //Actualizar
        let updatedProduct = await Product.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        ).populate('categoria', ['name', 'description'])//Elimianr la informacion sensible
        //Validar la actualizacion
        if(!updatedProduct) return res.status(404).send({message: 'Producto not found and not updated'})
        
        //Responder si todo sale bien
        return res.send({message: 'Product updated successfully', updatedProduct})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error updating product'})
    }
}

export const deleteProduct = async(req, res)=>{
    try{
      //Verificar si tiene una reunion en proceso. X
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