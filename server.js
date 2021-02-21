'use strict';

const express = require('express');
require('dotenv').config();

//CORS: Cross Origin Resource Sharing
const cors = require('cors');


const server = express();
server.use(cors()); // make it opened


const PORT = process.env.PORT || 3030;



server.listen(PORT, ()=>{
    console.log(`Listening on PORT ${PORT}`);
})