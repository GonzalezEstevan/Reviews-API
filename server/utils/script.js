
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';
export const requests = new Counter('http_reqs');
export const options = {
  vus: 100,
  duration: '30s',
};
const randomNumber = (max, min) => (
  Math.floor(Math.random() * (max - 1 + min) + min)
);
var count = randomNumber(100000, 1);
const meta = `http://localhost:3000/api/reviews/meta?product_id=${count}`;
const getReviews = `http://localhost:3000/api/reviews?product_id=${count}`;
const updateHelpful = `http://localhost:3000/api/reviews/${count}/helpful`;
const updateReported = `http://localhost:3000/api/reviews/${count}/reported`;
const postReview = `http://localhost:3000/api/reviews`;

export default function () {
  var data = {
    "product_id": count,
    "rating": 7,
    "currentDate": "1591665989353",
    "summary": "Placeat quo soluta id illo et aspernatur dolores maiores est.",
    "recommend": true,
    "response": "null",
    "body": "Voluptates quaerat accusamus. Placeat dicta rerum pariatur voluptates non maiores neque velit. Et  aut quo in suscipit voluptas sequi molestiae. Debitis sunt quasi corrupti suscipit quod dolorum deserunt quod.",
    "reviewer_name": "STEVE",
    "reviewer_email": "estevan@estevan.com",
    "photos": [],
    "characteristics": {"14": 5}
  };
  const res = http.post(postReview, JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
  //const res = http.put(updateHelpful)
  // const res = http.get(updateReported);
  sleep(1);
  check(res, {
    'status was 200': (r) => r.status === 200,
    'transaction time < 200ms': (r) => r.timings.duration < 200,
    'transaction time < 500ms': (r) => r.timings.duration < 500,
    'transaction time < 1000ms': (r) => r.timings.duration < 1000,
    'transaction time < 2000ms': (r) => r.timings.duration < 2000,
  });
  count = randomNumber(100000, 1);
}