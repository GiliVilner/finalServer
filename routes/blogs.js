const express = require("express");
const bcrypt = require("bcrypt");
const { BlogModel, validateBlog, validateAnswer } = require("../models/blogModel");
const { auth, authAdmin } = require("../middlewares/auth");
const { UserModel, validUser, validLogin, createToken } = require("../models/userModel");
const { update } = require("lodash");
const { model } = require("mongoose");
const router = express.Router();


router.get("/", async (req, res) => {
    let perPage = req.query.perPage || 5;
    let page = req.query.page || 1;
    let sort = req.query.sort || "date_update";
    let reverse = req.query.reverse == "yes" ? 1 : -1;

    try {
        let data = await BlogModel.find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            // .sort({_id:-1}) like -> order by _id DESC
            .sort({ [sort]: reverse })

        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})
// router.get("/:blogId", async (req, res) => {
//     const blogId = req.params.blogId;
//     try {
//         // path - מכוון אחרי המקודותיים לאיזה מאפיין אתה רצה לקחת מהמודל
//         // model -  לפי הקולקשיין הזה תביא לי אובייקטים ממונגו
//         let blog = await BlogModel.findOne({ _id: blogId }).populate({ path: 'comments', model: 'comments' });
//         res.json(blog.comments)
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ msg: "there error try again later", err })
//     }
// })

router.get("/count", async (req, res) => {
    try {
        // .countDocument -> מחזיר את המספר רשומות שקיימים במסד
        let count = await BlogModel.countDocuments({})
        res.json({ count });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

router.post("/", auth, async (req, res) => {
    let validBody = validateBlog(req.body);
    if (validBody.error) {
        res.status(400).json(validBody.error.details)
    }
    try {
        let blog = new BlogModel(req.body);
        blog.user_id = req.tokenData._id;
        let user = await UserModel.findOne({ _id: blog.user_id });
        console.log(user);
        blog.userName= user.name;
        blog.img_url=user.img_url;
        await blog.save();
        // let data = await blog.populate({ path: "user_id", model: "users" })
        res.json(blog);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

router.post('/:blogId/answers', auth, async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const answer = req.body;

        // בדיקת תקינות האיבר לפי הסכמה של answerSchema
        let validBody = validateAnswer(req.body);
        if (validBody.error) {
            res.status(400).json(validBody.error.details)
        }

        // עדכון הבלוג והוספת האיבר למערך
        const updatedBlog = await BlogModel.findByIdAndUpdate(
            { _id: blogId },
            { $push: { answers: answer } },
            { new: true }

        );
        const updateUser = await UserModel.findByIdAndUpdate(
            { _id: req.tokenData._id },
            { $push: { blogs: blogId } },
            { new: true }

        );

        if (!updatedBlog) {
            return res.status(404).send('הבלוג לא נמצא');
        }
        updatedBlog.date_update = Date.now();
        updatedBlog.answers[updatedBlog.answers.length - 1].user_id = req.tokenData._id;
        updatedBlog.answers[updatedBlog.answers.length - 1].user_name = updateUser.name;
        updatedBlog.answers[updatedBlog.answers.length - 1].user_img = updateUser.img_url;
        // updatedBlog.populate({path:'user_id',model:'users'})
        updatedBlog.save();
        res.send(updatedBlog);
    } catch (error) {
        console.error(error);
        res.status(500).send('שגיאת שרת');
    }
});

router.get("/user",auth, async (req, res) => {
    const userId = req.tokenData._id ;
    try {
        // path - מכוון אחרי המקודותיים לאיזה מאפיין אתה רצה לקחת מהמודל
        // model -  לפי הקולקשיין הזה תביא לי אובייקטים ממונגו
        let user = await UserModel.findOne({ _id: userId }).populate({ path: 'blogs', model: 'blogs' });
        // blog.comments.map(comment=>{
        //     CommentModel.findOne({_id: comment._id }).populate({ path: 'user_id', model: 'users' })
        // })
       
        res.json(user.blogs);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})
// router.put("/comment/:idEdit", auth, async (req, res) => {
//     let validBody = validateAnswer(req.body);
//     if (validBody.error) {
//         res.status(400).json(validBody.error.details)
//     }
//     try {
//         let idEdit = req.params.idEdit
//         let data;
//         let blog = await BlogModel.findOne({ _id: idEdit });
//         blog.answers.push(req.body);
//         if (req.tokenData.role == "admin") {

//             data = await BlogModel.updateOne({ _id: idEdit }, blog);
//         }
//         else {
//             data = await BlogModel.updateOne({ _id: idEdit, user_id: req.tokenData._id }, blog);
//         }
//         res.json(data);
//     }
//     catch (err) {
//         console.log(err)
//         res.status(500).json({ msg: "err", err })
//     }
// })

// router.put("/comment/:idEdit",auth,async(req,res) => {
//     let validBody = validateAnswer(req.body);
//     if(validBody.error){
//       res.status(400).json(validBody.error.details)
//     }
//     try{
//         let idEdit= req.params.idEdit
//         let data ;
//         if(req.tokenData.role == "admin"){
//           data = await BlogModel.findOne({_id:idEdit});
//           data.answers.push(req.body);
//           BlogModel.updateOne({_id:idEdit},data);
//         }
//         else{
//             data = await BlogModel.findOne({_id:idEdit});
//             data. user_id=req.tokenData._id
//           data.answers.push(req.body);
//           BlogModel.updateOne({_id:idEdit,user_id:req.tokenData._id},data);

//         }

//         res.json(data);
//       }
//       catch(err){
//         console.log(err)
//         res.status(500).json({msg:"err",err})
//       }
//     })

// router.patch("/comment/:idEdit", auth, async (req, res) => {

//     try {
//       let idEdit = req.params.idEdit;
//       // לא מאפשר ליוזר אדמין להפוך למשהו אחר/ כי הוא הסופר אדמין
//       // TODO:move to config
//       let data = await UserModel.updateOne({ user_id: userID }, { answers: })
//       res.json(data);
//     }
//     catch (err) {
//       console.log(err)
//       res.status(500).json({ msg: "err", err })
//     }
//   })




module.exports = router;


