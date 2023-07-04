const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { config } = require("../config/secret")

let tripSchema = new mongoose.Schema({
    name: String,
    info: String,
    img_url: String,
    location: String,
    price: { type: String, default: null },
    area: String,
    difficulty: String,
    typeOfTrip: String,
    style: String,
    praticipants: String,
    // role of the user if regular user or admin
    active: {
        type: Boolean, default: true,
    },
})

exports.TripModel = mongoose.model("trips", tripSchema);


exports.validTrip = (_reqBody) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(99).required(),
        info: Joi.string().min(2).max(99).required(),
        location: Joi.string().min(2).max(99).required(),
        price: Joi.string().min(2).max(99).required(),
        area: Joi.string().min(2).max(99).required(),
        difficulty: Joi.string().min(2).max(99).required(),
        typeOfTrip: Joi.string().min(2).max(99).required(),
        style: Joi.string().min(2).max(99).required(),
        praticipants: Joi.string().min(2).max(99).required(),
        img_url: Joi.string().min(2).max(1000).allow(null, ""),
    })

    return joiSchema.validate(_reqBody);
}