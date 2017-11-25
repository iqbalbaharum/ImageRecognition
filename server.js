const express = require('express');
const fileUpload = require('express-fileupload');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cv = require('opencv4nodejs');
const mime = require('mime-to-extensions');
const fs = require('fs');
const mongoose = require('mongoose');
const opn = require('opn');

var Marker = require('./app/models/marker');

var port = 8080;

var app = express();

// file upload
app.use(fileUpload());

// database folder
const dbImages = fs.readdirSync('./database');

app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

// database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/cmf', {
  useMongoClient: true
});


app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');

app.get('/admin', function(req, res) {

  Marker.find({}, function(err, markers) {
    if(err)
      res.send(err);

    res.render('admin', {
      markers: markers
    });
  });

});

app.get('/addmarker', function(req, res) {
  res.render('addMarker');
});

app.get('/find', function(req, res) {
    res.render('find');
});

app.post('/upload', function(req, res) {

    if(!req.files)
      return res.status(400).send('No files uploaded.');

    let uploadedFile = req.files.uploadedFile;

    let timestamp = new Date().valueOf();
    let fileWithExt = timestamp + "." + mime.extension(uploadedFile.mimetype);
    var targetPath = './database/' + fileWithExt;

    uploadedFile.mv(targetPath, function(err) {

      if(err) {
          return res.status(500).send(err);
      }

      var newMarker = new Marker({
        image: fileWithExt,
        action: req.body.action
      });

      newMarker.save(function(err, marker) {
        if (err) {
          res.status(500).send(err);
        } else {

          Marker.find({}, function(err, markers) {
            if(err)
              res.send(err);

            res.render('admin', {
              markers: markers
            });
          });
        }
      });

    });
});

app.post('/find', function(req, res) {

  if(!req.files)
    return res.status(400).send('No files uploaded.');

  let uploadedFile = req.files.uploadedFile;

  let timestamp = new Date().valueOf();

  var targetPath = './temp/' + timestamp + "." + mime.extension(uploadedFile.mimetype);

  uploadedFile.mv(targetPath, function(err) {

    if(err) {
      return res.status(500).send(err);
    }

    const cvImgBGR = cv.imread(targetPath);
    const cvImg = cvImgBGR.bgrToGray();

    const detector = new cv.ORBDetector();
    const keyPoints = detector.detect(cvImg);
    const descriptors = detector.compute(cvImg, keyPoints);

    const bestN = 10;

    // console.log("Total images: " + dbImages.length);

    var mostAccurateFile;

    // search db
    dbImages.forEach(file => {

      const cvImg2BGR = cv.imread('./database/' + file);
      const cvImg2 = cvImg2BGR.bgrToGray();

      const keyPoints2 = detector.detect(cvImg2);
      const descriptors2 = detector.compute(cvImg2, keyPoints2);

      const matches = cv.matchBruteForceHamming(descriptors, descriptors2);

      const bestMatches = matches.sort(
        (match1, match2) => match1.distance - match2.distance
      ).slice(0, bestN);

      // compare
      var train = 0;
      var distance = 0;

      var trainAvg = 0;
      var distanceAvg = 0;
      bestMatches.forEach(function(match) {
          train += match.trainIdx;
          distance += match.distance;
      });

      console.log(bestMatches);

      trainAvg = train/bestMatches.length;
      distanceAvg = distance/bestMatches.length;

      console.log(file + ": " + distanceAvg + "/" + trainAvg);

      if(mostAccurateFile) {

        if(distanceAvg < mostAccurateFile.distance) {
          mostAccurateFile = {file: file, distance: distanceAvg, train: trainAvg};
        }

      } else {

        if(distanceAvg < 50) {
          mostAccurateFile = {file: file, distance: distanceAvg, train: trainAvg};
        }

      }
    });

    if(mostAccurateFile) {
      Marker.findOne(
        {image: mostAccurateFile.file},
        function(err, marker) {
          if(err)
            res.send(err);

          // res.json(marker);
          opn(marker.action);
        }
      );
    } else {

      res.json({"status" : "No match found"});
    }

    // delete file
    fs.unlink(targetPath, function() {
        // do nothing
    });

  });
});

app.listen(port, function() {
  console.log('Listening');
});
