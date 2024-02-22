//Configuración a la conexión a la BD
'use strict'

import mongoose, { Mongoose } from "mongoose"

export const connect = async() => {
    try{
        //Proceso de conexión 
        mongoose.connection.on('error', () =>{
            console.log('MongoDB | could not be connect to mongodb')
            mongoose.disconnect()
        })
        mongoose.connection.on('connecting', ()=>{
            console.log('MongoDB | try connecting')
        })
        mongoose.connection.on('connected', ()=>{
            console.log('MongoDB | connected to mongodb')
        })
        mongoose.connection.once('open', ()=>{
            console.log('MongoDB | connected to database')
        })
        mongoose.connection.on('reconected', ()=>{
            console.log('MongoDB | reconected to mongodb')
        })
        mongoose.connection.on('disconected', ()=>{
            console.log('MongoDB | disconected to mongodb')
        })
        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50
        }) 
    }catch(err){
        console.error(err)
    }
}