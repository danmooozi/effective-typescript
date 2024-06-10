# 아이템04 구조적 타이핑에 익숙해지기

## 구조적 타이핑(Structural Typing)이란?

타입 시스템에서 객체의 실제 형태나 구조를 기준으로 타입을 결정하는 방식
객체의 형태에 따라 타입을 검사하는 방식으로, `덕 타이핑(duck typing)` 이라고도 불림
타입을 명시적으로 선언할 필요 없이 '구조적으로' 타입이 맞기만 한다면 타입 에러를 발생시키지 않음

**'매개변수 값이 요구사항을 만족한다면 타입이 무엇인지 신경 쓰지 않는 동작'** 을 그대로 모델링함.

> **덕 타이핑?**  
> 객체가 어떤 타입에 부합하는 변수와 메서드를 가질 경우 객체를 해당 타입에 속하는 것으로 간주하는 방식
> "오리처럼 걷고, 헤엄치고, 꽥꽥거리는 소리를 내는 새가 있다면, 그 새는 오리라고 부르겠다"

```ts
interface Vector2D {
	x: number;
	y: number;
}

/* 벡터의 길이를 계산하는 함수 */
function calculateLength(v: Vector2D) {
	return Math.sqrt(v.x * v.x + v.y * v.y);
}

// 이름이 들어간 벡터 추가
interface NamedVector {
	name: string;
	x: number;
	y: number;
}

// NamedVector 는 number 타입의 x와 y 속성이 있기 때문에 (= NamedVector 의 구조가 Vector2D 와 호환되기 때문에) calculateLength() 로 호출 가능
const v: NamedVector = { x: 3, y: 4, name: "Zee" };
calculateLength(v); // 정상, 결과는 5
```

- 타입스크립트에서 타입은 '**열려(open)**'있음
  - 호출에 사용되는 매개변수의 속성들이 매개변수의 타입에 선언된 속성만을 가지는 경우는 '봉인된(sealed)' 또는 '정확한(precise)' 타입이라 함

### 테스트 작성 시 구조적 타이핑

> 구조적 타이핑을 사용하면 유닛 테스팅을 손쉽게 할 수 있음

```ts
function getAuthors(database: PostgresDB): Author[] {
	const authorRows = database.runQuery(`SELECT FIST, LAST FROM AUTHORS`);
	return authorRows.map(row => ({first: row[0], last: row[1]});
} // getAuthors() 테스트를 위해 mocking한 PostgresDB 생성해야함

// but, 구조적 타이핑을 활용한 더 구체적인 인터페이스를 정의하는 방법이 더 나음
interface DB {
	runQuery: (sql: string) => any[]; // 데이터베이스와 상호작용하는 `runQuery` 메서드만 포함 -> 이 요구사항만 충족하면 어떤 객체든 사용할 수 있음
}
function getAuthors(database: DB): Author[] {
	const authorRows = database.runQuery(`SELECT FIST, LAST FROM AUTHORS`);
	return authorRows.map(row => ({first: row[0], last: row[1]});
}
```

- `PostgresDB` 의 실제 DB 구조에 대한 인터페이스가 아니라 구조적 타이핑을 활용한 좀 더 구체적인 인터페이스를 정의하는 방법이 더 나음
- 테스트를 작성할 때, 더 간단한 객체를 매개변수로 사용할 수도 있음

**구조적 타이핑을 활용하면, 객체가 인터페이스의 요구사항을 충족하기만 하면 되므로 테스트 시 실제 데이터베이스 구현에 의존할 필요가 없음. -> 코드의 유연성과 테스트 작성의 간편함을 높임**

- 추가로, 라이브러리 간의 의존성을 완벽히 분리할 수 있다는 장점도 있음 (item51에서 다룰 예정)

---

> 오리처럼 꽥꽥거리는 인형도 오리라고 할 수 있나?

의도치 않은 결과가 도출될 수 있다

```ts
class A {
	test() {
		return "Is A";
	}
}
class B {
	test() {
		return "Is B";
	}
}

const show = (item: A) => {
	console.log(item.test());
};

show(new A()); // 'Is A'
show(new B()); // 'Is B'
```

`item`의 타입을 `A` 의 인스턴스만 허용하도록 작성했지만, `A`의 멤버를 가지고 있는 `B`의 인스턴스가 들어와도 에러가 발생하지 않음. 예기치 못한 상황이 발생할 수도 있음

타입 단언 추가, 인덱스 시그니처 사용 등 타입을 좁혀 연산하는 타입 가드를 통해 어느정도 해결해야할 문제
