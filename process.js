var readLine = require('readline-sync');
var chalk = require('chalk');
var _ = require('lodash')
var Knowledge = require('./knowledge.js')
var fs = require('fs');
var prompter = require('./prompter.js');

const SUBTYPE = 'SUBTYPE_OF'
const ATTR = 'HAS_ATTRIBUTE'
const THING = 'thing'


var k = new Knowledge();
k.addItem(THING)

var processMap = {
	add: (data) => { k.addItem(data.item) },
	adj: processAdjective,
	attr: processAttribute,
	entry: processEntry,
	isXaY: processSubtypeQuestion,
	isXY: processSimpleQuestion,
	keyword: processKeyword,
	query: processQuery
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
	var parentAttributes = k.getAttributes(parent.id);
	var queries = _.map(parentAttributes, (attr) => {
		return {
			type: 'attr',
			item: subtype.name,
			attribute: attr.name,
			question: 'Does the subtype '+
				subtype.name+chalk.green(' share attribute ')+attr.name+' with parent?'
		}
	})
	prompter(queries);
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
		console.log(chalk.bold('Yes, '+data.subtype+' is a kind of '+data.parent+'.'))
		return false
	} else {
		return [{
			question: chalk.red('No')+', should I store '+data.subtype+' as a kind of '+data.parent+'?',
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
	else if(data.value === 'list'){
		var things = k.items.slice();
		things = _.map(things, (thing) => {
			return {
				thing,
				attributes: _.map(k.getAttributes(thing.id), (attr) => {
					return attr.name;
				})
			}
		})
		_.each(things, (item) => {
			var attributesText = !item.attributes.length ? '' : chalk.bold(' attributes')+': '+item.attributes.join(' / ')
			console.log(chalk.bold(item.thing.id) + ': ' + item.thing.name + attributesText);
		})
	}
	return false
}

function processQuery(data){
	var item = k.getItem(data.item);
	if(!item){
		prompter([
			{
				type: 'add',
				item: data.item,
				question: chalk.yellow('I don\'t know')+' what \"'+data.item+'\" is, should I store it?'
			}
		])
	}
	var parents = k.getParents(item.id);
	var attributes = k.getAttributes(item.id);
	var hasParents = !!parents.length;
	var hasAttributes = !!attributes.length;
	if(hasParents){
		parents = commaAnd(parents).join(' ');
		console.log(chalk.bold(data.item + ' is a kind of '+parents+'. '))
	}
	if(hasAttributes){
		attributes = commaAnd(attributes).join(' ');
		console.log(chalk.bold(data.item + ' has the attribute(s) '+attributes+'. '))
	}
	if(!hasParents && !hasAttributes){
		console.log(chalk.yellow('It appears I don\'t know')+' anything about '+data.item+'!');
		prompter([
			{
				type: 'attr',
				question: chalk.green('Enter an attribute')+' to add information about '+data.item+' or no/n to skip.',
				consumeInput: function(input){ this.attribute = input; },
				test: (input) => { return input !== 'no' && input !== 'n'; },
				item: data.item
			},
			{
				type: 'entry',
				question: chalk.green('Enter a parent class')+' to add information about '+data.item+' or no/n to skip.',
				consumeInput: function(input){ this.parent = input; },
				test: (input) => { return input !== 'no' && input !== 'n'; },
				subtype: data.item
			},
		])
	}
	return false;
}

function processSimpleQuestion(data){
	var item = k.getItem(data.item) || k.addItem(data.item)
	var attribute =  k.getItem(data.attribute)  || k.addItem(data.attribute)
	var result = k.hasEdge(item.id, attribute.id, ATTR)
	if(result){
		console.log(chalk.bold('Yes, '+data.item+' is '+data.attribute+'.'))
		return false
	} else {
		return [{
			question: chalk.red('No')+', should I store '+data.item+' as having attribute '+data.attribute+'?',
			type: 'attr',
			item: data.item,
			attribute: data.attribute
		}]
	}
}

function commaAnd(collection){
	return _.map(collection, (item, idx) => {
		var append = '';
		if(idx > 0){
			append += ', ';
		}
		if(idx === collection.length-1 && idx > 0){
			append += 'and ';
		}
		return append + item.name;
	})
}
