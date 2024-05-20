const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const app =  express();
const BaseRouter = require('./routes/base.router.js');

const port = 3000;
const mongo_uri = 'mongodb://localhost:27017/test';
const static_files = path.join(__dirname, '../static');
console.log(static_files);

// Middleware

app.use(session({
    secret: 'some_unique_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { save: true }
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(static_files));


// Set views to pages
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../pages'));

// Connection to database
console.log(`Connecting to ${mongo_uri}`);
mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connection Successful.')
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