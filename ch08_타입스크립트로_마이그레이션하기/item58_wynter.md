# 아이템 58 모던 자바스크립트로 작성하기

타스 컴파일러를 자스 트랜스파일러 겸으로 쓸 수 있다. 타스 전환시에 막막하다면 최신 문법의 자스를 사용하는 것으로 갈아끼우는 것을 먼저 해보자.

## ECMAScript 모듈 사용하기

만약 마이그레이션 대상인 자바스크립트 코드가 단일 파일이거나 비표준 모듈 시스템을 사용 중이라면 ES모듈로 전환하는 것이 좋습니다. 모듈 단위로 점진적 마이그레이션이 원활해집니다(아이템 61).

```js
// CJS -----
// a.js
const b = require('./b');
console.log(b.name);

// b.js
const name = 'Module B';
module.exports = { name };

// ECMAScript module -----
import * as b from './b';
console.log(b.name);

// b.ts
export const name = 'Module B';
```

## 프로토타입 대신 클래스 사용하기

과거에는 프로토타입 기반 객체 모델을 사용했으나, 견고하게 설계된 클래스 기반 모델을 선호했기 때문에 클래스 기반 모델이 도입됨.

```js
// prototype ---
function Person(first, last) {
	this.first = first;
	this.last = last;
}

Person.prototyoe.getName = function() {
	return this.first + ' ' + this.last; 
}

const marine = new Person('Marie', 'Curie');
const personName = marine.getName();

// class ---
class person {
	first: string;
	last: string;

	constructor(first:string, last:string) {
		this.first = first;
		this.last = last;
	}

	getName() {
		return this.first + ' ' + this.last;
	}
}

const marie = new Person('g', 'g');
const personName = marie.getName();
```

## var 대신 let/const 사용하기

```js
function foo() {
	bar();
	function bar() {
		console.log('hello');
	}
} // 호이스팅이 수행되어 실행 순서를 예상하기 어렵게 만들고 직관적이지 않음.
```

## for(;;) 대신 for-of 또는 배열 메서드 사용하기

인덱스 변수에 대한 실수를 줄일 수 있다. 인덱스 변수가 필요한 경우엔 forEach를 쓰기

## 함수 표현식보다 화살표 함수 사용하기

```js
class Foo {
	method() {
		console.log(this);
		[1, 2].forEach(function(i) {
			console.log(this);
		})
	}
}

const f = new Foo();
f.method();
// strict 모드에서 Foo, undefined, undefined를 출력합니다.
// non-strict 모드에서 Foo, window, window (!)를 출력합니다.
```

this가 클래스 인스턴스를 참조하는 것을 기대했지만, 예상치 못한 결과가 나오는 경우가 있다. 화살표 함수를 사용하면 상위 스코프의 this를 유지할 수 있다.

```js
class Foo {
	method() {
		console.log(this);
		[1, 2].forEach(i => {
			console.log(this);
		})
	}
}

const f = new Foo();
f.method();
```

## 단축 객체 표현과 구조 분해 할당 사용하기

```js
const x = 1, y = 2, z = 3; 
const pt = {
	x: x, y: y, z: z
}
const pt2 = {
	x, y, z
} // 이게 간결하고 실수가 적음.


const obj = {
	onClickLong: function(e) {},
	onClickCompact(e) {} // 객체 내 더 간결한 함수 표현
}
```

단축 객체 표현의 반대는 객체 구조 분해입니다.

```js
const props = obj.props;
const a = props.a;
const b = props.b;

const { props } = obj;
const { a, b } = props;

const { props: { a, b } } = obj;

// --- 기본값 지정
let {a} = obj.props;
if (a===undefined) a= 'default';

const { a = 'default' } = obj.props;

// 배열도 구조 분해 가능
const point = [1, 2, 3];
const [x, y, z] = point;
const [, a, b] = point;

const points = [ [1,2,3], [4,5,6] ];
points.forEach(([x, y, z]) => console.log(x+y+z))
```

## 함수 매개변수 기본값 사용하기

```js
function parseNum(str, base) {
	base = base || 10;
	return parseInt(str, base)
}

function parseNum(str, base = 10) {
	return parseInt(str, base);
}
```

## 저수준 프로미스나 콜백 대신 async/await 사용하기

```ts
function getJSON(url: string) {
	return fetch(url).then(res => res.json());
}
function getJSONCallback(url:string, cb: (res:unknown) => void) {}

async function getJSON(url: string) {
	const res = await fetch(url);
	return res.json();
}
```

## 연관 배열에 객체 대신 Map 과 Set 사용하기

```ts
function countWords(text: string) {
	const counts: {[word: string]: number} = {};
	for (const word of text.split(/[\s,.]+/)) {
		counts[word] = 1 + (counts[word] || 0);
	}
	return counts;
}
```

constructor라는 키워드에 값이 들어있어서 이상한 값이 들어감.

```ts
function countWordsMap(text: string) {
	const counts = new Map<string, number>();
	for (const word of text.split(/[\s,.]+/)) {
		counts.set(word, = 1 + (counts[word] || 0));
	}
	return counts;
}
```

## 타입스크립트에 use strict 넣지 않기

ES5에서는 버그가 될 수 있는 코드 패턴에 오류를 표시해 주는 엄격 모드가 도입되었습니다. 코드의 제일 처음에 'use strict'를 넣으면 엄격 모드가 활성화됩니다.

타입스크립트에서는 안정성 검사가 엄격 모드보다 훨씬 더 엄격한 체크를 하기 때문에 무의미하다. 실제로는 타스 컴파일러가 생성하는 자스 코드에 use strict가 추가됩니다. alwaysStrict 또는 strict 컴파일러 옵션을 설정하면, 타스는 엄격 모드로 코드를 파싱하고 생성되는 자스에 use strict를 추가합니다.

## 그냥 정리

### 아이템 56 정보를 감추는 목적으로 private 사용하지 않기

* 데이터를 감추기 위해서는 클로저, 혹은 # 멤버 변수 기능 이용하기

### 아이템 57 소스맵을 사용하여 타입스크립트 디버깅하기

* ide에서 소스맵이 보였던 것 같은데..

### 아이템 59 타입스크립트 도입 전에 @ts-check와 JsDoc으로 시험해 보기

* ts-check 처음 봤는데 신기하네..

### 아이템 60 allowJs로 타입스크립트와 자바스크립트 같이 사용하기

### 아이템 61 의존성 관계에 따라 모듈 단위로 전환하기

### 아이템 62 마이그레이션의 완성을 위해 noImplicitAny 설정하기

* 아래 세개는 뭐.. 제곧내
