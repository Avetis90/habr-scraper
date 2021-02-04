const express = require('express');
const mongoose = require('mongoose');
const scrap = require('./scraper');

const app = express();
const {MONGODB} = require('./config.js');

mongoose
    .connect(MONGODB, {useNewUrlParser: true})
    .then(client => {
        console.log(`Database is connected !`);

        app.get('/companies', (req, res) => {
            scrap().then(response => {
                console.log(response,'response')
            })
            res.send('started')
        })
        app.listen(8088, () => {
            console.log(`Server is running`)
        })
    })
