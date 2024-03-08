'use strict'

import Category from './category.model.js'
import Product from '../product/product.model.js'



export const test = (req, res)=>{
    console.log('Test is running Category')
    return res.send({message: 'Test is running'})
}

export const categoryDef = async(req,res) =>{
    try{
        const categoryExists = await Category.findOne({name: 'NoCategory'})
        if(categoryExists){
            console.log('Ya existe la categoria NoCategory')
        }else{
            const nuevaCategoria = new Category({
                name: 'NoCategory',
                description: 'Categoria Default'
            })
            await nuevaCategoria.save()
        }
    }catch(err){
        console.error(err)
    }
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

export const deleteCategory = async (req, res) => {
    try {
        // Capturar el id de la categoría a eliminar
        const { id } = req.params;

        // Verificar si la categoría existe
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).send({ message: 'Category not found' });
        }

        // Verificar si la categoría a eliminar es la predeterminada
        const defaultCategory = await Category.findOne({ name: 'NoCategory' });
        if (!defaultCategory) {
            return res.status(500).send({ message: 'Default category not found' });
        }

        // Transferir productos de la categoría eliminada a la categoría predeterminada
        const products = await Product.updateMany({ categoria: id }, { categoria: defaultCategory._id });
        if (!products) {
            return res.status(500).send({ message: 'Error transferring products to default category' });
        }

        // Eliminar la categoría
        const deletedCategory = await Category.deleteOne({ _id: id });
        if (deletedCategory.deletedCount === 0) {
            return res.status(404).send({ message: 'Category not found and not deleted' })
        }

        // Responder
        return res.send({ message: 'Deleted Category successfully' })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting Category' })
    }
}


export const listCategory = async(req, res) => {
    try {
        let category = await Category.find().populate(['name', 'description']);

        if (!category || category.length === 0) {
            return res.status(404).send({ message: 'No categories found' });
        }
        return res.send({ message: 'Categories found', category });
    } catch(err) {
        console.error(err);
        return res.status(500).send({ message: 'Error listing categories' });
    }
}

export const productsByCategory = async(req, res) => {
    try {
        let { nameC } = req.body
        let category = await Category.findOne({name: nameC})
        if(!category || category.length === 0) return res.status(401).send({message: 'Category not found'})
        let categoryId = category._id
        let product = await Product.find({categoria: categoryId})
        return res.send({product})
    } catch(err) {
        console.error(err);
        return res.status(500).send({ message: 'Error listing products by category' });
    }
}