import mongoose, { Schema, model } from "mongoose"

const productSchema = Schema({
    name: {
        type: String,
        unique: true,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    stock: {
        type: Number,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    categoria: {
        type: Schema.ObjectId,
        ref: "category",
        required: true
    }
},
{
    versionKey: false
}
)

export default mongoose.model('product', productSchema)