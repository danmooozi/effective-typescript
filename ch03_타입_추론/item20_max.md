### 1. 변수 재사용

- 자바스크립트에서는 한 변수(`id`)를 다른 목적(`number`)을 가지는 다른 타입으로 재사용해도 된다.

```jsx
function fetchProduct(id: string) {}
function fetchProductBySerialNumber(id: number) {}
let id = "12-34-56";
fetchProduct(id);

id = 123456;
// ~~ '123456' is not assignable to type 'string'.
fetchProductBySerialNumber(id);
// ~~ Argument of type 'string' is not assignable to
//    parameter of type 'number'

export default {};
```

- 하지만 타입스크립트에서는 두 가지 오류가 발생
  1. 타입스크립트는 값을 보고 `string`으로 추론 → 변수의 값은 변경되어도 타입은 바뀌지 않는다.
  2. number 타입의 매개변수에 string 할당 불가

### 2. 유니온 타입으로 타입 지정

```jsx
function fetchProduct(id: string) {}
function fetchProductBySerialNumber(id: number) {}
let id: string | number = "12-34-56";
fetchProduct(id);

id = 123456; // OK
fetchProductBySerialNumber(id); // OK

export default {};
```

- 이제 에러는 발생하지 않음
- 하지만, 유니온 타입은 사용할 때마다 값이 어떤 타입인지 확인해야 한다.
- 차라리 별도의 변수 도입이 낫다.

```jsx
function fetchProduct(id: string) {}
function fetchProductBySerialNumber(id: number) {}
const id = "12-34-56";
fetchProduct(id);

const serial = 123456; // OK
fetchProductBySerialNumber(serial); // OK

export default {};
```

### 3. 별도의 변수 선언

- 장점
  - 서로 관련 없는 두 개의 값 분리
  - 변수명 구체화
  - 타입 추론 향상, 타입 구문 불필요
  - 타입이 좀 더 간결
  - let 대신 const 사용

### 4. 가려지는(shadowed) 변수

```jsx
function fetchProduct(id: string) {}
function fetchProductBySerialNumber(id: number) {}
const id = "12-34-56";
fetchProduct(id);

{
  const id = 123456; // OK
  fetchProductBySerialNumber(id); // OK
}

export default {};
```

- 가려지는 변수
  - 상위 스코프와 이름이 동일한 변수
- 이 경우에는 서로 아무런 관계가 없다.
  - 하지만, 동일한 변수명에 타입이 다르다면, 타입스크립트 코드는 잘 동작해도 혼란을 줄 수 있다.
  - 가려지는 변수를 사용하지 못하게 하는 린트 규칙을 적용
