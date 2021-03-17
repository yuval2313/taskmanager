const Joi = require('joi');
Joi.objectId = require('joi-objectid') (Joi); 

const express = require('express');
const app = express();

require('./startup/config')();
require('./startup/routes')(app);
require('./startup/db')();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`listening on port ${port}...`));

module.exports = server;