# 아이템 38 any 타입은 가능한 한 좁은 범위에서만 사용하기

```ts
function processBar(b: Bar) {}
function f() {
	const x = expressionReturningFoo();
	processBar(x); // 'Foo' 형식의 인수는 Bar 형식의 매개변수에 할당될 수 없습니다.
}

// x
const x:any = expressionReturningFoo();

// x - 이유
function f1() {
	const x:any = expressionReturningFoo();
	processBar(x);
	return x;
}
const foo = f1();
foo.fooMethod() // foo 타입이 아니므로 체크되지 않음

// o
processBar(x as any); // 다른 코드에는 영향을 미치지 않으므로 이게 더 낫다.
```

* 비슷한 관점에서 반환 타입을 명시해두면 any 타입이 함수 바깥으로 영향을 미치는 것을 방지할 수 있음.
* ts-ignore로도 에러를 없앨 수 있지만, 근본적인 원인을 찾아 대처하는 게 나음.

```ts
const config:Config = {
	a: 1,
	b: 2,
	c: {
		key: value
		// ~~~ 'foo' 속성이 'Foo' 타입에 필요하지만 'Bar' 타입에는 없습니다.
	}
}

// x
const config: Config = {...} as any; // a와 b의 타입체크도 되지 않음!

// o
const config: Config = {
	a: 1,
	b: 2,
	c: {
		key: value as any
	}
}

```

* 요약
  * 의도치 않은 타입 안정성 손실을 피하기 위해 any의 사용범위를 최소한으로 좁히기
  * 함수의 반환 타입이 any인 경우 타입안정성이 낮아진다.
  * 강제로 타입 오류를 제거하려면 any 대신 ts-ignore를 쓰는 게 낫다.

## 그냥 정리

### 아이템 36 해당 분야의 용어로 타입 이름 짓기

* 와우.. 제목이 곧 내용

### 아이템 37 공식 명칭에는 상표를 붙이기

* 상표 기법을 쓰면 결국 값 공간에서의 함수가 하나 추가되는 것으로 보이는데 오버헤드가 아닌가?

### 아이템 39 any를 구체적으로 변형해서 사용하기

* ex. any -> any[]

### 아이템 40 함수 안으로 타입 단언문 감추기

* 오 맥스 이번엔 예시코드 좀 어려운데~
