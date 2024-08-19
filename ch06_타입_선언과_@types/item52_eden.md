# 52. 테스팅 타입의 함정에 주의하기

라이브러리에서 타입 선언을 제공한다면, 타입 선언에 대한 테스트도 함께 작성해야 한다.  
단순히 타입 체커의 검증만을 받는 것으로는 부족하고, dstlint와 같이 타입 시스템 외부에서 타입을 검사하는 도구를 함께 사용해서 테스트를 작성하면 좋다.

예를 들어 유틸리티 라이브러리에서 제공하는 map 함수에 대한 타입 선언을 작성해보자.  
이 때 타입 선언이 예상한 타입으로 결과를 내는지 확인하는 가장 쉬운 방법은 함수를 호출하는 테스크 파일을 작성하는 것이다.  
하지만 이를 통해 매개변수의 타입에 대한 오류는 잡을 수 있어도, 반환값의 타입 오류는 잡을 수 없다.

```ts
declare function map<U, V>(array: U[], fn: (u: U) => V): V[];

map(["2017", "2018", "2019"], (v) => Number(v));
```

반환값을 특정한 타입의 변수에 할당하는 코드를 작성하여 반환 타입을 체크하는 것이 가능하다.  
이렇게 하면 반환 타입 체크가 가능하긴 하지만, 불필요한 변수가 선언된다는 문제점이 있다.  
이 방법 대신 타입을 체크하는 헬퍼 함수를 이용하면 변수를 만들지 않고도 타입 체크가 가능하다.

```ts
// 특정 타입의 변수에 할당
const lengths: number[] = map(["john", "paul"], (name) => name.length);

// 헬퍼 함수 사용
function assertType<T>(x: T) {}
assertType<number[]>(map(["john", "paul"], (name) => name.length));
```

그러나 이 경우에도 타입의 동일성을 체크하는 것이 아니라 할당 가능성을 체크하고 있다는 문제가 있다.  
헬퍼 함수의 제네릭으로 넘긴 타입이 반환 타입보다 넓은 타입이라면, 타입 체크가 제대로 되지 않았는데도 검사를 통과할 수 있다.  
아래 예시에서도 반환 타입 객체의 inYellowSubmarine 속성에 대한 체크가 누락된 상태로 통과한다.

```ts
const beatles = ["john", "paul", "george", "ringo"];
assertType<{ name: string }[]>(
  map(beatles, (name) => ({
    name,
    inYellowSubmarine: name === "ringo",
  }))
); // 정상
```

함수를 검증할 때에는 더욱 문제가 된다.  
타입스크립트에서는 선언된 타입보다 매개변수가 더 적은 함수도 문제 없이 할당이 가능하다.  
따라서 위에서 정의한 assertType으로는 콜백함수의 타입을 제대로 체크할 수 없다.

```ts
const double = (x: number) => 2 * x;
assertType<(a: number, b: number) => number>(double); // 정상
```

위 케이스에서 정상적으로 타입을 검증하기 위해서는 `Parameters`와 `ReturnType`을 이용하여 매개변수와 반환 타입을 추출해서, assertType으로 검증하는 식으로 구성해야 한다.

```ts
let p: Parameters<typeof double> = null!;
assertType<[number, number]>(p);
// '[number]' 형식의 인수는 '[number, number]' 형식의 매개변수에 할당될 수 없습니다.

let r: ReturnType<typeof double> = null!;
assertType<number>(r); // 정상
```

또한 타입스크립트에서는 콜백함수의 첫번째 매개변수로 this의 타입을 지정할 수 있다.  
콜백 함수 내에서 this가 사용되는 경우에는, this의 타입에 대해서도 테스트가 이루어져야 한다.  
이를 위해서는 콜백 함수 내에서 assertType을 사용하여 this의 타입을 체크할 수 있다.

```ts
const beatles = ["john", "paul", "george", "ringo"];
declare function map<U, V>(
  array: U[],
  fn: (this: U[], u: U, i: number, array: U[]) => V
): V[];

assertType<number[]>(
  map(beatles, function (name, i, array) {
    assertType<string>(name);
    assertType<number>(i);
    assertType<string[]>(array);
    assertType<string[]>(this);

    return name.length;
  })
);
```

위와 같은 방식을 통해 일반적인 경우에 대한 타입 체크들이 가능하다.  
하지만 any 타입은 위에서 사용했던 검증 방법들을 모두 통과해버린다.  
암시적 any 타입이 코드의 곳곳에 있는 상황에서는 위의 타입 체크들이 힘을 쓰기 어렵다.

DefinitelyTyped에서는 이러한 문제에 대응하기 위해, dstlint라는 타입 검증 도구를 사용한다.  
dstlint를 사용할 떄에는 주석의 형태로 각 심벌에 대해서 기대되는 타입을 명시한다.  
이 때 타입의 할당 가능성이 아닌, 추출된 타입 자체가 글자 그대로 동일한지를 체크한다.

```ts
const beatles = ["john", "paul", "george", "ringo"];
map(
  beatles,
  function (
    name, // $ExpectType string
    i, // $ExpectType number
    array // $ExpectType string[]
  ) {
    this; // $ExpectType string[]
    return name.length;
  }
); // $ExpectType number[]
```

다만 글자 자체를 비교하기 때문에 `number|string` 과 `string|number`를 다른 타입으로 인식하므로 주의해야 한다.
