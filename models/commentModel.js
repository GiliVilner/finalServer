// 9
const mongoose = require("mongoose");
const Joi = require("joi");

const commentSchema = new mongoose.Schema({
    comment: String,
    user_id: mongoose.ObjectId,
     date_created: {
        type: Date, default: Date.now()
    },
    img_url: String,
    url: String
})

exports.CommentModel = mongoose.model("comments", commentSchema);



exports.validateComment = (_reqBody) => {
    let joiSchema = Joi.object({
        comment: Joi.string().min(2).max(500).required(),
        img_url: Joi.string().allow(null, "").max(500)
    });
    return joiSchema.validate(_reqBody);
}
