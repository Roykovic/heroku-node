/**
 * Copyright 2017 Acuity BV. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var speech = 'empty speech';
var db = require('./db');
var auth = false;

const express = require('express');
const bodyParser = require('body-parser');
const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function(req, res) {
    console.log('hook request');
	if(req.body.result.metadata.intentName == "Default Welcome Intent" || req.body.result.action.includes("smalltalk.")){
		return wakeUp(req, res);
	}	 
	if(!auth){
		return returnJson(res, "Please login");
	}
    try {
		var fullName = req.body.result.parameters['sf-name']
		db.checkColumn(req.body.result.parameters['Variable_row'], function(column){				//check if the column exists in the db (to prevent exploits)
			db.query(column, fullName, function(result){											//Run 'query' function, and when finished run this function
			if(result && result.rows[0]){															//If there is a result
				var resultObject = result.rows[0]
				var keys = Object.keys(resultObject);
				var resultKey = keys[0]
				var answer = resultObject[resultKey];												//Get the first property present in the result.rows[0] object
				if(!answer){
					speech = "Sorry i could"+[[][[]]+[]][+[]][++[+[]][+[]]]+"'t find " + fullName + "\'s " + resultKey; 
				}
				else{
					speech =  fullName + "\'s " + resultKey + " is " + answer;
				}
				
				return returnJson(res, speech)
			};
					
			})	
		})
				
	} 
	catch (err) {
        console.error("Can't process request", err);
        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
})

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});

function returnJson(res, speech){
	return res.json({																				
						speech: speech,
						displayText: speech,
						source: 'apiai-webhook-sample'
					});
}

function wakeUp(req, res){
	if (req.body) {
		if (req.body.result) {
			speech = '';

			if (req.body.result.fulfillment) {
				speech += req.body.result.fulfillment.speech;
				speech += ' ';
			}
		}
	}
	return returnJson(res, speech);
}

