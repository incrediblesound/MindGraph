var natural = require('natural')
var c = new natural.BayesClassifier();

c.addDocument('A x is an x', 	      'X is Y')
c.addDocument('A x is the best Y', 	  'X is best')
c.addDocument('Why do you want to X', 'Why X')

c.train();

var result = c.classify('A good program is a way to learn about the world');
console.log(result)