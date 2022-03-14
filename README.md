# Reviews-API
## Overview
Creating a back end to deal with millions of rows of data consisting of complicated data shape
while optimizing to handle over 4000 request per second

#Built by
* [Estevan Gonzalez](https://github.com/GonzalezEstevan)

* Optimized web performance using
  * Indexing
  * Caching
  * Horizontally scaling

* Testing:
  * k6
  * loaderIO

## Features
* [Testing](#testing)
* [Data Shape](#questions--answers-module)

# Testing
* Testing Locally
  * ![ScreenShot](/screenshots/Screen%20Shot%202022-03-11%20at%205.09.09%20PM.png)

* Testing EC2 w/LoaderIO
  *  ![ScreenShot](/screenshots/Screen%20Shot%202022-03-14%20at%209.25.21%20AM%201.png)

# Overview Of Tables/Schema
* Consited of four tables
   `Get /reviews`
    ```json
  {
  "product": "2",
  "page": 0,
  "count": 5,
  "results": [
    {
      "review_id": 5,
      "rating": 3,
      "summary": "I'm enjoying wearing these shades",
      "recommend": false,
      "response": null,
      "body": "Comfortable and practical.",
      "date": "2019-04-14T00:00:00.000Z",
      "reviewer_name": "shortandsweeet",
      "helpfulness": 5,
      "photos": [{
          "id": 1,
          "url": "urlplaceholder/review_5_photo_number_1.jpg"
        },
        {
          "id": 2,
          "url": "urlplaceholder/review_5_photo_number_2.jpg"
        },
        // ...
      ]
    },
    ```
  * Meta Data
   `Get /reviews/meta`
  ```json
  {
    "product_id": "2",
    "ratings": {
      2: 1,
      3: 1,
      4: 2,
      // ...
    },
    "recommended": {
      0: 5
      // ...
    },
    "characteristics": {
      "Size": {
        "id": 14,
        "value": "4.0000"
      },
      "Width": {
        "id": 15,
        "value": "3.5000"
      },
      "Comfort": {
        "id": 16,
        "value": "4.0000"
      },
      // ...
  }
```

## Installation
1. Git Fork and Clone this repo
2. Open up a new terminal and run the following command to install dependencies:
```
npm install
```
2. Create a copy of .envCopy replace name to .env
3. Replace empty string with youre correct database personal information

## Setup
1. In separate terminals, run the following commands to start server and build webpack bundle
```
npm run start
```
```
2. In your browser, go to API:
```
http://localhost:3000
```