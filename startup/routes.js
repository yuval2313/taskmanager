const express = require('express');
require('express-async-errors');

const tasks = require('../routes/tasks');
const users = require('../routes/users');
const login = require('../routes/login');
const error = require('../middleware/error');

module.exports = function (app) {
    app.use(express.json());
    app.use('/api/tasks' , tasks);
    app.use('/api/users' , users);
    app.use('/api/login' , login);
    app.use(error);
}