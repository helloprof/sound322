var mongoose = require("mongoose")
var Schema = mongoose.Schema
const bcrypt = require("bcryptjs")

const env = require("dotenv")
env.config()

// mongoose.connect(process.env.MONGO_URI_STRING)

var userSchema = new Schema({
  "username": {
    type: String,
    unique: true
  },
  "password": String,
  "email": String,
  "loginHistory": [{
    "dateTime": Date,
    "userAgent": String
  }]
})

let User

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGO_URI_STRING)

    db.on('error', (err) => {
      reject(err); // reject the promise with the provided error
    })
    db.once('open', () => {
      console.log("MONGO DB CONNECTED SUCCESSFULLY!")
      User = db.model("users", userSchema)
      resolve()
    })
  })
}

module.exports.registerUser = function(userData) {
  return new Promise((resolve, reject) => {
    if(userData.password != userData.password2) {
      reject("PASSWORDS DO NOT MATCH!")
    } else {
      bcrypt.hash(userData.password, 10).then((hash) => {
        userData.password = hash
        var newUser = new User(userData)
        newUser.save((err) => {
          if(err) {
            if (err.code == 11000) {
              reject("USERNAME TAKEN!")
            } else {
              reject(err)
            }
          } else {
            resolve()
          }
        })
      }).catch((error) => {
        console.log(error)
        reject("ERROR WITH PASSWORD ENCRYPTION!")
      })
    }
  })
}

module.exports.loginUser = function(userData) {
  return new Promise((resolve, reject) => {
      User.findOne({username: userData.username})
      .exec()
      .then((user) => {
        if (!user) {
          reject("UNABLE TO FIND USER: "+ userData.username)
        } else {
          bcrypt.compare(userData.password, user.password).then((result) => {
            if(result === true) {
              // session stuff
              // console.log(user)
              user.loginHistory.push({dateTime: new Date(), userAgent: userData.userAgent})
              User.updateOne({username: user.username}, 
                {$set: { loginHistory: user.loginHistory}}
              ).exec()
              .then(() => {
                resolve(user)
              })  
              .catch((err) => {
                reject("ERROR UPDATING THE USER'S LOGIN HISTORY")
              })            
            } else {
              reject("UNABLE TO AUTHENTICATE USER: "+ userData.username)
            }
          }).catch((error) => {
            reject("UNABLE TO DECRYPT PASSWORD!")
          })
        }
      })
  })
}
