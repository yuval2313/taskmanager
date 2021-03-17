const mongoose = require ('mongoose');
const config = require('config');

module.exports = function () {
    const dbURL = config.get('dbURL');
    mongoose.connect( dbURL , { useUnifiedTopology: true , useNewUrlParser: true , useCreateIndex: true , useFindAndModify: false })
        .then(() => {
            console.log('Connected to ' + dbURL);
        }) 
}