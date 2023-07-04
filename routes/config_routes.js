// 3
const indexR = require("./index");
const usersR = require("./users");
const blogsR = require("./blogs");
const tripsR = require("./trip")
//  const commentsR = require("./comments");

exports.routesInit = (app) => {
  app.use("/", indexR);
  app.use("/users", usersR);
  app.use("/blogs", blogsR);
  app.use("/trips", tripsR);
  // app.use("/comments",commentsR);

}