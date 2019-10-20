const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../auth');

const Rates = mongoose.model('Rates')

//All rates
router.get('/', auth.required, async (req, res, next) => {
  const { payload: { id } } = req;

  const allRates = await Rates.find({})
    .then((rates) => {
      console.log(rates)
      return rates
    })

  return res.json(allRates)
})


router.post('/', auth.required, async (req, res, next) => {
  const jsonReq = req.body
  console.log(jsonReq)

  const RateExample ={
    title: jsonReq.title,
    slug: jsonReq.slug,
  }
  // await Rates.deleteOne({"_id":"5dab46241e47b3442ef5e011"})
  const finalRate = new Rates(RateExample);
  await finalRate.save()

  const allRates = await Rates.find({})
    .then((rates) => {
      console.log(rates)
      return rates
    })
  return res.json(allRates)
})

module.exports = router;
