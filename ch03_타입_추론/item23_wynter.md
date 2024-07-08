# 아이템23 한꺼번에 객체 생성하기

```ts
// 이렇게 쓰지 맙시다
const pt = {};
pt.x = 3;
pt.y = 4;

// 이렇게 쓰지 맙시다
interface Point { x:number; y:number;}
const pt:point = {};

// 굿
const pt = { x:3, y:3 };

// 이렇게 하면 에러는 안나겠지만 한 번에 해주자~
const pt = {} as Point;

const id = {name: 'py'};
const namedPoint = {};
Object.assign(namedPoint, pt, id);
namedPoint.name; // name 속성이 없습니다

// 전개 연산자를 사용하면 한꺼번에 만들 수 있다.
const namedPoint = {...pt, ...id};

// 여기서 책이 또 좀 납득이 어려운 점
// Object.assign은 반환값이 있기 때문에 const namedPoint = object.assign({}, pt, id) 이런식으로 해도 문제 없이 동작한다.
// 하지만 책에서는 마치 spread연산자가 아니라 object.assign을 이용해서 문제인 것 마냥 오해할 수 있게 적혀져있다.

declare let hasDates:boolean;
const nameTitle = { name: 'kkk', title: 'phh' };
const ph = {
	...nameTitle,
	...(hasDate ? {start:-2589, end: -2566}: {})
}; // start,end,name,title | name, title 이렇게 유니온으로 추론됨
// 유니온 말고 선택적 필드로 표현하려면 헬퍼 함수 이용하기
```

## 그냥 정리

### 아이템21 타입 넓히기

* 타입 체커가 코드를 분석하고 타입을 분석할 때, 타입이 명시되지 않은 단일값에 대하여 할당 가능한 값들의 집합을 유추하는 것을 넓히기 라고 부름.
* let x = 'x' 를 'x' 가 아닌 string으로 추측함.
* 이런 넓히기 과정을 제어할 수 있는 첫 번재 방법
  * const x = 'x'. 재할당할 수 없으므로 x는 'x'로 추론 가능.
  객체와 배열의 경우는 여전히 문제.
  * 명시적 타입 구문
  * const 단문(as const)

### 아이템22 타입 좁히기

* instanceof로 타입체크하는 거 못 쓰는 거 아니었나?
  * 이건 책이 ㄹㅇ 레전드인듯 아이템3과 상반된 내용을 책에 넣어놨네
  * 타입 체크로 걸린 게 아니라 값체크로 걸린거임 RegExp는.

* el is HTMLInputElement 반환이 true인 경우 타입을 좁힐 수 있다고 알려줌

### 아이템 24 일관성 있는 별칭 사용하기

### 아이템 25 비동기 코드에는 콜백 대신 async 함수 사용하기

* IDE 레거시 보고있나?
