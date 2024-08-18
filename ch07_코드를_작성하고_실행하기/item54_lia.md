# 아이템54. 객체를 순회하는 노하우

```tsx
const obj = {
	one: "uno",
	two: "dos",
	three: "tres",
};
for (const k in obj) {
	const v = obj[k];
	//  ~~~~~~ obj에 인덱스 시그니처가 없기 때문에 엘리먼트는 암시적으로 'any' 타입입니다.
}
// 정상적으로 실행되지만, 편집기에서는 오류가 발생함 -> 편집기에서 오류 안나는데?
// Q. 오류의 원인은 무엇일까요?

// obj 객체를 순회하는 루프 내의 상수 k와 관련된 오류라는 것 알 수 있음
const obj = {
	/* ... */
};
// const obj: {
// 	one: string;
// 	two: string;
// 	three: string;
// };
for (const k in obj) {
	// const k: string
	// ...
}
// k의 타입은 string인 반면, obj 객체에는 'one', 'two', 'three' 세 개의 키만 존재함.
// k와 obj 객체의 키 타입이 서로 다르게 추론되어 오류가 발생한 것임

// k의 타입을 더욱 구체적으로 명시해 주면 오류는 사라짐
let k: keyof typeof obj; // "one" | "two" | "three" 타입
for (k in obj) {
	const v = obj[k]; // 정상
}

// Q. 첫 번째 예제의 k 타입이 "one" | "two" | "three" 가 아닌 string으로 추론된 원인은 무엇일까요?
// 인터페이스와 함수가 가미된 다른 예제
interface ABC {
	a: string;
	b: string;
	c: number;
}

function foo(abc: ABC) {
	for (const k in abc) {
		// const k: string
		const v = abc[k];
		//  ~~~~~~ 'ABC' 타입에 인덱스 시그니처가 없기 때문에 엘리먼트는 암시적으로 'any'가 됩니다.
	}
}
// 첫 번째 예제와 동일한 오류
// (let k: keyof ABC) 같은 선언으로 오류를 제거할 수 있음

// 오류의 내용이 잘못된 것처럼 보이지만, 실제 오류가 맞고 또한 타입스크립트가 정확히 오류를 표시함.
// 제대로 된 오류인 이유를 예로 들어 설명해보자
const x = { a: "a", b: "b", c: 2, d: new Date() };
foo(x); // 정상
// foo 함수는 a, b, c 속성 외에 d를 가지는 x 객체로 호출이 가능.

// 또한 keyof 키워드를 사용한 방법은 또 다른 문제점을 내포하고 있음
function foo(abc: ABC) {
	let k: keyof ABC;
	for (k in abc) {
		// let k: "a" | "b" | "c"
		const v = abc[k]; // string | number 타입
	}
}
// k가 "a" | "b" | "c" 타입으로 한정되어 문제가된 것처럼,
// v도 string | number 타입으로 한정되어 범위가 너무 좁아 문제가 됨
// d: new Date() 가 있는 이전 예제처럼, d 속성은 Date 타입뿐만 아니라 어떠한 타입이든 될 수 있기 때문에 v가 string | number 타입으로 추론된 것은 잘못이며 런타임의 동작으로 예상하기 어려움.

// 골치 아픈 타입 문제 없이, 단지 객체의 키와 값을 순회하고 싶다면? Object.entreies 사용
function foo(abc: ABC) {
	for (const [k, v] of Object.entries(abc)) {
		k; // string 타입
		v; // any 타입
	}
}
// Object.entries 를 사용한 루프가 직관적이지는 않지만, 복잡한 기교 없이 사용할 수 있음
```

- 객체를 다룰 때에는 항상 ‘프로토타입 오염’의 가능성을 염두에 두어야 함. for-in 구문을 사용하면, 객체의 정의에 없는 속성이 갑자기 등장할 수 있음.

```tsx
> Object.prototype.z = 3; // 제발 이렇게 하지 맙시다 !
> const obj = {x: 1, y: 2};
> for (const k in obj) { console.log(k); }
x
y
z

// 실제 작업에서는 Object.prototype에 순회 가능한 속성을 절대로 추가하면 안됨.
// for-in 루프에서 k가 string 키를 가지게 된다면 프로토타입 오염의 가능성을 의심해 봐야 함.
```

> 요약

- 객체를 순회할 때, 키가 어떤 타입인지 정확히 파악하고 있다면 let k: keyof T 와 for-in 루프를 사용합시다. 함수의 매개변수로 쓰이는 객체에는 추가적인 키가 존재할 수 있다는 점을 명심합시다.
- 객체를 순회하며 키와 값을 얻는 가장 일반적인 방법은 Object.entries 를 사용하는 것입니다.
  >
