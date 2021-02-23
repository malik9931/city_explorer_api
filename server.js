"use strict";
const express = require("express");
//CORS: Cross Origin Resource Sharing
const cors = require("cors");
const pg = require("pg");
//DOTENV (read our enviroment variable)
require("dotenv").config();
const superagent = require("superagent");
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

//Application Setup
const PORT = process.env.PORT || 3030;
const app = express();
app.use(cors()); // make it opened

// Routes Definitions
app.get("/", handleHomeRoute);
app.get("/location", locationHandler);
// app.get("/weather", weatherHandler);
// app.get('*',notFoundRouteHandler);
// app.use(errorHandler);

// handle any route
function handleHomeRoute(req, res) {
  res.status(200).send("you did a great job");
}

function checkLocationHandler(city) {
  let safeValue = [city];
  console.log("inside checkLocationHandler fun", SQL);

  //   if (SQL !== null) {
  return client
    .query(SQL, safeValue)
    .then((results) => {
      console.log("inside checkLocationHandler fun", results.rows);
      return results.rows;
    })
    .catch((error) => {
      res.send("pppppppppppp", error.message);
    });
  //   }
}

// location route
//request: localhost:3000/location
//http://localhost:3000/location?city=Lynnwood
function locationHandler(req, res) {
  const cityName = req.query.city;
  // let safeValue = [cityName];
  let SQL = `SELECT search_query FROM locations WHERE search_query=${cityName};`;
  console.log("hiiiiiiiiiiii");
  let result = client.query(SQL, cityName);
  //   client.query(SQL, cityName)
  //   .then((result) => {
  if (result == null) {
    console.log("this is IF");
    res.send(result);
  } else {
    console.log("this is  else");
    getLocationApi(req, res);
  }
  //   });

  //   console.log('this is SQL',SQL);
  //   checkLocationHandler(cityName)
  //   .then((result) => {
  //       console.log('hhhhhhhhhhhhh');
  //     if (result.length > 0) {
  //       res.send(result);
  //     } else {
  //         getLocationApi(result);
  //     }
  //   });
}

function getLocationApi(req, res) {
  //   https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json
  // console.log(req.query);
  let cityName = req.query.city;
  let key = process.env.GEOCODE_API_KEY;
  let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;

  superagent
    .get(url)
    .then((locData) => {
      // console.log(locData);
      const locationData = new Location(cityName, locData.body[0]);
      console.log(locationData);
      res.send(locationData);
      let SQL = `INSERT INTO locations VALUES $1 RETURNING *;`;
      let safeValues = [locationData];
      client
        .query(SQL, safeValues)
        .then((result) => {
          console.log("inside insert");
          res.send(result.rows);
          // res.send('data has been inserted!!');
        })
        .catch((error) => {
          res.send("error in inserting data to the dataBase", error.message);
        });
    })
    .catch(() => {
      errorHandler("Error in getting data from locationiq", req, res);
    });
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

// weather route

// https://api.weatherbit.io/v2.0/forecast/daily?&lat=38.123&lon=-78.543&key=${weatherKey}
//request: localhost:3000/weather
// let weathObjects = [];
function weatherHandler(req, res) {
  console.log(req.query);
  const long = req.query.longitude;
  const lat = req.query.latitude;
  //   console.log(cityName);

  let weatherKey = process.env.WEATHER_API_KEY;
  // let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${long}&key=${weatherKey}`;

  let url = `https://api.weatherbit.io/v2.0/forecast/daily?&city=Raleigh,NC&key=${weatherKey}`;
  superagent
    .get(url)
    .then((weathData) => {
      // console.log(locData);
      const weatherData = new Weather(cityName, weathData.body[0]);
      res.send(weatherData);
    })
    .catch(() => {
      errorHandler("Error in getting data from weatherBit", req, res);
    });
}

function Weather(forcastData, index) {
  this.forecast = forcastData.weather.description;
  this.time = new Date(forcastData.valid_date);
  console.log(this.time);
  console.log(this.forecast);
  // console.log(this.time);

  // weathObjects.push(this);
}

// localhost:3000/ssss
// app.use("*", (req, res) => {
//   res.status(500).send("Sorry, something went wrong");
// });

function errorHandler(error, req, res) {
  res.status(500).send(error);
}

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
