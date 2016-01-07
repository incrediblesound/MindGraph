'use strict';

var _ = require('lodash')

class Item {
	constructor(name, id){
		this.name = name
		this.id = id
	}
}

// china -[has attribute]-> state
// tang -[subtype of { via: China } ]-> state

class Edge {
	constructor(src, tgt, type, parent){
		this.source = src
		this.target = tgt
		this.type = type
		this.parents = []
		if(parent !== null){
			if(_.isArray(parent)){
				this.parents = parent;
			} else {
				this.parents.push(parent);
			}
		}
	}
	isSubtype(){
		return this.type === 'SUBTYPE_OF'
	}
	isAttribute(){
		return this.type === 'HAS_ATTRIBUTE'
	}
	addParent(id){
		if(!_.contains(this.parents, id)){
			this.parents.push(id);
		}
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
		this.items = _.map(data.items, (item) => {
			return new Item(item.name, item.id);
		})
		this.edges = _.map(data.edges, (edge) => {
			return new Edge(edge.source, edge.target, edge.type, edge.parents);
		})
		this.counter = data.counter
	}
	addItem(name){
		var id = this.counter
		var item = new Item(name, id)
		this.items.push(item)
		this.counter++
		return item
	}
	addEdge(source, target, parent, type){
		if(this.hasEdge(source, target, type)){
			if(parent !== null){
				let edge = this.getEdge(source, target, type);
				edge.addParent(parent);
			}
		} else {
			var edge = new Edge(source, target, type, parent)
			this.edges.push(edge)
		}
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
	getOrCreateItem(name){
		let item = this.getItem(name);
		if(item === false){
			item = this.addItem(name);
		}
		return item;
	}
	getParents(id){
		let results = []
		_.each(this.edges, (edge) => {
			if(edge.source === id && edge.isSubtype()){
				results.push(this.getItem(edge.target));
			}
		})
		return results;
	}
	getAttributes(id){
		let results = []
		_.each(this.edges, (edge) => {
			if(edge.source === id && edge.isAttribute()){
				results.push(this.getItem(edge.target));
			}
		})
		return results;
	}
	getEdge(source, target, type){
		var edge;
		for(var i = 0; i < this.edges.length; i++){
			edge = this.edges[i];
			if(edge.type === type &&
			   edge.source === source &&
			   edge.target === target){
				return edge;
			}
		}
		return false
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
