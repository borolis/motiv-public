const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const Rates = mongoose.model('Rates');
const axios = require('axios');

async function getMotivToken(username, password) {
  const motivAuthRequestJson =
    {
      username : username,
      password : password
    }
  console.log(motivAuthRequestJson)
  const authResponse = await axios.post('https://api.motivtelecom.ru/client/v1/auth', motivAuthRequestJson)
    .then((response) => {
      console.log('Успешная проверка MotivAuth info.js')
      return response
    })
    .catch((error) => {
      console.log('Проверка MotivAuth не пройдена info.js')
      return null
    })
    if(authResponse !== null) {
      return authResponse.data.access_token
    }
    else {
      return null
    }
}

//POST new user route (optional, everyone has access)
router.get('/', auth.required, async (req, res, next) => {
  const user  = req.payload;
  // console.log(req)
  console.log('INFO JS!')
  let userFromDb = await Users.findOne({username:user.username})
    .then((user) => {
      console.log('found user in info.js ')
      console.log(user)
      if(user === null) {
        return null
      }
      return user
    })

  if(userFromDb === null) {
    console.log('user from db is null')
    console.log(userFromDb)
    return res.json({error:"error user from db is null"})
  }


  let motivToken = await getMotivToken(userFromDb.username, userFromDb.motivPassword)

  if(motivToken != null)
  {
    const infoResponse = await axios.get('https://api.motivtelecom.ru/client/v1/me',{
      headers: {
        Authorization: "Bearer " + motivToken
      }
    })
      .then(async (response) => {
        const resultSet = {
          name: response.data.name,
          phoneNumber: "+7" + response.data.username,
          balance: response.data.balance.value,
          tariff: response.data.tariff.title,
          minutes: 345,
          internet: 12,
          sms: 890
        }
        return resultSet
      })
      .catch((error) => {
        console.log(error.response)
        return { error : error.response }
      })
    console.log(infoResponse)
    return res.json(infoResponse)
  }
  else
  {
    return res.json({error:"error motiv token is null"})
  }
});


module.exports = router;

