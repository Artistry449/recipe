const array = [23, 44, 12];

let myFunction = a => console.log('too: ' + a);

const arr2 = [...array, 44, 1223];

myFunction(arr2[1]);