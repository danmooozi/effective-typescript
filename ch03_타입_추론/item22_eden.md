# 22. 타입 좁히기

타입 좁히기는 넓은 타입에서 더 좁은 타입으로 바꿔서 추론하는 것을 의미한다.

## 타입을 좁히는 방법

보통 분기문을 통해서 타입을 좁히는 과정이 진행되는데, 대표적인 예시가 null 체크이다.  
아래 예시에서는 null 체크를 통해 HTMLElement로 타입을 좁힐 수 있었다.

```ts
const el = document.getElementById("foo"); // HTMLElement | null
if (el) {
  el; // HTMLElement
} else {
  el; // null
}
```

분기문 안에서 예외를 던지거나 값을 return 하면 분기문 밖의 타입에도 영향을 줄 수 있다.  
아래 예시에서는 el이 null일 경우 예외를 던져서, 분기문 밖에서의 타입이 HTMLElement가 될 수 있게 했다.

```ts
const el = document.getElementByld("foo"); // HTMLElement | null
if (!el) throw new Error("Unable to find #foo");
el; // HTMLElement
```

null 체크 이외에도 다양한 방법으로 타입을 좁힐 수 있다.  
다음 예시에서는 instanceof를 사용하여 RegExp로 타입을 좁혔다.

```ts
function contains(text: string, search: string | RegExp) {
  if (search instanceof RegExp) {
    search; // 타입이 RegExp
    return !!search.exec(text);
  }
  search; // 타입이 string
  return text.includes(search);
}
```

속성 체크로도 타입을 좁힐 수 있다.  
각 타입을 구분하는 속성을 체크하여 타입을 좁힌다.

```ts
interface A {
  a: number;
}
interface B {
  b: number;
}

function pickAB(ab: A | B) {
  if ("a" in ab) {
    ab; // 타입이 A
  } else {
    ab; // 타입이 B
  }
}
```

Array.isArray와 같은 내장 함수로도 타입을 좁힐 수 있다.  
아래의 예시에서는 terms의 타입을 좁혀서, string일 경우 배열로 감싸게 하여 일관되게 string[] 타입을 가지게 했다.

```ts
function contains(text: string, terms: string | string[]) {
  const termList = Array.isArray(terms) ? terms : [terms];
  termList; // 타입이 string []
  // ...
}
```

## 타입 좁히기에서 하기 쉬운 실수들

타입 관련 오류를 범하면 타입 좁히기를 실패할 수 있다.  
예를 들어 null 체크를 위해 typeof가 object인 조건으로 거르면, null도 마찬가지로 object이기 때문에 타입이 좁혀지지 않는다.

```ts
const el = document.getElementById("foo"); // HTMLElement | null
if (typeof el === "object") {
  el; // HTMLElement | null
}
```

기본형 타입을 오인해서 타입 좁히기에 실패하는 경우도 많다.  
예를 들어 number|string|null 타입에 대해서 false 체크를 해도, 자바스크립트에서는 0과 ''도 false로 간주되어 타입이 좁혀지지 않는다.

```ts
function foo(x?: number | string | null) {
  if (!x) {
    x; // string | number | null
  }
}
```

## 태그된 유니온 기법

타입을 보다 명시적으로 좁히기 위해, 각 타입에 태그를 붙여서 구분할 수 있다.  
다음 예제에서는 UploadEvent와 DownloadEvent가 type 태그로 구분되고 있다.  
이 둘을 유니온한 AppEvent의 경우 type 값을 기준으로 각 타입으로 좁히기를 할 수 있다.

```ts
interface UploadEvent {
  type: "upload";
  filename: string;
  contents: string;
}
interface DownloadEvent {
  type: "download";
  filename: string;
}
type AppEvent = UploadEvent | DownloadEvent;

function handleEvent(e: AppEvent) {
  switch (e.type) {
    case "download":
      e; // 타입이 DownloadEvent
      break;
    case "upload":
      e; // 타입이 UploadEvent
      break;
  }
}
```

## 커스텀 타입 가드

타입스크립트가 타입을 식별할 수 있도록 돕기 위해 직접 타입 가드를 정의할 수도 있다.  
아래 예제에서 isInputElement의 반환 타입은 `el is HTMLInputElement`로 정의되어, 반환 값이 true인 경우 el의 타입이 HTMLInputElement로 좁혀진다.

```ts
function isInputElement(el: HTMLElement): el is HTMLInputElement {
  return "value" in el;
}

function getElementcontent(el: HTMLElement) {
  if (isInputElement(el)) {
    el; // HTMLInputElement
    return el.value;
  }
  el; // HTMLElement
  return el.textContent;
}
```

때로는 타입 가드를 사용해야 배열, 객체 등의 타입을 좁힐 수 있는 경우가 있다.  
예를 들어 `(string|undefined)[]` 타입의 배열을 `string[]`으로 좁힐 때에는 filter 메서드를 그대로 사용하는 것만으로는 부족하다.  
타입 가드로 해당 로직을 감싸서 명시적으로 타입 체커에 정보를 줘야 한다.

```ts
const jackson5 = ['Jackie', 'Tito', undefined, 'Marlon', undefined]；

function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}
const members1 = jackson5.filter(who => who !== undefined) // (string|undefined)[]
const members2 = jackson5.filter(isDefined); // string[]
```
