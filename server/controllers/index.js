const pool = require('../db')

const controller = {
  reviews: {
    getReviews: async (req, res) => {
      var { product_id, page, count } = req.query
      page ? page : 1;
      count ? count : 5;
      try {
        const reviews = await pool.query(
          `SELECT product_id AS product,
            (SELECT json_agg(json_build_object('review_id', review_id, 'rating', rating, 'summary', summary,
                                    'recommend', recommend, 'response', response, 'body', body,
                                    'date', review_date, 'reviewer_name', reviewer_name, 'helpfulness', helpfulness
                                    ))
                                      AS results FROM reviews WHERE product_id = $1)
          FROM reviews WHERE product_id = $1`
          , [product_id])
        // console.log(reviews.rows[0])
        res.status(200).send(reviews.rows[0])
      }
      catch (err) {
        res.status(400).send(`ERROR: GET request for Reviews`, err)
      }
    },



    getMetaData: async (req, res) => {
      var { product_id } = req.query
      try {
        //INSERT CODE
      }
      catch (err) {
        //INSERT CODE
      }
    },



    helpfulReview: async (req, res) => {
      const { review_id } = req.params;
      try {
        const helpful = await pool.query
        (`
          UPDATE reviews SET helpfulness = CAST(helpfulness AS integer) + 1 WHERE review_id = $1
        `,[review_id]
        )
        res.status(204).send(helpful.rows[0])
      }
      catch (err) {
        res.status(400).send(`ERROR: PUT request for Helpful Reviews`, err)
      }
    },


    reportReview: async (req, res) => {
      const { review_id } = req.params;
      try {
        const reporter = await pool.query(
        `
          UPDATE reviews SET reported = true WHERE review_id = $1
        `,[review_id])
        res.status(204).send(reporter.rows[0])
      }
      catch (err) {
        res.status(400).send('ERROR REPORTING REVIEW')
      }
    }
  }
}
module.exports = controller;

// SELECT photo_id, url_tag FROM photos INNER JOIN reviews ON reviews.review_id = photos.review_id
// (SELECT json_agg(json_build_object('id', photo_id, 'url', url_tag)) AS photos FROM photos INNER JOIN reviews ON reviews.review_id = photos.review_id)