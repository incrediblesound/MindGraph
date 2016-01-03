var readLine = require('readline-sync');
var preProcessInput = require('./pre_process.js');
var chalk = require('chalk');
var _ = require('lodash')

var input, responses;

module.exports = function(queries){
	var processInput = require('./process.js');

	_.each(queries, (query) =>{
		input = readLine.question(query.question + ' > ')
		if(isAffirmative(query, input)){
			if(query.consumeInput !== undefined){
				query.consumeInput(input);
			}
			processInput(query)
		}
	})
}

function isAffirmative(query, input){
	if(query.test !== undefined){
		return query.test(input);
	} else {
		return input.length && input === 'yes' || input === 'y';
	}
}
