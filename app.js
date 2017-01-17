/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var bodyParser = require('body-parser');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

//Bluemix dependencies
var LanguageTranslatorV2 = require('watson-developer-cloud/language-translator/v2');
var language_translator = new LanguageTranslatorV2({
  url: 'https://gateway.watsonplatform.net/language-translator/api',
  username: 'd006f106-ac74-47b9-a206-5cdd200c8321',
  password: 'EoZkv3NpSgnS'
});
//For generating webpages
var pug = require('pug');

// create a new express server
var app = express();
app.use(bodyParser.json());  // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));  // for parsing application/x-www-form-urlencoded

var indexPage = pug.compileFile('public/index.pug');

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


app.get('/', function (request, response) {
	console.log("Received request for webpage"); 
	response.writeHead(200, {'Content-Type': 'text/html'});
  response.write(indexPage({trans: ''}));
	response.end(); 
});

app.post('/', function (req, res) {
  console.log("Received request for translation of:" + req.body.input); 
  var output = ''; 
  language_translator.translate({
  text: req.body.input, source : 'en', target: 'es' },
  function (err, translation) {
    if (err){
      console.log('Translation Error:', err); 
      output = err; 
    }
    else {
      output = translation.translations[0].translation;             
    } 
    console.log("Response from Bluemix Translation Service:" + output); 
    res.writeHead(200, {'Content-Type': 'text/html'}); 	
    res.write(indexPage({trans: output}));
  	res.end(); 
  }); 
});
// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
