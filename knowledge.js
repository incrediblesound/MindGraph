'use strict';

var _ = require('lodash')

class Item {
	constructor(name, id){
		this.name = name
		this.id = id
	}
}

class Edge {
	constructor(src, tgt, type){
		this.source = src
		this.target = tgt
		this.type = type
	}
	isSubtype(){
		return this.type === 'SUBTYPE_OF'
	}
}

module.exports = class KnowledgeBase {
	constructor(){
		this.items = []
		this.edges = []
		this.counter = 0
	}
	fromJSON(string){
		var data = JSON.parse(string)
		this.items = data.items
		this.edges = data.edges
		this.counter = data.counter
	}
	addItem(name){
		var id = this.counter
		var item = new Item(name, id)
		this.items.push(item)
		this.counter++
		return item
	}
	addEdge(source, target, type){
		var edge = new Edge(source, target, type)
		this.edges.push(edge)
	}
	getItem(id){
		var match;
		if(typeof id === 'number'){
			match = (item) => item.id === id
		} else {
			match = (item) => item.name === id
		}
		for(var i = 0; i < this.counter; i++){
			var item = this.items[i]
			if(match(item)){
				return item
			}
		}
		return false
	}
	getParents(id){
		var results = []
		_.each(this.edges, (edge) => {
			if(edge.source === id && edge.isSubtype()){
				results.push(this.getItem(edge.target));
			}
		})
		return results;
	}
	hasEdge(source, target, type){
		var edge;
		for(var i = 0; i < this.edges.length; i++){
			edge = this.edges[i];
			if(edge.type === type &&
			   edge.source === source &&
			   edge.target === target){
				return true;
			}
		}
		return false
	}
}

