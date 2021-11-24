const functions = require("firebase-functions");

//Before code we have to install google api (npm i googleapis)
//install express framework (npm install express --save)
//install request (npm install request)

//define the google api
var {google} = require('googleapis');
//define the message scope 
var MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
var SCOPES = [MESSAGING_SCOPE];

//using express framework
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();

var request = require('request');

// //so we can read title,body and token
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//make router send notification
router.post('/send',function(req, res){
    //get the value 
    getAccessToken().then(function(access_token){
      //define title,body and token 
      var title = req.body.title;
      var body = req.body.body;
      var token = req.body.token;

      request.post({ //send request post to server
        headers:{ //define header
            Authorization: 'Bearer' +access_token
        },
        //define url
        url: "https://fcm.googleapis.com/v1/projects/notification-bbf34/messages:send",
        //define body
        body: JSON.stringify(
          {
            "message": {
                "token": token,
                "notification": {
                    "body": body,
                    "title": title
              }
            }
          }
        )
      }, function(error, response, body){
          res.end(body);
          console.log(body);
        });
    }); 
});

app.use('/api', router);

//make function to get private token firebase
function getAccessToken(){
  //return promise 
    return new Promise(function(resolve, reject) {
      //get key from admin firebase 
        var key = require("./service-account.json");
        //define client email and provate key
        var jwtClient = new google.auth.JWT(
          key.client_email,
          null,
          key.private_key,
          SCOPES,
          null
        ); 
        //authorize client if it is error or get token
        jwtClient.authorize(function(err, tokens) {
          if (err) {
            //if there is error we reject and return error
            reject(err);
            return;
          }
          //if not get token
          resolve(tokens.access_token);
        });
      });
}

exports.api = functions.https.onRequest(app);
