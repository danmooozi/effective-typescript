## item40. 함수 안으로 타입 단언문 감추기

- 함수의 모든 부분을 안전한 타입으로 구현하는 것이 이상적
- 불필요한 예외 상황까지 고려해 가며 타입 정보를 힘들게 구성할 필요는 없다
- 함수 내부에는 타입 단언을 사용하고 함수 외부로 드러나는 타입 정의를 정확히 명시하는 정도로 끝내는 게 낫다.

### 캐싱 함수 예제

- 함수 선언

```tsx
declare function cacheLast<T extends Function>(fn: T): T;
```

- 함수 구현체

```
declare function shallowEqual(a: any, b: any): boolean
function cacheLast<T extends Function>(fn: T): T {
  let lastArgs: any[] | null = null
  let lastResult: any
  return function (...args: any[]) {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // '(...args:any[]) => any' 형식은 'T' 형식에 할당할 수 없습니다.
    if (!lastArgs || !shallowEqual(lastArgs, args)) {
      lastResult = fn(...args)
      lastArgs = args
    }
    return lastResult
  }
}
```

- 반환문에 있는 함수와 원본 함수 T타입이 어떤 관련이 있는지 알지 못해서 발생은 오류
- 그러나 결과적으로 원본 함수 T 타입과 동일한 매개변수로 호출되고 `fn(…args)` 반환값 역시 예상한 결과가 된다.
- 따라서 타입 단언문을 추가해 오류를 제거하는 것이 큰 문제가 되지 않는다.

- 타입 단언문 추가

```tsx
function cacheLast<T extends Function>(fn: T): T {
  let lastArgs: any[] | null = null;
  let lastResult: any;
  return function (...args: any[]) {
    if (!lastArgs || !shallowEqual(lastArgs, args)) {
      lastResult = fn(...args);
      lastArgs = args;
    }
    return lastResult;
  } as unknown as T;
}
```

- any가 많이 사용되었지만, 내부에서 사용했기 때문에 외부에서는 알지 못한다.

### 구현이 복잡한 함수 예시 - shallowObjectEqual

- 타입 정의

```
declare function shallowEqual(a: any, b: any): boolean
declare function shallowObjectEqual<T extends object>(a: T, b: T): boolean
```

- 객체 a, b가 동일한 키를 가진다는 보장이 없기 때문에 구현할 때 주의 필요

```tsx
declare function shallowEqual(a: any, b: any): boolean;
function shallowObjectEqual<T extends object>(a: T, b: T): boolean {
  for (const [k, aVal] of Object.entries(a)) {
    if (!(k in b) || aVal !== b[k]) {
      // ~~~~ 'string' 형식의 식을 '{}' 인덱스 형식에 사용할 수 없으므로 요소에
      // 암시적으로 'any' 형식이 있습니다.
      //'{}' 형식에서 'string' 형식의 매개 변수가 포함된 인덱스 시그니처를 찾을 수 없습니다.
      return false;
    }
  }
  return Object.keys(a).length === Object.keys(b).length;
}
```

- k in b로 b객체에 k 속성이 있다는 것을 확인했지만, b[k] 부분에서 오류가 발생하는 것이 이상

  - 타입스크립트의 문백 활용 능력이 부족

- 타입 단언문 추가

```tsx
declare function shallowEqual(a: any, b: any): boolean;
function shallowObjectEqual<T extends object>(a: T, b: T): boolean {
  for (const [k, aVal] of Object.entries(a)) {
    if (!(k in b) || aVal !== (b as any)[k]) {
      return false;
    }
  }
  return Object.keys(a).length === Object.keys(b).length;
}
```

- 이미 확인을 했기 때문에 any로 단언하는 수밖에 없다.
- 객체가 같은지 체크하기 위해 객체 순회와 단언문이 코드에 직접 들어가는 것보다, 함수로 분리해 내는 것이 훨씬 좋은 설계
