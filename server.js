'use strict';

const express = require('express');
require('dotenv').config();

//CORS: Cross Origin Resource Sharing
const cors = require('cors');


const server = express();
server.use(cors()); // make it opened


const PORT = process.env.PORT || 3030;


// handle any route
server.listen(PORT, ()=>{
    console.log(`Listening on PORT ${PORT}`);
})


// location route
//request: localhost:3000/location
server.get('/location',(req,res)=>{
    const locData = require('./data/location.json');
    console.log(locData);
})
