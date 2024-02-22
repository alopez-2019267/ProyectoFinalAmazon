'use strict'

import User from './user.model.js'
import { encrypt, checkPassword, checkUpdateCliente } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'

export const test = (req, res) =>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}


export const registerCliente = async(req, res) =>{
    try{
        let data = req.body
        data.password = await encrypt(data.password)
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
        //Capturamos los datos (body)
        let {username, password} = req.body
        //validamos que el usuario exista
        let user = await User.findOne({username: username})//Busca un solo registro
        //verifica que la contraseña coincida
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

export const updateCliente = async(req, res) => {
    try{
        let { id } = req.params
        let data = req.body
        data.password = await encrypt(data.password)
        let update = checkUpdateCliente(data, id)
        if(!update) return res.status(400).send({message: `Have submitted some data that cannot be updated`})
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

