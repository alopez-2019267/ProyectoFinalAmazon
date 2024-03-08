'use strict'

import User from './user.model.js'
import Cart from '../cart/cart.model.js'
import { encrypt, checkPassword, checkUpdateCliente, checkUpdateAdminClient } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';


export const test = (req, res) =>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

export const userDef = async(req,res) =>{
    try{
        const userExists = await User.findOne({username: 'admin'})
        if(userExists){
            console.log('Ya existe el Admin Maestro')
        }else{
            const encryptPassword =  await encrypt('admin123')
            const nuevoUsuario = new User({
                name: 'admin',
                surname: 'admin',
                username: 'admin',
                password: encryptPassword,
                email: 'admin@gmail.com',
                phone: '12345678',
                role: 'ADMINISTRADOR'
            })
            await nuevoUsuario.save()
        }
    }catch(err){
        console.error(err)
    }
}

export const registerCliente = async(req, res) =>{
    try{
        let data = req.body
        data.password = await encrypt(data.password)
        let findUsername = await User.findOne({
            $or: [
                {username: data.username},
                {email: data.email}
            ]
        })
        if(findUsername) return res.status(403).send({message: `El usuario ${data.username} ya existe o el email ${data.email}`})
        data.role = 'CLIENTE'
        let user = new User(data)
        // Falta validar que compruebe si el usuario ya esta en uso
        await user.save()
        return res.send({message: `Register successfully ${user.username}`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error registering user', err: err})
    }
}

export const login = async(req, res) =>{
    try{
        let {account, password} = req.body
        //validamos que el usuario exista
        let user = await User.findOne({
            $or: [
                { username : account },
                { email: account }
            ]
        })//Busca un solo registro
        if(user && await checkPassword(password, user.password)){
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
            //Generate token 
            let token = await generateJwt(loggedUser)
            //responder al usuario
            return res.send(
                {message: `Welcome ${loggedUser.name}`,
                loggedUser,
                token})
        }
        return res.status(400).send({message: `User not found`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error to login'})
    }
}

export const createUser = async(req, res) =>{
    try{
        let data = req.body
        data.password = await encrypt(data.password)
        let findUsername = await User.findOne({
            $or: [
                {username: data.username},
                {email: data.email}
            ]
        })
        if(findUsername) return res.status(403).send({message: `El usuario ${data.username} ya existe o el email ${data.email}`})
        let user = new User(data)
        // Falta validar que compruebe si el usuario ya esta en uso
        await user.save()
        return res.send({message: `Register successfully ${user.username}`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error registering user', err: err})
    }
}

export const updateAdmin = async(req, res) => {
    try{
        //Obtener el id del usuario para actualizar
        let { id } = req.params
        //obtener los datos a actualizar
        let data = req.body
        data.password = await encrypt(data.password)
        let secretKey = process.env.SECRET_KEY
        let token = req.headers.authorization
        const {uid} = jwt.verify(token, secretKey)
        if(uid != id) return res.status(404).send({message: 'You can not edit another client '})
        //Actualizar la db
        let updatedUser = await User.findOneAndUpdate(
            //va a buscar un solo registro
            {_id: id},  //ObjectId <- hexadecimales(hora sys, version mongo, llave privada...)
            data, //los datos que se van a actualizar 
            {new: true}
        )
        //Validar la actualización
        if(!updatedUser) return res.status(401).send({message: 'User not found and not update'})
        //Responde al usuario
        return res.send({message: `Update user`, updatedUser})
    }catch(err){
        console.error(err)
        if(err.keyValue.username)return res.status(400).send({message: `Username ${err.keyValue.username} is alredy exists`})
        return res.status(500).send({message: `Error updating account`})
    }
}

export const updateClientAdmin = async(req, res) => {
    try {
        // Obtener el id del usuario para actualizar
        let { id } = req.params;
        // Obtener los datos a actualizar
        let data = req.body;
        
        // Validar que data no esté vacío
        let update = checkUpdateAdminClient(data, id);
        if (!update) return res.status(400).send({ message: `Have submitted some data that cannot be updated` });

        // Validar si el usuario tiene permisos (tokenización)
        // (Por ahora no implementado)

        // Verificar si el usuario tiene el rol ADMINISTRADOR
        const user = await User.findById(id);
        if (!user) return res.status(404).send({ message: 'User not found' });

        if (user.role === 'ADMINISTRADOR') {
            return res.status(403).send({ message: 'You are not authorized to update users with role ADMINISTRADOR' });
        }

        // Actualizar la base de datos
        let updatedUser = await User.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        );

        // Validar la actualización
        if (!updatedUser) return res.status(401).send({ message: 'User not found and not updated' });

        // Responder al usuario
        return res.send({ message: `Update user`, updatedUser });
    } catch (err) {
        console.error(err);
        if (err.keyValue && err.keyValue.username) {
            return res.status(400).send({ message: `Username ${err.keyValue.username} already exists` });
        }
        return res.status(500).send({ message: `Error updating account` });
    }
}

export const deleteAdmin = async(req, res) => {
    try{
        //Obtener el Id
        let { id } = req.params
        //validar si esta logeado y es el mismo
        let secretKey = process.env.SECRET_KEY
        let token = req.headers.authorization
        const {uid} = jwt.verify(token, secretKey)
        if(uid != id) return res.status(404).send({message: 'You can not delete another admin '})
        //Actualizar la db
        //Eliminamos (deleteOne(solo elimina), findeOneAndDelete(me devuelve el documento eliminado))
        let deletedUser = await User.findOneAndDelete({_id: id})
        //Verificamos que se elimino
        if(!deletedUser) return res.status(404).send({message: 'Account not found and not delete'})
        //Responder al usuario
        return res.send({message: `Account with username ${deletedUser.username} delete successfully`}) //seeimpre que envio solo el send, envia un status(200)
    }catch(err){
        console.error(err)
        return res.status(500).send({message: `Error deleting account`})
    }
}

export const deleteClientAdmin = async(req, res) => {
    try{
        //Obtener el Id
        let { id } = req.params
        const user = await User.findById(id);
        if (!user) return res.status(404).send({ message: 'User not found' });

        if (user.role === 'ADMINISTRADOR') {
            return res.status(403).send({ message: 'You are not authorized to update users with role ADMINISTRADOR' });
        }
        //Eliminamos (deleteOne(solo elimina), findeOneAndDelete(me devuelve el documento eliminado))
        let deletedUser = await User.findOneAndDelete({_id: id})
        //Verificamos que se elimino
        if(!deletedUser) return res.status(404).send({message: 'Account not found and not delete'})
        //Responder al usuario
        return res.send({message: `Account with username ${deletedUser.username} delete successfully`}) //seeimpre que envio solo el send, envia un status(200)
    }catch(err){
        console.error(err)
        return res.status(500).send({message: `Error deleting account`})
    }
}


//tengo que revisar este (CLIENTE)
/*export const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;

        let data = req.body;
        let update = checkUpdateCliente(data, id);
        if (!update) return res.status(400).send({ message: `Have submitted some data that cannot be updated` });

        // Verificar si se proporciona la contraseña antigua y la nueva contraseña
        if ('oldPassword' in data && 'newPassword' in data) {
            const { oldPassword, newPassword } = req.body;
            // Verificar si se proporciona la contraseña antigua y la nueva contraseña
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ message: 'Se requieren la contraseña antigua y la nueva contraseña' });
            }
     
            // Buscar al usuario por ID y contraseña antigua
            const user = await User.findOne({ _id: id});
     
            if (!user) {
                return res.status(401).json({ message: 'La contraseña antigua es incorrecta o el usuario no fue encontrado' });
            }
            // Verificar si la contraseña antigua es correcta
            const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: 'La contraseña antigua es incorrecta' });
            }
    
            // Verificar que la nueva contraseña cumpla con los requisitos mínimos
            if (newPassword.length < 8) {
                return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres' });
            }
            let nuevacontra = await encrypt(newPassword)
            // Actualizar la contraseña del usuario
            const updatedUser = await User.findByIdAndUpdate(id, { password: nuevacontra }, { new: true });
     
            if (!updatedUser) {
                return res.status(500).json({ message: 'Error al actualizar la contraseña del usuario' });
            }
        }

        let secretKey = process.env.SECRET_KEY;
        let token = req.headers.authorization;
        const { uid } = jwt.verify(token, secretKey);
        if (uid != id) return res.status(404).send({ message: 'No puedes editar otro cliente' });

        // Actualizar la db
        let updatedUser = await User.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        );

        // Validar la actualización
        if (!updatedUser) return res.status(401).send({ message: 'Usuario no encontrado o no actualizado' });

        // Responder al usuario
        return res.send({ message: 'Usuario actualizado correctamente', updatedUser });
    } catch (err) {
        console.error(err);
        if (err.keyValue && err.keyValue.username) return res.status(400).send({ message: `El nombre de usuario ${err.keyValue.username} ya existe` });
        return res.status(500).send({ message: 'Error al actualizar la cuenta' });
    }
}*/
export const updateCliente = async(req, res) => {//Sirve para datos generales, menos contraseña
    try{
        //Obtener el id del usuario para actualizar
        let { id } = req.params
        //obtener los datos a actualizar
        let data = req.body
        let update = checkUpdateCliente(data, id);
        if (!update) return res.status(400).send({ message: `Have submitted some data that cannot be updated` });
        let secretKey = process.env.SECRET_KEY
        let token = req.headers.authorization
        const {uid} = jwt.verify(token, secretKey)
        if(uid != id) return res.status(404).send({message: 'You can not edit another client '})
        //validar que data no este vacío
        //Validar si tiene permisos (tokenización) X hoy no lo vemos X
        //Actualizar la db
        let updatedUser = await User.findOneAndUpdate(
            //va a buscar un solo registro
            {_id: id},  //ObjectId <- hexadecimales(hora sys, version mongo, llave privada...)
            data, //los datos que se van a actualizar 
            {new: true}
        )
        //Validar la actualización
        if(!updatedUser) return res.status(401).send({message: 'User not found and not update'})
        //Responde al usuario
        return res.send({message: `Update user`, updatedUser})
    }catch(err){
        console.error(err)
        if(err.keyValue.username)return res.status(400).send({message: `Username ${err.keyValue.username} is alredy exists`})
        return res.status(500).send({message: `Error updating account`})
    }
}

export const updateClientePass = async (req, res) => {
    try {
        const { id } = req.params;
 
        const { oldPassword, newPassword } = req.body;
        let secretKey = process.env.SECRET_KEY
        let token = req.headers.authorization
        const {uid} = jwt.verify(token, secretKey)
        if(uid != id) return res.status(404).send({message: 'You can not edit another client '})
        // Verificar si se proporciona la contraseña antigua y la nueva contraseña
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Se requieren la contraseña antigua y la nueva contraseña' });
        }
 
        // Buscar al usuario por ID y contraseña antigua
        const user = await User.findOne({ _id: id});
 
        if (!user) {
            return res.status(401).json({ message: 'La contraseña antigua es incorrecta o el usuario no fue encontrado' });
        }
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'La contraseña antigua es incorrecta' });
        }
        // Verificar que la nueva contraseña cumpla con los requisitos mínimos
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres' });
        }
        let nuevacontra = await encrypt(newPassword)
        // Actualizar la contraseña del usuario
        const updatedUser = await User.findByIdAndUpdate(id, { password: nuevacontra }, { new: true });
 
        if (!updatedUser) {
            return res.status(500).json({ message: 'Error al actualizar la contraseña del usuario' });
        }
 
        return res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const deleteCliente = async(req, res) => {
    try{
        //Obtener el Id
        let { id } = req.params
        const { password } = req.body
        if(!password){
            return res.status(400).send({message: 'Se requiere la contraseña para eliminar la cuenta'})
        }
        const user = await User.findOne({_id: id})
        if(!user){
            return res.status(404).send({message: 'Usuario no encontrado'})
        }
        const isPasswordValid = await checkPassword(password, user.password)
        if(!isPasswordValid){
            return res.status(401).send({message: 'Contraseña incorrecta'})
        }
        //validar si esta logeado y es el mismo
        let secretKey = process.env.SECRET_KEY
        let token = req.headers.authorization
        const {uid} = jwt.verify(token, secretKey)
        if(uid != id) return res.status(404).send({message: 'You can not delete another client '})
        //Actualizar la db
        //Eliminamos (deleteOne(solo elimina), findeOneAndDelete(me devuelve el documento eliminado))
        let deletedUser = await User.findOneAndDelete({_id: id})
        //Verificamos que se elimino
        if(!deletedUser) return res.status(404).send({message: 'Account not found and not delete'})
        //Responder al usuario
        return res.send({message: `Account with username ${deletedUser.username} delete successfully`}) //seeimpre que envio solo el send, envia un status(200)
    }catch(err){
        console.error(err)
        return res.status(500).send({message: `Error deleting account`})
    }
}

export const getPurchases = async (req, res) => {
    try {
        let { search } = req.body;
        const secretKey = process.env.SECRET_KEY;
        const token = req.headers.authorization;

        const decodedToken = jwt.verify(token, secretKey);
        const tokenUserId = decodedToken.uid;

        // Verificar si el ID de usuario en el token coincide con el ID de usuario en la solicitud
        if (tokenUserId !== search) {
            return res.status(401).send({ message: "No estás autorizado para realizar esta acción." });
        }

        let purchase = await Cart.find({ user: search, status: 'COMPLETED' }).populate('user', ['name']);
        if (!purchase || purchase.length === 0) return res.status(404).send({ message: 'Purchase not found' });

        return res.send({ message: 'Purchase found', purchase });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error getting purchase' });
    }
}