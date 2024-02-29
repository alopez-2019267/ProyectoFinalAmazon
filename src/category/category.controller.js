'use strict'

import Category from './category.model.js'
import { encrypt, checkPassword, checkUpdateCliente } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'//dejarlos para mientras pero si no se usan quitarlos

export const test = (req, res)=>{
    console.log('Test is running Category')
    return res.send({message: 'Test is running'})
}

export const saveCategory = async(req, res)=>{
    try {
        //Capturar la data
        let data = req.body
        const existingCategory = await Category.findOne({ name: data.name });
        if (existingCategory) {
            return res.status(400).send({message: `Una categoria con el mismo nombre ya existe`});
        }
        //Crear la instancia del 'categoria'
        let category = new Category(data)
        //Guardar la categoria
        await category.save()
        //Responder si todo sale bien
        return res.send({message: 'Category saved successfully'})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error saving Category'})
    }
}

export const listCategories = async(req, res) => {
    try {
        let categories = await Category.find().populate(['name', 'description']);

        if (!categories || categories.length === 0) {
            return res.status(404).send({ message: 'No categories found' });
        }
        return res.send({ message: 'Categories found', categories });
    } catch(err) {
        console.error(err);
        return res.status(500).send({ message: 'Error listing categories' });
    }
}

export const updateCategory = async(req, res)=>{
    try {
        //Capturar la data
        let data = req.body
        //Capturar el id de la categoria a actualizar
        let {id} = req.params
        //Validar que vengan datos
        //let update = checkUpdate(data, false)
        //if(!update) return res.status(400).send({message: 'Have sumitted some data that cannot be updated or missing data'})
        //Actualizar
        let updatedCategory = await Category.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        ).populate(['name', 'description'])//Elimianr la informacion sensible
        //Validar la actualizacion
        if(!updatedCategory) return res.status(404).send({message: 'Category not found and not updated'})
        
        //Responder si todo sale bien
        return res.send({message: 'Category updated successfully', updatedCategory})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error updating Category'})
    }
}

export const deleteCategory = async(req, res)=>{
    try{
      //Verificar si tiene una reunion en proceso. X
      //Capturar el id de la categoria a eliminar
      let { id } = req.params
      //Eliminar
      let deletedCategory = await Category.deleteOne({_id: id})
      //Validar que se elimino
      if(deletedCategory.deleteCount === 0)return res.status(404).send({message: 'Category not found and not deleted'})
      //Responder
      return res.send({message: 'Deleted Category successfully'})
    }catch(err){
      console.error(err)
      return res.status(404).send({message: 'Error deleting Category'})
    }
}