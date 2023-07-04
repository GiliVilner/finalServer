// 2
const mongoose = require('mongoose');
const {config} = require("../config/secret")

main().catch(err => console.log(err));

async function main() {
  // mongodb+srv://gilivylner:GILI111@cluster0.31jlsqp.mongodb.net/
  await mongoose.connect(`mongodb+srv://${config.userDb}:${config.passDb}@cluster0.31jlsqp.mongodb.net/blackops23`);
  console.log("mongo connect blackops 23 a")
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}

