// 5
const mongoose = require("mongoose");
const TripModel=require("./tripModel")
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const {config} = require("../config/secret")

let userSchema = new mongoose.Schema({
  name:String,
  email:String,
  password:String,
  phone:String,
  birth_date:Date,
  info:String,
  img_url:String,
  trips:[mongoose.ObjectId],
  blogs:[mongoose.ObjectId],
  date_created:{
    type:Date , default:Date.now()
  },
  // role of the user if regular user or admin
  role:{
    type:String, default:"user"
  },
  active:{
    type:Boolean, default: true,
  },

})

exports.UserModel = mongoose.model("users",userSchema);

exports.createToken = (_id,role) => {
  let token = jwt.sign({_id,role},config.tokenSecret,{expiresIn:"1440mins"});
  return token;
}

exports.validUser = (_reqBody) => {
  let joiSchema = Joi.object({
    name:Joi.string().min(2).max(99).required(),
    email:Joi.string().min(2).max(99).email().required(),
    password:Joi.string().min(3).max(99).required(),
    // phone:Joi.string().min(8).max(99).required(),
    // birth_date:Joi.string().min(2).max(99).required(),
    // info:Joi.string().min(2).max(99).required(),
    img_url:Joi.string().min(2).max(1000).allow(null,""),
    birth_date:Joi.string().min(2).max(1000).allow(null,""),
    phone:Joi.string().min(2).max(10).allow(null,"")
  })

  return joiSchema.validate(_reqBody);
}

exports.validLogin = (_reqBody) => {
  let joiSchema = Joi.object({
    email:Joi.string().min(2).max(99).email().required(),
    password:Joi.string().min(3).max(99).required()
  })

  return joiSchema.validate(_reqBody);
}