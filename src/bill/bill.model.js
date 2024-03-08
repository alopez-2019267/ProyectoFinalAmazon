import mongoose, { Schema, model } from "mongoose"

const billSchema = Schema({
    date: {
        type: Date,
        required: true
    },
    cart: {
        type: Schema.ObjectId,
        ref: 'cart',
        required: true
    },
    total: {
        type: Number,
        required: true
    }
},
{
    versionKey: false
}
)

export default mongoose.model('bill', billSchema)