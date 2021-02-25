"use strict";
let c = console;
require("dotenv").config();
// Application Dependencies
const express = require("express");
//CORS: Cross Origin Resource Sharing
const cors = require("cors");
const pg = require("pg");
//DOTENV (read our enviroment variable)
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
app.get("/weather", weatherHandler);
app.get("/parks", parksHandler);
app.get("*", notFoundRouteHandler);
app.use(errorHandler);

// handle any route
function handleHomeRoute(req, res) {
  res.status(200).send("you did a great job");
}

// -------------------------------------------LOCATION ------------------
function checkLocationDB(city) {
  let SQL = `SELECT * FROM locations WHERE search_query=$1;`;
  let safe = [city];
  return client.query(SQL, safe).then((result) => {
    // console.log("hsadkla");
    return result;
  });
}

//http://localhost:3000/location?city=Lynnwood
function locationHandler(req, res) {
  const cityName = req.query.city;
  // console.log("hii");
  checkLocationDB(cityName)
    .then((rowOfResult) => {
      // console.log(rowOfResult);
      if (rowOfResult.rowCount > 0) {
        res.json(rowOfResult.rows[0]);
      } else {
        // console.log("this is  else");
        getLocationApi(cityName, req, res).then((data) => {
          // console.log(data);
          res.json(data);
        });
      }
    })
    .catch(() => {
      errorHandler("Error in getting data from locationiq", req, res);
    });
}

function getLocationApi(cityName, req, res) {
  //   https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json
  // console.log(req.query);
  // let cityName = req.query.city;
  let key = process.env.GEOCODE_API_KEY;
  let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;

  return superagent.get(url).then((locData) => {
    // console.log(locData);
    const locationData = new Location(cityName, locData.body[0]);
    // console.log(locationData);
    res.json(locationData);
    // return locationData;
    let SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4) RETURNING *;`;
    let safeValues = [
      locationData.search_query,
      locationData.formatted_query,
      locationData.latitude,
      locationData.longitude,
    ];
    return client.query(SQL, safeValues).then((result) => {
      // console.log("inside insert");
      // res.send(result.rows);
      // res.send('data has been inserted!!');
      return result.rows;
    });
    // .catch((error) => {
    //   errorHandler("error in inserting data to the dataBase", req, res);
    // });
  });
  // .catch(() => {
  //   errorHandler("Error in getting data from locationiq", req, res);
  // });
}

//-------------------------------------------------WEATHER-----------------------------------------
// https://api.weatherbit.io/v2.0/forecast/daily?&lat=38.123&lon=-78.543&key=${weatherKey}
//request: localhost:3000/weather
// let weathObjects = [];
function weatherHandler(req, res) {
  const cityName = req.query.search_query;
  const long = req.query.longitude;
  const lat = req.query.latitude;

  let weatherKey = process.env.WEATHER_API_KEY;
  // let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${long}&key=${weatherKey}`;

  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&lat=${lat}lon=${long}&key=${weatherKey}`;
  // console.log("this is weather fun");
  superagent
    .get(url)
    .then((weathData) => {
      // console.log(weathData.body.lon);
      let weathArr = weathData.body.data.map((val) => new Weather(val));
      // console.log(weathArr);
      res.json(weathArr);
    })
    .catch(() => {
      errorHandler("Error in getting data from weatherBit", req, res);
    });
}

//---------------------------------------PARKS---------------------------------------

function parksHandler(req, res) {
  // console.log(req.query);
  let serchTerm = req.query.search_query;
  let parkKey = process.env.PARKS_API_KEY;
  let url = `https://developer.nps.gov/api/v1/parks?q=${serchTerm}&api_key=${parkKey}`;
  superagent
    .get(url)
    .then((parksData) => {
      // console.log(parksData.body.data);
      let parksArray = parksData.body.data.map((val) => new Park(val));
      res.json(parksArray);
    })
    .catch(() => {
      errorHandler("Error in getting data from weatherBit", req, res);
    });
}
function Park(parkData) {
  this.name = parkData.fullName;
  this.address = `"${parkData.addresses[0].line1}" "${parkData.addresses[0].city}" "${parkData.addresses[0].stateCode}" "${parkData.addresses[0].postalCode}"`;

  // console.log(this.address);
  this.fee = parkData.entranceFees[0].cost || "0.00";
  // console.log(parkData.entranceFees[0]);
  this.description = parkData.description;
  this.url = parkData.url;
}

// localhost: 3000 / ssss;
function notFoundRouteHandler(req, res) {
  res.status(500).send("Sorry, something went wrong");
}

function errorHandler(error, req, res) {
  res.status(404).send(error);
  // console.log("lkjas");
}
// Constructors
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function Weather(weatherData) {
  this.forecast = weatherData.weather.description;
  this.time = new Date(weatherData.valid_date).toString().slice(0, 15);
}

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
  });
});
