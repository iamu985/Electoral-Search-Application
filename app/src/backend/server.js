const express = require('express');
const path = require('path');
const app =  express();

const BaseRouter = require('./routes/base.router.js');
const port = 3000; 

// Set views to pages
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../pages'));



// app.get('/', (req, res) => {
//     console.log('Coming from the server side.')
//     res.render('enrollment')
// })


// Using Router
app.use('/', BaseRouter);

// Start server
app.listen(port, () => {
    console.log(`Backend server started, listening at http://localhost:${port}`);
});