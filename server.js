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
    // console.log(locData);
    // console.log(locData[0]);
    // res.send(locData);
    const locObj = new Location(locData);
    console.log(locObj);
    res.send(locObj);
})

function Location(geoData){
    this.search_query = 'Lynnwood';
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;

    // {
    //     "search_query": "seattle",
    //     "formatted_query": "Seattle, WA, USA",
    //     "latitude": "47.606210",
    //     "longitude": "-122.332071"
    //   }

}



server.listen(PORT, ()=>{
    console.log(`Listening on PORT ${PORT}`);
})
