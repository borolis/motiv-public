const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const Rates = mongoose.model('Rates');
const axios = require('axios');

//POST new user route (optional, everyone has access)
router.get('/', auth.required, async (req, res, next) => {
  const user  = req.payload;
  // console.log(req)
  const isActive = req.param('active');
  
  Users.findOne({username:user.username})
    .then(async (user) => {
      console.log('suka user!')
      console.log(user)

      const motivAuthRequestJson =
        {
          username : user.username,
          password : user.motivPassword
        }
      console.log(motivAuthRequestJson)
      const authResponse = await axios.post('https://api.motivtelecom.ru/client/v1/auth', motivAuthRequestJson)
        .then((response) => {
          console.log('Успешная проверка MotivAuth')
          return response
        })
        .catch((error) => {
          console.log('Проверка MotivAuth не пройдена')
          console.log(error.response)
          return null
        })
      if(authResponse)
      {
        console.log(authResponse.data)

        const servicesUrl = isActive === 'true'? 'https://api.motivtelecom.ru/client/v1/me/service' : 'https://api.motivtelecom.ru/v2/services?statusId=1&regionId=66&categoryRankField=rank_filter'

        const infoResponse = await axios.get(servicesUrl,{
          headers: {
            Authorization: "Bearer " + authResponse.data.access_token
          }
        })
          .then((response) => {
            let myResponse = []
            let i = 0;
            response.data.map( item => {
              if(item.activation_price === undefined || item.activation_price === 0) {
                item.activation_price = null
              }
              else {
                item.activation_price += ''
              }
                myResponse[i++] = {
                  title: item.title || item.name,
                  subtitle: item.short_description,
                  price: item.activation_price || 'Бесплатно'
                }
              }
            )

            return myResponse
          })
          .catch((error) => {
            console.log(error.response)
            return { error : error.response }
          })
        return res.json(infoResponse)
      }
    })
});

module.exports = router;

