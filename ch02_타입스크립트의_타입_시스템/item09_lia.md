# 아이템09 타입 단언보다는 타입 선언을 사용하기

## 타입 선언 vs 타입 단언

<strong>1. 값을 할당하고 타입을 부여하기</strong>

```ts
interface Person {
	name: string;
}

const alice: Person = { name: "Alice" }; // 타입은 Person - 변수에 '타입 선언'을 붙여서 그 값이 선언된 타입임을 명시
const bob = { name: "Bob" } as Person; // 타입은 Person - as Person이 '타입 단언' 수행 -> 타입스크립트가 추론한 값이 있더라도 Person 타입을 간주함.
```

→ 타입 단언보다 타입 선언을 사용하는게 나음

왜?

```ts
const alice: Person = {}; // ~~~ 'Person' 유형에 필요한 'name' 속성이 '{}' 유형에 없습니다.
const bob = {} as Person; // 오류 없음
```

- 타입 선언은 할당되는 값이 해당 인터페이스를 만족하는지 검사함. → 통과 못해서 오류
- 타입 단언은 강제로 타입을 지정해서 타입 체커에게 오류를 무시하라고 하는 것.

<strong>2. 속성 추가하기</strong>

```ts
const alice: Person = {
	name: "Alice",
	occupation: "TypeScript developer", // ~~~ 개체 리터럴은 알려진 속성만 지정할 수 있으며 'Person' 형식에 'occupation'이(가) 없습니다.
};
const bob = {
	name: "Bob",
	occupation: "Javascript developer",
} as Person; // 오류 없음
```

- 타입 선언문에서는 잉여 속성 체크(아이템 11)가 동작했지만, 단언문에서는 적용 안됨.

→ 타입 단언이 꼭 필요한 경우가 아니라면, 안전성 체크도 되는 타입 선언을 사용하는 것이 좋음.

## 화살표 함수의 반환 타입을 명시하는 방법

```ts
const people = ['alice', 'bob', 'jan'].map(name => ({name});
// Person[]을 원했지만 결과는 { name: string; }[]...

// {name} 에 타입 단언을 쓰면 문제가 해결되는 것처럼 보임
const people = ['alice', 'bob', 'jan'].map(
	name => ({name} as Person)
); // 타입은 Person[]

// 그러나, 타입 단언을 사용하면 앞선 예제들처럼 런타임에 문제가 발생하게 됨
const people = ['alice', 'bob', 'jan'].map(name => ({} as Person)); // 오류 없음

// 단언문을 쓰지 않고, 다음과 같이 화살표 함수 안에서 타입과 함께 변수를 선언하는 것이 가장 직관적임
const people = ['alice', 'bob', 'jan'].map(name => {
	const person: Person = {name};
	return person;
}); // 타입은 Person[]

// 코드를 조금 간결하게 하기 위해 변수 대신 화살표 함수의 반환 타입을 선언
const people = ['alice', 'bob', 'jan'].map(
	(name): Person => ({name})
); // 타입은 Person[]

// 소괄호가 지니는 의미가 중요. (name): Person 은 name의 타입이 없고, 반환 타입이 Person 임.
// 그러나 (name: Person)은 name의 타입이 Person임을 명시하고 반환 타입은 없기 때문에 오류 발생
const people: Person[] = ['alice', 'bob', 'jan'].map(
	(name): Person => ({name})
);
```

## 타입 단언이 꼭 필요한 경우

1. 타입스크립트보다 타입 정보를 더 잘 알 고 있는 상황
   - ex) 타입스크립트는 DOM에 접근할 수 없기 때문에 #myButton이 버튼 엘리먼트인지 알지 못함.
2. 자주 쓰이는 특별한 문법(!)을 사용해서 null이 아님을 단언하는 경우
   - 단언문은 컴파일 과정 중에 제거되므로, 타입 체커는 알지 못하지만 그 값이 null이 아니라고 확신할 수 있을 때 사용해야 함.
