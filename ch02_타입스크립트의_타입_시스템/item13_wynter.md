## 앞장 그냥 정리

### 아이템11 잉여 속성 체크의 한계 인지하기

```ts
interface Room {
	numDoors: number;
	ceilingHeightFt: number;
}
const r:Room = {
	numDoors: 1,
	ceilingHeightFt: 10,
	elephant: 'present'
} // Room에 elephant가 없음
```

* 객체 리터럴인 경우에만 잉여 속성 체크가 적용되는듯

## 아이템12 함수 표현식에 타입 적용하기

(statement를 선언식이라고 해석하겠음)

* 타스에서는 선언식(`함수() {}`) 보다는 표현식(`변수 = 함수()`)이 더 좋다.


```ts
type Fn = (sides:number) => number;
const temp:Fn = sides => {}
```

> 💡 함수 시그니처란 함수의 원형에 명시되는 매개변수 리스트를 가리킵니다.

* (표현식이 더 좋은 이유) 함수 타입을 선언하여 표현식에 재사용할 수 있기 때문.
  * => 반복되는 함수 시그니처를 하나의 함수 타입으로 통일할 수 있음.

```ts
async function getQuote() {
	const res = await fetch('/quote?by=Mark');
	const quote = await response.json();
	return quote;
}
```

* fetch했을 때 존재하지 않는 api라면 404 Not Found 응답. 이것이 json이 아닐 수 있음.
  * 404는 감춰지고, 응답이 json이 아니라는 다른 에러로 rejected Promise 반환.

```ts
declare function fetch(input: RequestInfo, init?:RequestInit): Promise<Response>;
async function checkedFetch(input: RequestInfo, init?:RequestInit) {
	const res = await fetch(input, init);
	if(!res.ok) throw new Error('requestFailed: ' + res.status);
	return res;
}

// checkedFetch는 아래처럼 더 간결하게 작성 가능!
const checkedFetchWithType: typeof fetch = async (input, init) => {/*...*/}
```

* 책에서는 아래방식(checkedFetchWithType)으로 했을 때, throw new Error대신 return으로 하면 구현체에서 에러가 발생하고, 윗방식(checkedFetch)으로 하면 호출한 위치에서 에러가 발생한다고 한다.
* 근데 이건 단순히 함수 선언문으로 작성된 쪽에서 반환 타입을 지정하지 않았기 때문이라고 생각함. 억지 장점아닌가?

> 💡 declare?
> declare를 쓰면 이미 정의된 변수나 함수를 재정의 할 수 있다. ( 타입까지도 재정의가 가능하다 )
> TypeScript로 작성하지 않은 코드의 타입 정보를 컴파일러에게 알려주는 선언하는 것.
>> (TIP) tsconfig.json 안에 allowJs 옵션을 true로 설정하면 자바스크립트 파일도 타입 지정이 알아서 된다.

declare를 검색했다가 재밌는 사실을 알게 되었다. [참고](https://html-jc.tistory.com/604)

Ambient Module이라고, import export 키워드가 없으면 타스에서 전역 모듈로 인식해서 다른 곳에서도 타입을 쓸 수 있게 된다고 한다.

## 아이템13 타입과 인터페이스의 차이점 알기

*와 엄청 중요한 소제목이네요..*

* 타입을 정의하는 법 두 가지

```ts
type TState = {
	name: string;
	capital: string;
}

interface IState = {
	name: string;
	capital: string;
}
```

* 대부분의 경우(인덱스 시그니처, 함수 타입, 제네릭, 타입확장, 클래스 implements) 등 둘 다 모두 가능
  * 다만, 인터페이스는 유니온 타입 같은 복잡한 타입을 지정하지는 못함

* 인터페이스는 타입을 확장할 수 있지만, 유니온은 할 수 없습니다.

```ts
type Input = {}
type Output = {}
interface VairableMap {
	[name: string]: Input | Output
}

type NameVariable = (Input | Ouput) & { name: string }; // 인터페이스로 표현 불가
```

* 튜플과 배열도 type이 더 간결

```ts
type Pair = [number, number];
type StringList = string[];
type NameNums = [string, ...number[]];

interface Tuple {
	0: number;
	1: number;
	length: 2;
} // concat같은 메서드를 사용할 수 없게 됨;
```

* 인터페이스는 보강(augment)가 가능하다.

```ts
interface IState = {
	name: string;
	capital: string;
}

interface IState = {
	population: number;
} // 선언 병합
```

* 실제로 Array인터페이스를 보면 그렇게 동작할 예정 [lib.es5](https://github.com/microsoft/TypeScript/blob/main/src/lib/es5.d.ts#L1304) + [lib.es2023](https://github.com/microsoft/TypeScript/blob/main/src/lib/es2023.array.d.ts#L1)

* 결론
  * 복잡한 타입은 type
  * 보강이 필요한 경우 인터페이스
  * 두 가지 모두 다 가능한 경우라면 컨벤션에 맞게.

## 뒷장 그냥 정리

### 아이템14 타입 연산과 제너릭 사용으로 반복 줄이기

이건 몰랐던 건데 좀 유용한듯
``` ts
type TopnavState = {
	userId: State['userId'];
	pageTitle: State['pageTitle'];
	recentFiles: State['recentFiles'];
};

type TopNavState = {
	[k in 'userId' | 'pageTitle' | 'recentFiles']: State[k]
}; // Pick도 같은 방식으로 동작
```

### 아이템15 동적 데이터에 인덱스 시그니처 사용하기

* 제목이 곧 내용인듯!
