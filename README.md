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
* [Data Shape](#overview-of-data-shape)

# Testing
* Testing Locally
   ![ScreenShot](/screenshots/Screen%20Shot%202022-03-11%20at%205.09.09%20PM.png)

* Testing EC2 w/LoaderIO
    ![ScreenShot](/screenshots/Screen%20Shot%202022-03-14%20at%204.59.50%20PM.png)

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
2. In your browser, go to API:
```
http://localhost:3000
```

# Overview Of Data Shape
* Reviews Endpoint
   `Get /reviews`
   Returns a list of reviews for a particular product

    Parameters

    | Parameter | Type    | Description                                               |
    | --------- | ------- | --------------------------------------------------------- |
    | page      | integer | Selects the page of results to return.  Default 1.        |
    | count     | integer | Specifies how many results per page to return. Default 5. |
    | sort      | text    | 	Changes the sort order of reviews to be based on        |
    |           |         | "newest",  "helpful", or "relevant"                       |
    |product_id | integer | Specifies the product for which to retrieve reviews.      |

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
   Returns review metadata for a given product.

   Parameters

    | Parameter | Type    | Description                                               |
    | --------- | ------- | --------------------------------------------------------- |
    |product_id	| integer |Required ID of the product for which data should be
    |           |         | returned                                                   |

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

