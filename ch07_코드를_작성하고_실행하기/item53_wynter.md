# 야이템 53 타입스크립트 기능보다는 ECMAScript 기능을 사용하기

타입스크립트는 자바스크립트의 부족한 기능들(클래스, enum, 모듈시스템)을 독립적으로 개발하여 포함시켰었으나, 자바스크립트의 발전으로 호환성 이슈가 생겼다. 타스개발팀에서는 기존 타스와의 호환성을 포기하는 방향으로 개발하고 타입기능만 발전을 시키고 있고, TC39(자스개발팀)은 런타임 기능을 발전시키고 있다.

### 열거형(enum)

```ts
enum Flavor {
	VANILLA = 0,
	CHOCOLATE = 1,
	STRAWBERRY = 2
}

let flavor = Flavor.CHOCOLATE; // 타입 Flavor
```

* 숫자 열거형(앞 예제의 Flavor)에 0, 1, 2 외 다른 숫자가 할당되면 매우 위험하다.
  * 이 방식은 비트플래그를 위해 설계된 방식인데, 비트플래그는 isVanila = true, isChocolate = false 이런 bool 자료형을 3개 만드는 것보다 int 자료형 하나를 쓰는 게 더 효율적인 것을 이용한 방식
* 상수 열거형은 보통의 열거형과 달리 런타임에 완전히 제거됩니다. `const enum Flavor`로 바꾸면 컴파일러는 Flavor.CHOCOLATE를 0으로 바꾸어 버림. 이런 결과는 문자형 열거형과 숫자 열거형과 전혀 다른 동작입니다.
  * 이게 뭔소리지? 1로 바꾸는 게 정상일텐데 ㅋㅋ
* preserveConstEnums 플래그를 설정한 상태의 상수 열거형은 보통의 열거형처럼 런타임 코드에 상수 열거형 정보를 유지합니다.
* 문자형 열거형은 런타임의 타입 안정성과 투명성을 제공합니다. 그러나 타스의 다른 타입과 달리 구조적 타이핑이 아닌 명목적 타이핑을 사용합니다.
  * 명목적 타이핑은 옮긴이에 따르면 타입의 이름이 같아야 할당 허용된다고 함


```ts
enum Flavor {
	VANILLA = 'vanila',
	CHOCOLATE = 'choco',
	STRAWBERRY = 'straw'
}

let flavor = Flavor.CHOCOLATE; // 타입 Flavor
flavor = 'straw'; // straw 형식은 Flavor 형식에 할당할 수 없습니다.

function scoop(flavor: Flavor) { }
scoop('vanila') // 자스에서 정상, 타스에서는 불가능
```

자스 타스 동작이 다르기 때문에 문자열 열거형을 사용하지 않는 것이 좋다. 대신 리터럴 타입의 유니온을 사용하자!
근데 이넘은 이 문제말고도 트리쉐이킹문제, 숫자형의 키-밸류 섞이는 문제 때문에 걍 안 쓰는게 좋은 것 같다.

```ts
type Flavor = 'v' | 'c' | 's'
let flavor:Flavor = 'c' // 정상
flavor = 'a' // 에러
```

### 매개변수 속성

```ts
class Person {
	name: string;
	constructor(name: string) {
		this.name = name;
	}
}

// 타스에서는 더 간결한 문법 제공
class Person {
	constructor(public name:string) {}
}
```

public name은 매개변수 속성이라고 불리며, 멤버 변수로 name을 선언한 예제와 동일하게 동작함.

* 일반적으로 타스 컴파일은 타입 제거가 이루어지므로 코드가 줄어들지만, 매개변수 속성은 코드가 늘어나는 문법
* 매개변수 속성이 런타임에는 실제로 사용되지만, 타스 관점에서는 사용되지 않는 것으로 보임
* 매개변수 속성과 일반 속성을 섞어서 사용하면 클래스의 설계가 혼란스러워짐

```ts
class Person {
	first: string;
	last: string;
	constructor(public name: string) {
		[this.first, this.last] = name.split(' ');
	}
} 

// 구조적 타이핑에 의해 아래 예제가 정상이다.
class Person {
    constructor(public name: string) {}
}

const p: Person = { name: 'Jed' };
```

### 네임스페이스와 트리플 슬래시 임포트

ECMA2015 이전에는 자스에 공식 모듈 시스템이 없었습니다. Node.js는 require와 module.exports를 사용, AMD는 define함수와 콜백을 사용했습니다.
타스는 module 키워드와 '트리플 슬래시'임포트 사용. ECMA2015 에서 모듈 시스템 도입 후에 충돌을 피하기 위해 같은 기능을 하는 namespace 키워드를 추가했다.
근데 호환성 때문일 뿐, 이제 import, export를 쓰자.

```ts
namespace foo {
	function bar() {}
}

/// <reference path="other.ts">
foo.bar();
```

### 데코레이터

데코레이터는 클래스, 메서드 속성에 어노테이션을 붙이거나 기능을 추가하는 데 사용할 수 있다.

```ts
class Greeter {
	greeting: string;
	constructor(message: string) { this. greeting = message; }
	@logged
	greet() {
		return "Hello, " + this.greeting;
	}
}

function logged(target:any, name: string, descriptor: PropertyDescriptor) {
	const fn = target[name];
	descriptor.value = function() {
		console.log(`Calling ${name}`);
		return fn.apply(this, arguments);
	}
}

console.log(new Greeter('Dave').greet()); // Calling greet Hello, Dave
```

데코레이터는 angular를 지원하기 위해 추가되었으며, tsconfig에 experimentalDecorators라는 속성을 설정하고 사용해야 한다. 현재(2024.08)도 실험 기능이다.

요약

* 일반적으로 타입스크립트 코드에서 모든 타입 정보를 제거하면 자스가 되지만, 열거형, 매개변수 속성, 트리플 슬래시 임포트, 데코레이터는 타입 정보를 제거한다고 자바스크립트가 되지는 않습니다.
* 타스의 역할을 명확하게 하려면, 열거형, 매개변수 속성, 트리플 슬래시 임포트, 데코레이터는 사용하지 않는 것이 좋습니다.

## 그냥 정리

### 아이템 51 의존성 분리를 위해 미러 타입 사용하기

* 그냥 구현과 무관하다면 긁어와서 쓰라는 의미인듯

### 아이템 52 테스팅 타입의 함정에 주의하기

* TODO 타입 테스트 dtslint.. 공부하기..

### 아이템 54 객체를 순회하는 노하우

* 객체 순회를 타입 문제 없이 하려면 Object.entries를 이용하면 된다. 혹은 keyof를 쓰던가

### 아이템 55 DOM 계층 구조 이해하기

* 돔에서는 조금 더 구체적인 타입 정보를 사용해야함.
