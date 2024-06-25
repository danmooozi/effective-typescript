### 1. 인덱스 시그니처

- 타입에 `인덱스 시그니처`를 명시하여 유연하게 매핑을 표현

```jsx
type Rocket = { [property: string]: string };
const rocket: Rocket = {
  name: "Falcon 9",
  variant: "v1.0",
  thrust: "4,940 kN",
}; // OK
```

`[property: string]: string`

- 키의 이름: 키의 위치만 표시하는 용도. 타입 체커에서는 사용하지 않기 때문에 무시할 수 있는 참고 정보
- 키의 타입: `string`, `number`, `symbol` 조합이어야 하지만, 보통은 string
- 값의 타입 : 어떤 것이든 가능

❗인덱스 시그니처를 사용한 타입의 네 가지 단점

1. 잘못된 키를 포함해 모든 키를 허용
   - name 대신 Name을 사용
2. 특정 키가 필요하지 않음
   - { }도 유효한 타입
3. 키마다 다른 타입을 가질 수 없다.
   - thrust는 string이 아니라 number여야 할 수 있다.
4. 언어 서비스의 도움 지원 불가.

### 2. 동적 데이터 표현 - 인덱스 시그니처 사용

- 일반적인 상황에서 열 이름이 무엇인지 미리 알 수 없다.

```jsx
function parseCSV(input: string): { [columnName: string]: string }[] {
  const lines = input.split("\n");
  const [header, ...rows] = lines;
  return rows.map((rowStr) => {
    const row: { [columnName: string]: string } = {};
    rowStr.split(",").forEach((cell, i) => {
      row[header[i]] = cell;
    });
    return row;
  });
}
```

- 열 이름을 알고 있는 특정한 상황에서는 타입을 지정하고, 미리 선언해 둔 타입으로 단언문을 사용

```jsx
function parseCSV(input: string): { [columnName: string]: string }[] {
  const lines = input.split('\n')
  const [header, ...rows] = lines
  return rows.map(rowStr => {
    const row: { [columnName: string]: string } = {}
    rowStr.split(',').forEach((cell, i) => {
      row[header[i]] = cell
    })
    return row
  })
}
interface ProductRow {
  productId: string
  name: string
  price: string
}

declare let csvData: string
const products = parseCSV(csvData) as unknown as ProductRow[]

export default {}

```

- as unknown as ProductRow[]

  - as unknown : 임시로 타입을 무시하고 다른 타입으로 캐스팅하는 방법
  - 이후, 다시 원하는 타입으로 명시적으로 변환

- 선언해 둔 동적 데이터들이 런타임에 실제로 일치한다는 보장 x → undefined 추가

```jsx
function safeParseCSV(
  input: string
): { [columnName: string]: string | undefined }[] {
  return parseCSV(input);
}

for (const row of safeRows) {
  if (row.productId) {
    // 모든 열의 undefined 확인 필요
    prices[row.productId] = Number(row.price);
  }
  // ~~~~~~~~~~~~~ Type 'undefined' cannot be used as an index type
}
```

### 3. 동적 데이터 표현 - 가능한 필드가 제한되어 있는 경우

- 어떤 타입에 가능한 필드가 제한되어 있는 경우라면 인덱스 시그니처로 모델링하지 말아야 한다.

```jsx
interface Row1 {
  [column: string]: number
} // Too broad

interface Row2 {
  a: number
  b?: number
  c?: number
  d?: number
} // Better

type Row3 =
  | { a: number }
  | { a: number; b: number }
  | { a: number; b: number; c: number }
  | { a: number; b: number; c: number; d: number }
```

1. **Record를 사용하는 방법**

- Record는 키 타입에 유연성을 제공하는 제너릭 타입

```jsx
type Vec3D = Record<"x" | "y" | "z", number>;
// Type Vec3D = {
//   x: number;
//   y: number;
//   z: number;
// }
```

1. **매핑된 타입 사용**

```jsx
type Vec3D = { [k in 'x' | 'y' | 'z'] : number };

type Vec3D = { [k in 'a' | 'b' | 'c' ]: k extends 'b'? string:number};
```

**조건부 타입 (extends 키워드 사용)**

k extends 'b' ? string : number 부분에서는 TypeScript의 조건부 타입을 사용합니다. 이는 다음과 같이 해석됩니다:

• k extends 'b': 만약 k가 'b'와 같은 문자열 리터럴 타입을 가지면,

• string: 속성의 타입을 string으로 정의합니다.

• number: 그렇지 않으면 속성의 타입을 number로 정의합니다.
