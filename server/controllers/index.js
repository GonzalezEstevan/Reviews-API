const pool = require('../db')

const controller = {
  reviews: {
    getReviews: async (req, res) => {
      var { product_id, page, count } = req.query
      page ? page : 1;
      count ? count : 5;
      try {
        const reviews = await pool.query(
          `SELECT product_id,
            ARRAY_AGG(json_build_object('review_id', review_id,
           'rating', rating,
           'summary', summary,
           'recommend', recommend,
           'response', response,
           'body', body,
           'date', review_date,
           'reviewer_name', reviewer_name,
           'helpfulness', helpfulness,
           'photos', (SELECT COALESCE(ARRAY_AGG(json_build_object('id', photo_id, 'url', url_tag)),'{}') AS photos FROM photos WHERE reviews.review_id = photos.review_id)
           )) AS results
          FROM reviews WHERE product_id = $1
          GROUP BY product_id
          `, [product_id])
        res.status(200).send(reviews.rows)
      }
      catch (err) {
        res.status(400).send(`ERROR: GET request for Reviews`, err)
      }
    },

    addReview: async (req,res) => {
      const {product_id, rating, summary, body, recommend, name, email, photos, characteristics} = req.body
      try {
        const add = await pool.query(
          `INSERT INTO reviews (product_id, rating, summary, body, recommend, name, email, photos, characteristics) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
        ,[product_id, rating, summary, body, recommend, name, email, photos, characteristics])
        res.status(201).send(add.rows[0])
      }
      catch (err) {
        res.status(400).send('ERROR POSTING REVIEW')
      }
    },

    getMetaData: async (req, res) => {
      var { product_id } = req.query
      try {
        const meta = await pool.query(
         `SELECT reviews.product_id,
                   (SELECT jsonb_object_agg(rating, rating)) AS rating,
                   (SELECT (json_build_object(count(*) - 1, count(*))) AS recommend)
                   FROM reviews
                   INNER JOIN characteristics ON characteristics.review_id = reviews.review_id
                   WHERE reviews.product_id = $1
            GROUP BY reviews.product_id;`
        ,[product_id])

        res.status(200).send(meta.rows[0])
      }
      catch (err) {
        res.status(400).send('ERROR FETCHING META DATA')
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

// SELECT product_id,
//           (SELECT json_object_agg(rating, count(*))) AS ratings,
//           (SELECT json_build_object(count(*) - 1, count(*))) AS recommend
//           FROM reviews WHERE product_id = $1;


// `SELECT reviews.product_id,
//           (SELECT (json_build_object(rating, count(*))) AS rating),
//           (SELECT (json_build_object(count(*) - 1, count(*))) AS recommend)
//           FROM reviews
//           INNER JOIN characteristics ON characteristics.review_id = reviews.review_id
//           WHERE reviews.product_id = $1;`