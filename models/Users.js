const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;
const axios = require('axios');

const UsersSchema = new Schema({
  username: String,
  hash: String,
  salt: String,
  motivPassword: String
});

UsersSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UsersSchema.methods.setMotivPassword = function(password) {
  this.motivPassword = password
};

UsersSchema.methods.validatePassword = function(password) {
  console.log(this.salt)
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UsersSchema.methods.validateMotivPassword = async function(password) {
  const motivAuthRequestJson =
    {
      username : this.username,
      password : password
    }

  const authResponse = await axios.post('https://api.motivtelecom.ru/client/v1/auth', motivAuthRequestJson)
    .then((response) => {
      console.log('Успешная проверка MotivAuth')
      return true
    })
    .catch((error) => {
      console.log('Проверка MotivAuth не пройдена')
      return false
    })

  return authResponse
};

UsersSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
    username: this.username,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, 'secret');
}

UsersSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    username: this.username,
    token: this.generateJWT(),
    motivPassword: this.motivPassword
  };
};

mongoose.model('Users', UsersSchema);
