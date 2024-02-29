'use strict'

import { hash, compare } from 'bcrypt'

export const encrypt = (password) => {
    try{
        return hash(password, 10)
    }catch(err){
        console.error(err)
        return err
    }
}

export const checkPassword = async(password, hash) => {
    try{
        return await compare(password, hash)
    }catch(err){
        console.error(err)
        return err
    }
}

export const checkUpdateCliente = (data, userId)=>{
    if (userId){
        //validamos si data esta vacío   o 
        if(Object.entries(data).length === 0  
        || data.role 
        || data.role == ''){
            return false
        }
        return true
    }
}

export const checkUpdate = (data, userId)=>{
    if (userId){
        //validamos si data esta vacío   o 
        if(Object.entries(data).length === 0  
        || data.password 
        || data.password == '' 
        || data.role 
        || data.role == ''){
            return false
        }
        return true
    }/*else{
        if(Object.entries(data).length === 0  
        || data.keeper 
        || data.keeper == '' ){
            return false
        }
        return true
    }*/
}

