import mongoose, { Schema, model } from "mongoose"

const categorySchema = Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    }
},
{
    versionKey: false
}
)

export default mongoose.model('category', categorySchema)