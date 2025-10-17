import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema({
    subsciber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    Channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }

}, { timestamps: true })





export const Subscription = mongoose.model('Subscription', subscriptionSchema)