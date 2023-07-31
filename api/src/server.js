// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

let path = require('path');
let embedToken = require(__dirname + '/embedConfigService.js');
const utils = require(__dirname + "/utils.js");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const db = require("../models");
const controller = require('../controller/auth.controller');
const app = express();
const secureRoute = require('../routes/secure-routes');

const passport = require('passport')
const session = require('express-session')


global.login = false;
global.role = 0;

app.use(cookieParser());

app.set('view-engine', 'ejs')

app.use(express.urlencoded({ extended: false }))

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

db.sequelize.sync({ alter: true });

app.use(session({
    secret: process.env.SESSION_SECRET || 'Test',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

// Prepare server for Bootstrap, jQuery and PowerBI files
/* app.use('/js', express.static('./node_modules/bootstrap/dist/js/')); // Redirect bootstrap JS */
/* app.use('/css', express.static('/node_modules/bootstrap/dist/css'))
app.use('/js', express.static('/node_modules/bootstrap/dist/js'))
app.use('/js', express.static('/node_modules/jquery/dist'))

app.use('/js', express.static('./node_modules/jquery/dist/')); // Redirect JS jQuery
app.use('/js', express.static('./node_modules/powerbi-client/dist/')) // Redirect JS PowerBI
app.use('/js', express.static('./node_modules/powerbi-report-authoring/dist/')) // Redirect JS PowerBIAuthoring
app.use('/css', express.static('./node_modules/bootstrap/dist/css/')); // Redirect CSS bootstrap
app.use('/public', express.static('./public/')); // Use custom JS and CSS files
 */


app.use('/js', express.static('/node_modules/bootstrap/dist/js'))
app.use('/js', express.static('/node_modules/jquery/dist'))

app.use('/js', express.static('/node_modules/jquery/dist/')); // Redirect JS jQuery
app.use('/js', express.static('/node_modules/powerbi-client/dist/')) // Redirect JS PowerBI
app.use('/js', express.static('/node_modules/powerbi-report-authoring/dist/')) // Redirect JS PowerBIAuthoring
//app.use('/css', express.static('/node_modules/bootstrap/dist/css/')); // Redirect CSS bootstrap
/* app.use('/css', express.static('/node_modules/bootstrap/dist/css')) */

app.use('/public', express.static(process.cwd() +'/../public')); // Use custom JS and CSS files
app.use('/images', express.static(process.cwd() +'/../public/images')); // Use custom JS and CSS files
app.use('/vendors', express.static(process.cwd() +'/../public/vendors'));
app.use('/css', express.static(process.cwd() +'/../public/css'));
app.use('/js', express.static(process.cwd() +'/../public/js'));

require('../routes/auth.routes')(app);

require('../routes/ocupation.routes')(app);

require('../routes/filters.routes')(app);

require('../routes/params.routes')(app);



app.get('/', checkNotAuthenticated, function (req, res) {
    res.sendFile(path.join(process.cwd() + '/../public/views/login.html'));
});

app.get('/login', checkNotAuthenticated, function (req, res) {
    res.sendFile(path.join(process.cwd() + '/../public/views/login.html'));
});

app.get('/register', checkNotAuthenticated, function (req, res) {
    res.sendFile(path.join(process.cwd() + '/../public/views/register.html'));
});

app.get('/recover', checkNotAuthenticated, function (req, res) {
    res.sendFile(path.join(process.cwd() + '/../public/views/recover.html'));
});

app.get('/password', checkAuthenticated, function (req, res) {
    res.sendFile(path.join(process.cwd() + '/../public/views/password.html'));
});

app.get('/dashboard', checkAuthenticated, function (req, res) {
    res.sendFile(path.join(process.cwd() + '/../public/views/index.html'));
});


app.get('/getEmbedToken', checkAuthenticated, async function (req, res) {

    // Validate whether all the required configurations are provided in config.json
    configCheckResult = utils.validateConfig();
    if (configCheckResult) {
        return res.status(400).send({
            "error": configCheckResult
        });
    }
    // Get the details like Embed URL, Access token and Expiry
    let result = await embedToken.getEmbedInfo();

    // result.status specified the statusCode that will be sent along with the result object
    res.status(result.status).send(result);
});


app.get('/logout', checkAuthenticated,function (req, res) {
        res.clearCookie('Role');
        this.login = false;
        req.session = null;
        return res.redirect('/login')

});


function checkAuthenticated(req, res, next) {
    //console.log(req.cookies.tk)
    if (req.cookies.tk) {
        return next()
    }
    res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
    //console.log(req.cookies.tk)
    if (req.cookies.tk) {
        return res.redirect('/dashboard')
    }
    next()
}

const port = process.env.PORT || 5300;

app.listen(port, () => console.log(`Listening on port ${port}`));




