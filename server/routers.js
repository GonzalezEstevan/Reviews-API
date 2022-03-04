const controller = require('./controllers/index.js')
var router = require('express').Router();


router.route('/reviews')
  .get(controller.reviews.getReviews)

router.route('/reviews/meta')
  .get(controller.reviews.getMetaData)

router.route('/reviews/:review_id/helpful')
  .put(controller.reviews.helpfulReview)

router.route('/reviews/:review_id/reported')
  .put(controller.reviews.reportReview)

module.exports = router;