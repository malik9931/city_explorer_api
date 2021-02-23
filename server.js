"use strict";

const express = require("express");

//CORS: Cross Origin Resource Sharing
const cors = require("cors");

//DOTENV (read our enviroment variable)
require("dotenv").config();
const superagent = require("superagent");

//Application Setup
const PORT = process.env.PORT || 3030;
const app = express();
app.use(cors()); // make it opened

// Routes Definitions
app.get("/", handleHomeRoute);
app.get("/location", locationHandler);
app.get("/weather", weatherHandler);
// app.get('*',notFoundRouteHandler);
// app.use(errorHandler);

// handle any route
function handleHomeRoute(req, res) {
  res.status(200).send("you did a great job");
}

// location route
//request: localhost:3000/location
//http://localhost:3000/location?city=Lynnwood
function locationHandler(req, res) {
  // console.log(req.query);
  const cityName = req.query.city;
  // console.log(cityName);

  // https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json

  let key = process.env.GEOCODE_API_KEY;
  let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;

  superagent
    .get(url)
    .then((locData) => {
      // console.log(locData);
      const locationData = new Location(cityName, locData.body[0]);
      res.send(locationData);
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
app.use("*", (req, res) => {
  res.status(500).send("Sorry, something went wrong");
});

function errorHandler(error, req, res) {
  res.status(500).send(error);
}

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
