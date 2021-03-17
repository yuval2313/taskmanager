const express = require('express');
const router = express.Router();

const Joi = require('joi');
const bcrypt = require('bcrypt');

const { User } = require('../models/user');

router.post('/' , async (req , res) => {
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send('Bad Request: ' + error.details[0].message);

    const user = await User.findOne({email: req.body.email });
    if(!user) return res.status(404).send('Invalid email or password!');

    const valid = await bcrypt.compare(req.body.password , user.password);
    if(!valid) return res.status(404).send('Invalid email or password!');

    const token = user.generateAuthToken();
    res.send(token);
});

loginValidation = function (user) {
    const schema = Joi.object({
        email: Joi.string().min(3).max(50).email().required(),
        password: Joi.string().min(8).max(50).required()
    });

    return schema.validate(user);
};

module.exports = router;