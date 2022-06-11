require('dotenv/config');

var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.use(express.static("public"));

var multer = require('multer');

var imgModel = require('./model');

var fs = require('fs');
var path = require('path');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
  
app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_URL, err => {
        console.log('connected')
    });

    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname)
        }
    });
      
    var upload = multer({ storage: storage });

    app.get('/', function(req,res){
        res.render('newupload');
    });

    app.get('/new', (req, res) => {
        imgModel.find({}, (err, items) => {
            if (err) {
                console.log(err);
                res.status(500).send('An error occurred', err);
            }
            else {
                res.render('uploaded', { items: items });
            }
        });
    });

    app.post('/', upload.single('image'), (req, res, next) => {
  
        var obj = {
            name: req.body.name,
            desc: req.body.desc,
            img: {
                data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                contentType: 'image/png'
            }
        }
        imgModel.create(obj, (err, item) => {
            if (err) {
                console.log(err);
            }
            else {
                item.save();
                res.redirect('/new');
            }
        });
    });




    var port = process.env.PORT || '3000'
    app.listen(port, err => {
        if (err)
            throw err
        console.log('Server listening on port', port)
    })

