# 42. 모르는 타입의 값에는 any 대신 unknown을 사용하기

any 타입의 강력함은 어떤 타입도 any에 할당할 수 있고, 동시에 any 타입이 어떤 타입에든 할당할 수 있음에 있다.  
집합 체계에서 어떤 원소가 모든 집합의 부분 집합이면서 상위 집합일 수는 없는데, any는 이러한 원칙을 무시한다.  
타입 시스템은 집합 체계를 기반으로 동작하기 때문에, any를 사용하면 타입 체커가 무용지물이 된다.  
이와 달리 unknown은 어떤 타입이든 unknown에 할당할 수 있으나 unknown을 다른 타입에 할당하는 것은 불가능하다.  
unknwon은 집합 체계에서 유효한 타입(모든 타입의 상위 집합)으로, 타입 체커를 무효화하지 않고 활용 가능하다.

## 함수의 반환 타입으로 unknown 사용

먼저 함수의 반환 타입에 unknown을 사용하는 방식에 대해서 살펴보자.  
yaml을 파싱하여 객체를 반환하는 parseYAML 메서드를 구현한다고 할 때, 반환 타입은 어떤 yaml이 주어지는지에 따라 유동적으로 변화한다.  
이 때 반환 타입으로 any를 사용하면 타입 체커의 지원을 받을 수 없다.

```ts
function parseYAML(yaml: string): any {
  // ...
}
const book = parseYAML(`
  name: Jane Eyre
  author: Charlotte Bronte
`);
alert(book.title); // 오류 없음, book.title은 undefined
book("read"); // 오류 없음, 런타임에 "TypeError: book은 함수가 아닙니다" 예외 발생
```

반환값을 받는 book 변수의 타입을 명시적으로 지정하면 타입 체크를 받을 수 있다.  
하지만 이것이 강제되지 않기 때문에 사용자가 타입 지정을 생략하면 암시적 any 타입이 코드에 퍼져나가게 된다.

이 때 unknown을 반환 타입으로 사용하면 더욱 타입 안전하게 사용할 수 있다.  
unknown 타입의 변수는 타입을 단언하기 전까지는 속성에 접근하거나 함수로 사용하는 것이 불가능하다.

```ts
function safeParseYAML(yaml: string): unknown {
  return parseYAML(yaml);
}

const book = safeParseYAML(`
  name: The Tenant of Wildfell Hall
  author: Anne Bronte
`);
alert(book.title); // 개체가 ’unknown’ 형식입니다.
book("read"); // 개체가 'unknown' 형식입니다.
```

정상적으로 book 변수를 사용하기 위해서는 다음과 같이 타입 단언을 수행해야 한다.  
이러한 제약 사항을 통해 사용자가 명시적으로 타입을 지정하도록 강제할 수 있다.

```ts
interface Book {
  name: string;
  author: string;
}

const book = safeParseYAML(`
  name: The Tenant of Wildfell Hall
  author: Anne Bronte
`) as Book;
```

이 때 타입 단언문을 사용하는 대신 제네릭을 사용하는 것도 불가능하진 않다.  
다만 제네릭을 사용하면 기능적으로는 동일하게 동작하지만, 타입 단언 또는 검증의 책임을 감추는 문제가 있다.  
따라서 가능하면 직접 타입 단언이나 타입 좁히기를 사용하여 원하는 타입으로 변환해야 한다.

```ts
function safeParseYAML<T>(yaml: string): T {
  return parseYAML(yaml);
}

const result = safeParseYAML<Book>(`
  name: The Tenant of Wildfell Hall
  author: Anne Bronte
`);
```

## 변수 선언에 unknown 사용 하기

이번엔 변수 선언과 관련한 unknown 타입에 대해서 알아보자.  
어떠한 값이 어떤 타입을 가질지 알 수 없을 때 unknown을 사용한다.  
대표적으로 GeoJSON.Feature의 properties 속성에는 JSON 직렬화가 가능한 어떤 값이든 담을 수 있기 때문에 unknown으로 선언되었다.

```ts
interface Feature {
  id?: string | number;
  geometry: Geometry;
  properties: unknown;
}
```

메서드의 매개변수로 unknown을 사용하는 것도 가능하다.  
이 때 함수 내에서 해당 변수를 사용하기 위해서는 다른 타입으로 변환을 해야 한다.  
아래 예제에서는 매개변수로 받은 unknown 타입의 val 변수를 instanceof를 통해 다른 타입으로 좁히고 있다.

```ts
function processValue(val: unknown) {
  if (val instanceof Date) {
    val; // Date
  }
}
```

또는 타입 가드를 통해서 변수의 타입을 좁히는 것도 가능하다.  
다만 이를 위해 타입 가드 내에 많은 검증 구문을 삽입해야 한다.  
아래 예제에서는 typeof 객체 확인, null 체크, 그리고 모든 속성에 대한 체크 구문을 추가했다.

```ts
function isBook(val: unknown): val is Book {
  return (
    typeof val === "object" && val !== null && "name" in val && "author" in val
  );
}

function processValue(val: unknown) {
  if (isBook(val)) {
    val; // Book
  }
}
```

마지막으로 원하는 타입으로의 변환을 위해 unknown을 이용해 이중 타입 단언문을 사용할 수 있다.  
이 때 이 중 단언문에서 먼저 any로 변경하는 것도 가능하다.  
하지만 추후 리팩토링을 통해 이중 단언문을 불리할 수도 있음을 고려하면, 타입 시스템에 무력화하는 any 대신 unknown을 사용하는게 좋다.

```ts
declare const foo: Foo;
let barAny = foo as any as Bar;
let barUnk = foo as unknown as Bar;
```

참고로, unknown 타입이 도입되기 전에는 그 대신 `{}` 타입을 대신해서 사용하기도 했다.  
`{}`은 unknown 만큼 넓은 타입이기는 하지만 null과 undefined는 포함하지 않는다는 차이점이 있다.  
새롭게 작성하는 코드에는 의미를 명확하게 하기 위해 `{}` 대신 unknown을 사용하는 것이 적절하다.  
`object` 타입 또한 비기본형 타입만으로 구성된 타입으로, string, boolean, number 타입을 제외하기 때문에 `unknown`과 다른 용도로 쓰인다.
