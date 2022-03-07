const pool = require('../db')

const controller = {
  reviews: {
    getReviews: async (req, res) => {
      var { product_id } = req.query
      var page = req.query.page || 1;
      var count = req.query.count || 5;
      var sort = req.query.sort || 'newest';

      if (sort === 'newest') {
        sort = `ORDER BY review_date ASC`
      }
      if (sort === 'helpful') {
        sort = `ORDER BY helpfulness DESC`
      }
      if (sort === 'relevant') {
        sort = `ORDER BY helpfulness DESC, review_date DESC`
      }
      try {
        const reviews = await pool.query(
          `SELECT
           json_build_object('review_id', reviews.review_id,
           'rating', reviews.rating,
           'summary', reviews.summary,
           'recommend', reviews.recommend,
           'response', reviews.response,
           'body', reviews.body,
           'date',
           TO_CHAR(TO_TIMESTAMP(CAST(reviews.review_date AS bigint)::double precision / 1000), 'DD-MM-YYYY"T"HH24:MI:SS.MS"Z"' ),
           'reviewer_name', reviews.reviewer_name,
           'helpfulness', reviews.helpfulness,
           'photos', (SELECT COALESCE(ARRAY_AGG(json_build_object('id', photo_id, 'url', url_tag)),'{}') AS photos FROM photos WHERE reviews.review_id = photos.review_id)
           )
          FROM reviews WHERE product_id = $1 AND reviews.reported = false
          GROUP BY product_id, reviews.review_id, reviews.rating,
          reviews.summary, reviews.recommend, reviews.response, reviews.body,
          reviews.review_date, reviews.reviewer_name, reviews.helpfulness
          ${sort} LIMIT $2 OFFSET ${count * page - count};
          `, [product_id, count])

          var response = {
            product: product_id,
            page: page,
            count: count,
            results: reviews.rows.map(row => {
              return row.json_build_object
            })
          }
          console.log(reviews)
        res.status(200).send(response)
      }
      catch (err) {
        res.status(400).send(`ERROR: GET request for Reviews`, err)
      }
    },

    addReview: async (req,res) => {
      var currentDate = Math.round((new Date()).getTime() / 1000)
      var {product_id, rating, summary, body, recommend, reviewer_name, reviewer_email, photos, characteristics} = req.body
      try {
        var add = await pool.query(
          `INSERT INTO reviews
          (product_id, rating, review_date, summary, body, recommend, reviewer_name, reviewer_email)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING review_id, rating`
        ,[product_id, rating, currentDate, summary, body, recommend, reviewer_name, reviewer_email])
          .then(async ({rows}) => {
            var rating = rows[0].rating
            var review_id = rows[0].review_id;
            if (photos.length > 0 ) {
              await photos.forEach(url_tag => {
                pool.query(
                `INSERT INTO photos
                  (review_id, url_tag)
                  VALUES($1, $2) RETURNING *;`, [review_id, url_tag])
              })
            }
            for (var [id, rating] of Object.entries(characteristics)) {
              await pool.query(
                `INSERT INTO meta_data
                (char_id, review_id, data_value)
                VALUES ($1, $2, $3)`, [id, review_id, rating])
            }
            res.status(200).send('SUCCESS POSTING')
          })
      }
      catch (err) {
        res.status(400).send(err)
      }
    },

    getMetaData: async (req, res) => {
      var { product_id } = req.query
      try {
        const meta = await pool.query(
         `SELECT reviews.product_id,
                   (SELECT jsonb_object_agg(rating, (SELECT count(reviews.rating)  from reviews WHERE product_id = $1 )  )) AS rating,
                   (SELECT (json_build_object(0, count(recommend))) AS recommend)
                   FROM reviews
                   INNER JOIN characteristics ON characteristics.review_id = reviews.review_id
                   INNER JOIN meta_data ON meta_data.review_id = reviews.review_id
                   WHERE reviews.product_id = $1
            GROUP BY reviews.product_id;`
        ,[product_id])

        res.status(200).send(meta.rows)
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