var express = require('express'),
app = express()

require('dotenv').config();

port = process.env.PORT || 3000;
bodyParser = require('body-parser');


var cors = require('cors');
app.use(cors());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var routes = require('./config/routes/api'); //importing route
routes(app); //register the route

app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'})
}) 

app.listen(port);

console.log('RESTful API server started on: ' + port);