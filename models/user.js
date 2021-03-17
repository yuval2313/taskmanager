//Create User Schema + Joi validation 
//USE NPM 'joi-password-complexity' !!!
//USE Mongoose transactions!!

const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const config = require('config');

const Joi = require('joi');
const passwordComplexity = require("joi-password-complexity");

const complexityOptions = {
  min: 8,
  max: 50,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 0,
  requirementCount: 3,
};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true
    },
    email: {
        type: String,
        minlength: 3,
        maxlength: 50,
        unique: true,
        required: true
    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 1024,
        required: true
    },
    createDate: {
        type: Date,
        default: Date.now()
    }
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({_id: this._id , name: this.name} , config.get('jwtPrivateKey'));
    return token;
}

const User = mongoose.model('User' , userSchema);

function userValidation(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(3).max(50).email().required(),
        password: passwordComplexity(complexityOptions, 'Password'),
    });

    return schema.validate(user);
}

exports.User = User;
exports.userValidation = userValidation;