-- Reviews
CREATE TABLE reviews(
  review_id int not null SERIAL primary key,
  product_id int not null unique, summary varchar(255) not null,
  body text not null,
  reviewer_name varchar(255) not null,
  reviewer_email varchar(255) not null,
  review_date int not null,
  helpfulness boolean,
  reported boolean,
  recommend boolean,
  response text null

)

-- Photos
CREATE TABLE photos(
  photo_id int not null serial primary key,
  url_tag text not null,
  review_id foreign key review_id references reviews(review_id),
  on delete cascade
)


-- Meta Data
CREATE TABLE meta_data(
  data_id int not null serial primary key,
  product_id foreign key references reviews(product_id),
  -- rating
)

-- Characteristics
CREATE TABLE characteristics()