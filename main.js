var readLine = require('readline-sync');
var preProcessInput = require('./pre_process.js');
var processInput = require('./process.js');
var _ = require('lodash')

var input;

while(input !== 'exit'){
	input = readLine.question('> ')
	var responses = processInput(preProcessInput(input))
	if(responses !== false && responses.length){
		_.each(responses, (response) =>{
			input = readLine.question(response.question + ' > ')
			if(isAffirmative(input)){
				processInput(response)
			}
		})
	}
}

function isAffirmative(input){
	return input.length && (input === 'yes' || input === 'y');
}
