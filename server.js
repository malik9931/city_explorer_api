'use strict';

const express = require('express');
require('dotenv').config();

//CORS: Cross Origin Resource Sharing
const cors = require('cors');


const server = express();
server.use(cors()); // make it opened


const PORT = process.env.PORT || 3030;


// handle any route
server.get('/',(req,res)=>{
    res.send('home route');
})


// location route
//request: localhost:3000/location
server.get('/location',(req,res)=>{
    const locData = require('./data/location.json');
    const locObj = new Location(locData);
    console.log(locObj);
    res.send(locObj);
})

function Location(geoData){
    this.search_query = 'Lynnwood';
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}


// weather route
//request: localhost:3000/location
server.get('/weather',(req,res)=>{
    const wethData = require('./data/weather.json');
    const wethObj = new Weather(wethData);
    console.log(wethObj);
    console.log('webData',wethData);
    res.send(wethObj);
})

// function Weather(forcastData){
//     this.forecast = forcastData.data;
//     this.formatted_query = geoData[0].display_name;
//     this.latitude = geoData[0].lat;
//     this.longitude = geoData[0].lon;

//     [
//         {
//           "forecast": "Partly cloudy until afternoon.",
//           "time": "Mon Jan 01 2001"
//         },
//         {
//           "forecast": "Mostly cloudy in the morning.",
//           "time": "Tue Jan 02 2001"
//         },
//         ...
//       ]
// }



server.listen(PORT, ()=>{
    console.log(`Listening on PORT ${PORT}`);
})
