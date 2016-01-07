#MindGraph

MindGraph is a graph storage system that accepts plain english commands and proactively requests information from the user to fill in data it suspects may exist.

MindGraph runs on node, to start it clone the repo and run
```shell
$ node main
```

## Storage Commands

### Simple Definition

*store an item as a subclass of another item*
```code
> A bug is an insect
> is a bug an insect?
Yes, a bug is a kind of insect.

> tree is a plant
> is tree a plant?
Yes, a tree is a kind of plant.
```

### Simple Description

*store an item as an attribute of another item*
```code
> icecream is sweet
> americone_dream is an icecream
Does the subtype americone_dream share attribute sweet with parent? >

> a story is a man_made_object
> stories are imaginitive
Does man_made_object also have attribute imaginitive? > yes
> a painting is a man_made_object
Does the subtype painting share attribute imaginitive with parent? >
```

### Complex Description

*store an attribute as a subclass of an attribute of a thing*
```code
> wartime is a state of America
> peacetime is a state of America
> red is a color of hat
> blue is a color of hat
```
## Queries

### Subclass Question

*ask if one thing is a class of another thing*
```code
> Is a bug an insect?
Yes, a bug is a kind of insect.
> Is icecream an insect?
No, should I store icecream as a kind of insect? > no
>
```

### Attribute Question

*ask if something has some attribute*
```code
> Is icecream sweet?
No, should I store icecream as having attribute sweet? > yes
> Is icecream sweet?
Yes, icecream is sweet.
```

### Basic Query

*ask about the classes and attributes of a thing*
```code
> what is icecream?
icecream is a kind of dessert.
icecream has the attribute(s) sweet.
```

### Complex Query

*ask about the kinds of an attribute of a thing*
```code
> what are the states of America
The state(s) of america are wartime, and peacetime
> what are the colors of hat
The color(s) of hat are red, and blue
```

## Commands

### Save to and Load from Disk

save / load
```code
> save
What do you want to name the graph? > test
> load
What is the name of the graph? > test
```
### Print full JSON

json
```code
> json
{"items":[{"name":"thing","id":0},{"name":"insect","id":1},{"name":"bug","id":2},{"name":"dessert","id":3},{"name":"icecream","id":4},{"name":"sweet","id":5}],"edges":[{"source":2,"target":1,"type":"SUBTYPE_OF"},{"source":4,"target":3,"type":"SUBTYPE_OF"},{"source":4,"target":5,"type":"HAS_ATTRIBUTE"}],"counter":6}
```
### Pretty Print

list
```code
> list
0: thing
1: insect
2: bug
3: dessert
4: icecream attributes: sweet
5: sweet
```

### Exit

exit

(quits program)
