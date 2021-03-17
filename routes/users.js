const express = require('express');
const router = express.Router();

const _ = require('lodash');
const bcrypt = require('bcrypt');

const auth = require('../middleware/auth');

const {User , userValidation} = require('../models/user');

router.post('/' , async (req, res) => {
    const {error} = userValidation(req.body);
    if (error) return res.status(400).send('Bad Request: ' + error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if (user) return res.status(400).send('User already registered!');
    
    user = new User(_.pick(req.body , ['name' , 'email']));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password , salt);

    await user.save();

    const token = user.generateAuthToken();

    res.header('x-auth-token' , token).send(_.pick(user , ['name' , 'email']));
});

router.get('/me' , auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

module.exports = router;