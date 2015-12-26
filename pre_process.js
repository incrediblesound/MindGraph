var n = require('natural')
var _ = require('lodash')
var inflector = new n.NounInflector()
var singular = _.bind(inflector.singularize, inflector);


module.exports = function(input){
	input = input.toLowerCase().split(' ')
	if(input.length === 1){
		return { type: 'keyword', value: input[0] }
	}
	else if(askIfXisY(input)){
		var subTypeIndex = aOrAn(input[1]) ? 2 : 1
		var subtype = singular(input[subTypeIndex])
		var parent = singular(input[subTypeIndex+2])
		return {
			type: 'isXaY',
			subtype,
			parent
		}
	}
	else if(isASimpleDescription(input)){
		var item = singular(input[0])
		var attribute = singular(input[2])
		return { type: 'attr', item, attribute }		
	}
	else if(isADefinition(input)){
		var firstIndex = aOrAn(input[0]) ? 1 : 0;
		var subtype = singular(input[firstIndex  ])
		var parent =  singular(input[firstIndex+3])

		return { type: 'entry', subtype, parent }
	}
	else if(isAnAdjective(input)){
		return { type: 'adj', name: input[3] }
	}
}

function isASimpleDescription(line){
	// god is fake
	// apples have seeds
	// apples are sweet
	return (
		line.length === 3 && 
		(isOrAre(line[1]) || hasOrHave(line[1]))
	)
}

function isADefinition(line){
	// a god is a myth || god is a myth
	return ((
		aOrAn(line[0]) &&
		line[2] === 'is'&&
		aOrAn(line[3])  
	) || (
		line[1] === 'is'&&
		aOrAn(line[2])
	))
}

function askIfXisY(line){
	// is an apple an organism (?)
	return ((
		line[0] === 'is' &&
		aOrAn(line[1]) &&
		aOrAn(line[3])
		) || (
		line[0] === 'is' &&
		aOrAn(line[2])
		))
}

function isAnAdjective(line){
	return (
		line[0] === 'some'&&
		line[1] === 'things'&&
		line[2] === 'are'
	//  line[3] === adjective
	)
}

function aOrAn(word){
	return word === 'a' || word === 'an'
}

function isOrAre(word){
	return word === 'is' || word === 'are'
}

function hasOrHave(word){
	return word === 'has' || word === 'have'
}