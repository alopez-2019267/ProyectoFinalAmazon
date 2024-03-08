import mongoose, { Schema, model } from "mongoose"

const cartSchema = Schema({
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    product: {
        type: Schema.ObjectId,
        ref: 'product',
        required: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: String,
        enum: ['CREATED', 'COMPLETED'],
        default: 'CREATED',
        required: true
    }
},
{
    versionKey: false
}
)

export default mongoose.model('cart', cartSchema)