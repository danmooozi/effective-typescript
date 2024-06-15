## 7. 타입이 값들의 집합이라고 생각하기

타입스크립트의 타입은 특정 변수에 할당할 수 있는 값들의 집합으로 볼 수 있다.  
예를 들어 number 타입은 모든 숫자값의 집합으로 이해할 수 있다.

### 타입과 집합

never 타입은 아무 값도 포함하지 않는 공집합이며, 따라서 어떤 값도 never 타입의 변수에 할당할 수 없다.

```ts
const x: never = 12;
// '12' 형식은 'never' 형식에 할당할 수 없습니다.
```

그 다음으로 작은 집합은 하나의 값만 포함하는 리터럴 타입(유닛 타입)이다.  
두 개 이상의 값을 할당 가능하게 하려면 유니온 연산자(`|`)로 묶어서 합집합으로 만들면 된다.

```ts
type A = "A";
type B = "B";
type Twelve = 12;

type AB = "A" | "B";
type AB12 = "A" | "B" | 12;
```

위에서 다룬 타입들은 원소의 개수가 한정되어 있지만, 일반적으로 다루는 타입들은 값의 개수가 무한대이다.  
일반적인 타입들은 다음과 같이 무수히 많은 원소를 일일이 유니온해서 추가한 것으로 이해할 수 있다.

```ts
type Int = 1 | 2 | 3 | 4 | 5; // | ...
```

### 집합으로 이해하는 구조적 타이핑과 타입 연산(&, |)

이제 이전에 살펴봤던 구조적 타이핑을 다시 한 번 살펴보자.  
다음과 같이 id 속성을 가진 Identified 인터페이스를 정의했다면, 해당 타입에는 id 외의 다른 잉여 속성들을 함께 가지고 있는 객체들도 할당이 가능하다.  
즉 string 타입의 id 프로퍼티만 가지고 있으면 어떤 타입이든 Identified의 부분집합이 되는 것이다.

```ts
interface Identified {
  id: string;
}
```

이러한 개념을 바탕으로 `&` 연산자를 살펴보자.  
다음의 예시에서는 Person과 Lifespan을 `&` 연산자로 묶어서 PersonSpan 타입을 정의하고 있다.

```ts
interface Person {
  name: string;
}

interface Lifespan {
  birth: Date;
  death?: Date;
}

type PersonSpan = Person & Lifespan;
```

이 때 타입 연산자는 타입의 속성들이 아닌, 타입의 범위에 적용됨을 기억해야 한다.  
Person과 Lifespan은 자신이 정의하지 않은 속성을 함께 가진 값들도 범위에 포함한다.  
따라서 이 둘의 교집합은 각 타입에서 정의한 속성들을 모두 가지고 있는 값들로 구성된다.

```ts
const ps: PersonSpan = {
  name: "Alan Turing",
  birth: new Date("1912/06/23"),
  death: new Date("1954/06/07"),
};
```

keyof를 통해 특정 타입에서 정의한 속성의 목록을 추출할 수 있다.  
`&` 연산을 하면 두 타입의 키들이 합쳐지고, `|` 연산을 하면 공통으로 기지고 있는 키들만 남게 된다.  
Person과 Lifespan의 공통 키는 없기 때문에, `|` 연산을 한 뒤 keyof를 하면 never 타입이 된다.

```ts
type T = keyof (Person & Lifespan); // 'name' | 'birth' | 'death'
type K = keyof (Person | Lifespan); // never
```

해당 개념을 등식으로 표현하면 다음과 같다.  
& 연산을 하면 두 타입의 키가 합쳐지고, | 연산을 하먄 공통 키만 남게 된다.

```ts
keyof (A & B) = (keyof A) | (keyof B)
keyof (A | B) = (keyof A) & (keyof B)
```

### 집합으로 이해하는 extends

extends 키워드도 타입 간 관계를 나타낼 때 많이 사용한다.  
집합의 관점에서 extends는 해당 타입이 다른 타입의 부분집합임을 선언하는 것이라고 이해할 수 있다.  
다음 예시에서 PersonSpan는 Person의 모든 키를 가지면서 자신의 키를 추가로 가지기 때문에 Person의 부분집합이 된다.

```ts
interface Person {
  name: string;
}
interface PersonSpan extends Person {
  birth: Date;
  death?: Date;
}
```

타입스크립트에서는 extends한 타입을 서브타입이라고 말한다.  
extends는 타입 간 상속 관계를 맺게 하는 것이기도 하지만, 타입스크립트에서는 부분 집합 관계를 설정하는 것으로 이해하는게 더 유용하다.  
예시에서 Vector3D는 Vector2D의 부분 집합이고, Vector2D는 Vector1D의 부분집합이다.

```ts
interface Vector1D {
  x: number;
}
interface Vector2D extends Vector1D {
  y: number;
}
interface Vector3D extends Vector2D {
  z: rumiber;
}
```

extends는 제네릭의 한정자로도 쓰이며, 이 때에는 제네릭을 특정 집합의 부분집합으로 제한하는 것으로 이해할 수 있다.

```ts
function getKey<K extends string>(val: any, key: K) {
  // ...
}
```

위 예시에서 제네릭 타입 K가 string 타입을 상속한다는 의미로 해석하면 잘 이해가 되지 않는다.  
하지만 K가 string의 부분집합이라는 의미로 해석하면, 이에 포함되는 string 리터럴 타입, 리터럴 타입의 유니온 등이 포함될 수 있음을 이해할 수 있다.

```ts
getKey({}, "x");
getKey({}, Math.random() < 0.5 ? "a" : "b");
getKey({}, document.title);
getKey({}, 12); // 오류: '12' 형식의 인수는 'string' 형식의 매개변수에 할당될 수 없습니다.
```

### 집합으로 이해하는 튜플

배열과 튜플의 관계에 대해서도 살펴보자.  
배열을 변수에 할당하면 해당 변수의 타입은 배열로 유추된다.  
이 때 배열은 튜플의 부분집합이 아니기 때문에, 튜플 타입으로 선언한 변수에는 배열 변수를 할당할 수 없다.  
하지만 반대로 튜풀은 배열의 부분집합이기 때문에, 튜플 타입의 변수를 배열 변수에 할당하는 것은 가능하다.

```ts
const list = [1, 2]; // 타입은 number[]
const tuple: [number, number] = list;
//    ~~~~~ 'number[]' 타입은 '[number, number]' 타입의 0, 1 속성에 할당할 수 없습니다.

const tuple2: [number, number] = [1, 2];
const list2: number[] = tuple;
```

이번엔 튜플 간의 관계를 살펴보자.  
숫자 세 개로 이루어진 triple 튜플은 값 두 개로 이루어진 double 튜플에 할당 가능할 것으로 생각할 수 있다.  
하지만 이는 불가능하며, 그 이유는 타입스크립트가 튜플을 모델링할 때 배열의 length 값을 함께 반영했기 때문이다.  
예를 들어 double 튜플 타입은 `{0: number, 1: number, length: 2}` 로 모델링 되어있다.

```ts
const triple: [number, number, number] = [1, 2, 3];
const double: [number, number] = triple;
// [number, number, number] 형식은 [number, number] 형식에 할당할 수 없습니다.
// 'length' 속성의 형식이 호환되지 않습니다. '3' 형식은 '2' 형식에 할당할 수 없습니다.
```

### 집합으로써의 타입 주의 사항

타입에서 특정 값을 배제하는 식으로 타입을 정의하는 것은 불가능하다.  
예를 들어 정수 타입을 정의하거나, 0을 제외한 number로 타입을 정의하는 것은 불가능하다.  
Exclude 타입 연산은 그 결과가 일반적인 타입에 해당할 때에만 유효하게 동작한다.

```ts
type T = Exclude<string | Date, string | number>; // Date
type NonZeroNums = Exclude<number, 0>; // number

const num: NonZeroNums = 0; // 정상
```

### 집합 개념과 타입 매칭

- never = 공집합
- 리터럴 타입 = 원소가 1개인 집합
- 값이 T에 할당 가능 = 값이 T의 원소
- T1이 T2에 할당 가능 = T1이 T2의 부분 집합
- T1이 T2를 상속 = T1이 T2의 부분 집합
- T1 | T2 = T1과 T2의 합집합
- T1 & T2 = T1과 T2의 교집합
- unknown = 전체(universal) 집합
