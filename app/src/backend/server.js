const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app =  express();
const BaseRouter = require('./routes/base.router.js');

const port = 3000;
const mongo_uri = 'mongodb://localhost:27017'; 


// Set views to pages
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../pages'));

// Connection to database
console.log(`Connecting to ${mongo_uri}`);
mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connection Successful')
}).catch(err => {
    console.error(`Could not connect to Database\nError: ${err}`)
    process.exit();
});



// Using Router
app.use('/', BaseRouter);

// Start server
app.listen(port, () => {
    console.log(`Backend server started, listening at http://localhost:${port}`);
});