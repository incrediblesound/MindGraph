var Knowledge = require('./knowledge.js')
var _ = require('lodash')
var readLine = require('readline-sync');
var fs = require('fs');

const SUBTYPE = 'SUBTYPE_OF'
const ATTR = 'HAS_ATTRIBUTE'
const THING = 'thing'


var k = new Knowledge();
k.addItem(THING)

var processMap = {
	entry: processEntry,
	adj: processAdjective,
	attr: processAttribute,
	keyword: processKeyword,
	isXaY: processSubtypeQuestion
}

module.exports = function(input){
return processMap[input.type](input)

}

function processEntry(data){
	var parent = k.getItem(data.parent)
	var subtype = k.getItem(data.subtype)
	if(parent === false){
		parent = k.addItem(data.parent)
	}
	if(subtype === false){
		subtype = k.addItem(data.subtype)
	}
	k.addEdge(subtype.id, parent.id, SUBTYPE)
	return false
}

function processAdjective(data){
	var adj = k.getItem(data.name)
	if(adj === false){
		adj = k.addItem(data.name)
	}
	var src = k.getItem(THING)
	k.addEdge(src.id, adj.id, ATTR)
	return false
}

function processAttribute(data){
	var attribute = k.getItem(data.attribute)
	var item = k.getItem(data.item)
	if(attribute === false){
		attribute = k.addItem(data.attribute)
	}
	if(item === false){
		item = k.addItem(data.item)
	}
	k.addEdge(item.id, attribute.id, ATTR)
	var parents = k.getParents(item.id)
	if(parents.length){
		var responses = [];
		_.each(parents, (parent) => {
			if(!k.hasEdge(parent, attribute, ATTR)){
				responses.push({
					question: 'Does '+parent.name+' also have attribute '+attribute.name+'?',
					type: 'attr',
					item: parent.id,
					attribute: attribute.id
				})
			}
		})
		return responses
	}
	return false;
}

function processSubtypeQuestion(data){
	var subtype = k.getItem(data.subtype) || k.addItem(data.subtype)
	var parent =  k.getItem(data.parent)  || k.addItem(data.parent)
	var result = k.hasEdge(subtype.id, parent.id, SUBTYPE)
	if(result){
		console.log('Yes, '+data.subtype+' is a kind of '+data.parent+'.')
		return false
	} else {
		return [{
			question: 'No, should I store '+data.subtype+' as a kind of '+data.parent+'?',
			type: 'entry',
			subtype: data.subtype,
			parent: data.parent
		}]
	}
}

function processKeyword(data){
	if(data.value === 'json'){
		console.log(JSON.stringify(k))
	}
	else if(data.value === 'save'){
		var fileName = readLine.question('What do you want to name the graph? > ')
		fs.writeFileSync(fileName+'.json', JSON.stringify(k));
		return false
	}
	else if(data.value === 'load'){
		var fileName = readLine.question('What is the name of the graph? > ')
		var text = fs.readFileSync(fileName+'.json').toString();
		k.fromJSON(text);

		return false
	}
	return false
}