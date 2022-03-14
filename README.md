# Reviews-API
## Overview
Creating a back end to deal with millions of rows of data consisting of complicated data shape
while optimizing to handle over 4000 request per second

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
   * Reviews being the main table that was referenced by other tables
   * Creating a join on Meta Data and Characteristics rather than using many aggregate functions, to lessen the strain of the Database cpu
   *  ![ScreenShot](/screenshots/Screen%20Shot%202022-03-02%20at%206.09.07%20PM.png)

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