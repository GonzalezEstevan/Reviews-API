const pool = require('../db')

const controller = {
  reviews: {
    getReviews: (req, res) => {
      let { product_id } = req.query;
      let count = req.query.count || 5;
      let page = req.query.page || 1;
      let sort = req.query.sort || 'newest';

      if (sort === 'newest') {
        sort = 'ORDER BY review_date DESC';
      } else if (sort === 'helpful') {
        sort = 'ORDER BY helpfulness DESC';
      } else if (sort === 'relevant') {
        sort = 'ORDER BY helpfulness DESC, review_date DESC';
      }

      pool.query(
        `SELECT
          json_build_object(
            'review_id', reviews.review_id,
            'rating', reviews.rating,
            'summary', reviews.summary,
            'recommend', reviews.recommend,
            'response', reviews.response,
            'body', reviews.body,
            'date', TO_CHAR(TO_TIMESTAMP(CAST(reviews.review_date AS bigint)::double precision / 1000), 'DD-MM-YYYY"T"HH24:MI:SS.MS"Z"' ),
            'reviewer_name', reviews.reviewer_name,
            'helpfulness', reviews.helpfulness,
            'photos',
            (SELECT coalesce
              (array_agg
                (json_build_object(
                  'id', photos.photo_id,
                  'url', url_tag)),
                  '{}')
            AS photos FROM photos WHERE reviews.review_id = photos.review_id)
          )
        FROM reviews WHERE product_id = $1 AND reported = false ${sort} LIMIT $2 OFFSET ${count * page - count}`, [product_id, count])
        .then((result) => {
          let response = {
            product: product_id,
            page,
            count,
            results: result.rows.map(row => { return row.json_build_object })
          }
          res.status(200).send(response);
        })
        .catch((err) => res.status(400).send(err.message));
    },

    addReview: async (req,res) => {
      var currentDate = Math.round((new Date()).getTime() / 1000)
      var {product_id, rating, summary, body, recommend, reviewer_name, reviewer_email, photos, characteristics} = req.body
      const start = Date.now()
      try {
        var add = await pool.query(
          `INSERT INTO reviews
          (product_id, rating, review_date, summary, body, recommend, reviewer_name, reviewer_email)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING review_id, rating`
        ,[product_id, rating, currentDate, summary, body, recommend, reviewer_name, reviewer_email])
          .then(async (rows) => {

            var rating = rows.rows[0].rating
            var review_id = rows.rows[0].review_id;
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
            const duration = Date.now() - start;
            console.log("Executed Query", {duration, rowCount: rows.rowCount})
            res.status(200).send('SUCCESS POSTING')
          })
      }
      catch (err) {
        res.status(400).send(err)
      }
    },

    getMetaData: async (req, res) => {
      var { product_id } = req.query
      const start = Date.now()
      try {
        const meta = await pool.query(
         ` SELECT reviews.product_id,
                   (SELECT json_build_object(
                     1, (SELECT count(*) filter (where rating = 1)),
                     2, (SELECT count(*) filter (where rating = 2)),
                     3, (SELECT count(*) filter (where rating = 3)),
                     4, (SELECT count(*) filter (where rating = 4)),
                     5, (SELECT count(*) filter (where rating = 5))
                    )) AS ratings,
                    (SELECT json_object_agg(prod_name,
                      json_build_object('id', characteristics.char_id,
                      'value', (SELECT CAST(avg(data_value) AS TEXT) FROM meta_data WHERE char_id = characteristics.char_id)))
                      AS characteristics FROM characteristics
                      JOIN meta_data ON characteristics.char_id = meta_data.data_id AND reviews.product_id = characteristics.product_id)
                   FROM reviews
                   WHERE reviews.product_id = $1
            GROUP BY reviews.product_id;`
        ,[product_id])
        const duration = Date.now() - start;
        console.log("Executed Query", {duration, rowCount: meta.rowCount})
        res.status(200).send(meta.rows)
      }
      catch (err) {
        res.status(400).send(err.message)
      }
    },


    helpfulReview: async (req, res) => {
      const { review_id } = req.params;
      const start = Date.now()
      try {
        const helpful = await pool.query
        (`
          UPDATE reviews SET helpfulness = CAST(helpfulness AS integer) + 1 WHERE review_id = $1
        `,[review_id]
        )
        const duration = Date.now() - start;
        console.log("Executed Query", {duration, rowCount: helpful.rowCount})
        res.status(200).send(helpful.rows[0])
      }
      catch (err) {
        res.status(400).send(err.message)
      }
    },


    reportReview: async (req, res) => {
      const { review_id } = req.params;
      const start = Date.now()
      try {
        const reporter = await pool.query(
        `
          UPDATE reviews SET reported = true WHERE review_id = $1
        `,[review_id])
        const duration = Date.now() - start;
        console.log("Executed Query", {duration, rowCount: reporter.rowCount})
        res.status(200).send('yah')
      }
      catch (err) {
        res.status(400).send(err.message)
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


// jsonb_object_agg(
//   prod_name, (SELECT jsonb_object_agg('id', char_id) from characteristics ) )AS characteristics FROM characteristics
//   INNER JOIN reviews
//   ON characteristics.char_id = reviews.review_id WHERE reviews.product_id = $1)

// (
//   SELECT array_to_json(array_agg(allChar))
//   FROM (
//     SELECT characteristics.char_id
//     FROM characteristics
//     INNER JOIN meta_data
//     ON characteristics.char_id = meta_data.char_id
//     WHERE characteristics.product_id = reviews.product_id
//     GROUP BY characteristics.char_id
//   ) allChar
// )



// (
//   (SELECT json_build_object(array_agg(allChar))
//   FROM (
//     SELECT c.char_id AS id
//     FROM characteristics c
//     WHERE c.product_id = reviews.product_id
//     GROUP BY c.char_id
//   ) allChar
// )) AS characteristics


// (SELECT json_object_agg(prod_name,
//   (
//     (SELECT array_to_json(array_agg(allChar))
//     FROM (
//       SELECT c.char_id AS id
//       FROM characteristics c
//       LEFT JOIN meta_data ON c.char_id = meta_data.data_id
//       WHERE c.product_id = reviews.product_id AND meta_data.data_id = c.char_id
//       GROUP BY c.char_id LIMIT 1
//     ) allChar
//   ))
//   )
// AS characteristics FROM characteristics WHERE product_id = $1)



// getReviews: async (req, res) => {
//   var { product_id } = req.query
//   var page = req.query.page || 1;
//   var count = req.query.count || 5;
//   var sort = req.query.sort || 'newest';
//   const start = Date.now()

//   if (sort === 'newest') {
//     sort = `ORDER BY review_date ASC`
//   }
//   if (sort === 'helpful') {
//     sort = `ORDER BY helpfulness DESC`
//   }
//   if (sort === 'relevant') {
//     sort = `ORDER BY helpfulness DESC, review_date DESC`
//   }
//   try {
//     const reviews = await pool.query(
//       `SELECT
//        json_build_object('review_id', reviews.review_id,
//        'rating', reviews.rating,
//        'summary', reviews.summary,
//        'recommend', reviews.recommend,
//        'response', reviews.response,
//        'body', reviews.body,
//        'date',
//        TO_CHAR(TO_TIMESTAMP(CAST(reviews.review_date AS bigint)::double precision / 1000), 'DD-MM-YYYY"T"HH24:MI:SS.MS"Z"' ),
//        'reviewer_name', reviews.reviewer_name,
//        'helpfulness', reviews.helpfulness,
//        'photos', (SELECT COALESCE(ARRAY_AGG(json_build_object('id', photo_id, 'url', url_tag)),'{}') AS photos FROM photos WHERE reviews.review_id = photos.review_id)
//        )
//       FROM reviews WHERE product_id = $1 AND reviews.reported = false
//       GROUP BY product_id, reviews.review_id, reviews.rating,
//       reviews.summary, reviews.recommend, reviews.response, reviews.body,
//       reviews.review_date, reviews.reviewer_name, reviews.helpfulness
//       ${sort} LIMIT $2 OFFSET ${count * page - count};
//       `, [product_id, count])
//       const duration = Date.now() - start;
//       var response = {
//         product: product_id,
//         page: page,
//         count: count,
//         results: reviews.rows.map(row => {
//           return row.json_build_object
//         })
//       }
//         console.log("Executed Query", {duration, rowCount: reviews.rowCount})
//     res.status(200).send(response)
//   }
//   catch (err) {
//     res.status(400).send(err.message)
//   }
// },