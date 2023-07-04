const express = require("express");
const bcrypt = require("bcrypt");
const { auth, authAdmin } = require("../middlewares/auth");
const { UserModel, validUser, validLogin, createToken } = require("../models/userModel");
const { CommentModel, validateComment } = require("../models/commentModel");
const { BlogModel } = require("../models/blogModel");
const router = express.Router();


router.post("/:blogId", auth, async (req, res) => {
    let validBody = validateComment(req.body);

    if (validBody.error) return res.status(401).json(validBody.error.details);
    try {
        let comment = new CommentModel(req.body);
        comment.user_id = req.tokenData._id
        await comment.save();
        const blogId = req.params.blogId;
        // לאחר יצירת מנה הוספנו את האיי די ליוזר איי די 
        // לאחר מכן הוספנו את האיי די של הכומנט לרשימת האובייקטים שנמצאים בכומנטס של אותו בלוג
        let rest = await BlogModel.updateOne({ _id: blogId },
            { $push: { 'comments': comment._id } })

        res.json(comment);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})
router.get("/:blogId", async (req, res) => {
    const blogId = req.params.blogId;
    try {
        // path - מכוון אחרי המקודותיים לאיזה מאפיין אתה רצה לקחת מהמודל
        // model -  לפי הקולקשיין הזה תביא לי אובייקטים ממונגו
        let blog = await BlogModel.findOne({ _id: blogId }).populate({ path: 'comments', model: 'comments' }).populate({path:'user_id',model:'users'});
        // blog.comments.map(comment=>{
        //     CommentModel.findOne({_id: comment._id }).populate({ path: 'user_id', model: 'users' })
        // })
        for (let i = 0; i < blog.comments.length; i++) {
            let comment = blog.comments[i];
            let user = await UserModel.findOne({ _id: comment.user_id });
            comment.populate({ path: 'user_id', model: 'users' }); // הוספת המשתמש לתגובה
          }
        res.json(blog.comments);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})
router.get("/users/:commentId", async (req, res) => {
    const commentId = req.params.commentId;
    try {
        // path - מכוון אחרי המקודותיים לאיזה מאפיין אתה רצה לקחת מהמודל
        // model -  לפי הקולקשיין הזה תביא לי אובייקטים ממונגו
        let comment = await CommentModel.findOne({ _id: commentId }).populate({ path: 'user_id', model: 'users' });
        res.json(comment)
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})



module.exports = router;
