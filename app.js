const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// create Redis client

let client = redis.createClient();

client.on('connect', function() {
    console.log('Connect to redis')
})

const port = 3000;
const app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));

// Search Page
app.get('/', function(req, res, next) {
    res.render('searchusers');

});

// Search Processing
app.post('/user/search', function(req, res, next) {
    let id = req.body.id
    client.hgetall(id, function(err, obj) {
        if(!obj) {
            res.render('searchusers', {
                error: 'user dose not exist'
            })
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            })
        }
    });
});

// add USER page
app.get('/user/add', function(req, res, next) {
    res.render('adduser')
});

app.post('/user/add', function(req, res, next) {
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let phone = req.body.phone;
    let email = req.body.email;
    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'phone', phone,
        'email', email,

    ], function(err, reply) {
        if(err) {
           console.log(err)
        } 
        console.log(reply);
        res.redirect('/')
    });
});

app.delete('/user/delete/:id', function(req, res, next) {
    client.del(req.params.id);
    res.redirect('/')
})

app.listen(port, function() {
    console.log('server start at ' + port)
})