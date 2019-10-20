const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const Rates = mongoose.model('Rates');

//POST new user route (optional, everyone has access)
router.post('/register', auth.optional, async (req, res, next) => {
  const { body: { user } } = req;

  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  if(!user.motivPassword) {
    return res.status(422).json({
      errors: {
        motivPassword: 'is required',
      },
    });
  }

  if(!user.motivUsername) {
    return res.status(422).json({
      errors: {
        motivUsername: 'is required',
      },
    });
  }

  const finalUser = new Users(user);
  if(!(await finalUser.validateMotiv(user.motivUsername, user.motivPassword)))
  {
    return res.status(422).json({
      errors: {
        motivPassword: 'is wrong',
      },
    });
  }

  finalUser.setPassword(user.password);

  return finalUser.save()
    .then(() => res.json({ user: finalUser.toAuthJSON() }));
});



//POST login route (optional, everyone has access)
router.post('/login', auth.optional, async (req, res, next) => {
  const { body: { user } } = req;

  if(!user.username) {
    return res.status(422).json({
      errors: {
        username: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, async (err, passportUser, info) => {
    if(err) {
      return next(err);
    }

    if(passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();
      return res.json({ user: user.toAuthJSON() });
    }
    else {
      const tmpUser = new Users(user)
      const isMotivPassCorrect = await tmpUser.validateMotivPassword(user.password)
      if(isMotivPassCorrect) {
        ///TODO register new user and make auth token
        console.log("NEED TO REGISTER THIS USER, MOTIV IS CORRECT!")

        return await Users.findOne({ username: user.username })
            .then(async (acc) => {
              console.log('user already exist in db')
              return await Users.deleteOne({ username: user.username })
                .then(async () => {
                  console.log('user removed from db')
                  tmpUser.setMotivPassword(user.password)
                  tmpUser.setPassword(user.password)
                  console.log('password set and sending response')
                  return await tmpUser.save()
                    .then(() => {
                      return res.json({ user: tmpUser.toAuthJSON() })
                    });
                })
                .catch(() => {
                  console.log('failed to remove user from db')
                })
            })
            .catch(() => {
              console.log('user not found in db')
            })



      }
      else {
        console.log("BAD, MOTIV IS INCORRECT!")
        return res.status(422).json({
          errors: {
            error: 'Логин/пароль Motiv неверный',
          },
        })
      }
    }
  })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  // console.log(req.payload)
  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }
      return res.json({ user: user.toAuthJSON() });
    });
});

module.exports = router;
