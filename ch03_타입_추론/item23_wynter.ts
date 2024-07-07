class Foo {
	foo = 123;
	common = '123';
  }
  
  class Bar {
	bar = 123;
	common = '123';
  }
  
  function doStuff(arg: Foo | Bar) {
	if (arg instanceof Foo) {
	  console.log(arg.foo); // ㅇㅋ
	  console.log(arg.bar); // Error!
	}
	if (arg instanceof Bar) {
	  console.log(arg.foo); // Error!
	  console.log(arg.bar); // ㅇㅋ
	}
  
	console.log(arg.common); // ㅇㅋ
	console.log(arg.foo); // Error!
	console.log(arg.bar); // Error!
  }

interface  Square { width: number }
interface  Rectang { width: number, height: number }
type Shape = Square | Rectangle;
function calculateArea(shape: Shape) {
    if(shape instanceof Rectangle)
        return shape.width * shape.height;
}

function contains(search: string | RegExp) {
	if(search instanceof RegExp) {
		return !!search.exec('');
	}
}

function isInputElement(el: HTMLElement): el is HTMLInputElement {
	return 'value' in el;
}

const pt = {x: 'x'}
const id = {name: 'py'};
const namedPoint = Object.assign({}, pt, id);