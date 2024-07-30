# 37. 공식 명칭에는 상표를 붙이기

상표 기법을 사용하면 타입 시스템의 타입 체크에서도 런타임 값을 확인하는 것과 동일한 효과를 가질 수 있다.  
예를 들어 구조적 타이핑으로 인해 기존에는 x, y 값만 가지는 Vector2D 타입에 x, y, z 값을 가지는 데이터는 할당하는 것이 가능했다.  
이 때 `_brand` 속성에 Vector2D를 구분하는 상표를 지정하여, vec2D 메서드를 거치지 않은 데이터는 할당할 수 없도록 막을 수 있다.  
물론 임의로 `_brand` 속성을 할당하는 악의적인 사용을 막을 수는 없지만, 실수는 방지할 수 있다.

```ts
interface Vector2D {
  _brand: "2d";
  x: number;
  y: number;
}

function vec2D(x: number, y: number): Vector2D {
  return { x, y, _brand: "2d" };
}

function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x * p.x + p.y * p.y); // 기존과 동일합니다
}

calculateNorm(vec2D(3, 4)); // 정상, 5를 반환합니다

const vec3D = { x: 3, y: 4, z: 1 };
calculateNorm(vec3D); // '_brand' 속성이 ... 형식에 없습니다
```

추가 속성을 붙일 수 없는 number, string 같은 기본 타입에 상표를 붙이는 것도 가능하다.  
다음 예제의 AbsolutePath는 string 타입인 동시에 `_brand` 속성을 가져야 한다.  
임의로 이러한 데이터를 생성하는 것은 불가능하며, 타입 가드인 isAbsolutePath를 거쳤을 때에만 AbsolutePath 타입으로 변환할 수 있다.  
이를 통해 listAbsolutePath 메서드에서 반드시 절대 경로 검증을 거친 값들만 받을 수 있도록 강제할 수 있다.

```ts
type AbsolutePath = string & { _brand: "abs" };

function isAbsolutePath(path: string): path is AbsolutePath {
  return path.startsWith("/");
}

function listAbsolutePath(path: AbsolutePath) {
  // ...
}

function f(path: string) {
  if (isAbsolutePath(path)) {
    listAbsolutePath(path);
  }
  listAbsolutePath(path);
  // 'string' 형식의 인수는 'AbsolutePath' 형식의 매개변수에 할당될 수 없습니다.
}
```

물론 이 경우에도 `path as AbsolutePath` 처럼 타입 단언을 하는 경우는 막을 수 없다.  
상표 기법을 사용하는 부분에서 에러가 발생하면 타입 단언을 하는 대신, 타입 가드를 거치는 식으로 변경해야 한다.

상표 기법을 사용하면 타입 시스템에서 표현할 수 없는 특성들을 모델링할 수 있다.  
예를 들어 이진 검색 메서드에서 매개변수로 정렬된 배열을 받아야 하는 제약 사항이 있다고 하자.  
데이터가 정렬 되었는지를 체크하는 타입 가드를 작성하여 다음과 같이 구성할 수 있다.  
이제 binarySearch 메서드는 정렬 되었음을 검증한 배열만 매개변수로 받게 된다.

```ts
type SortedList<T> = T[] & { _brand: "sorted" };

function isSorted<T>(xs: T[]): xs is SortedList<T> {
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] < xs[i - 1]) {
      return false;
    }
  }
  return true;
}

function binarySearch<T>(xs: SortedList<T>, x: T): boolean {
  // ...
}
```

number 타입에도 상표를 붙이는 것이 가능은 하지만, 산술 연산을 거치면 상표가 없어지기 때문에 실제로 사용하기에는 제약이 있다.  
여러 단위가 혼합되어 존재하는 경우에 숫자 단위를 문서화하는 용도로 사용할 수 있다.

```ts
type Meters = number & { _brand: "meters" };
type Seconds = number & { _brand: "seconds" };

const meters = (m: number) => m as Meters;
const seconds = (s: number) => s as Seconds;

const oneKm = meters(1000); // 타입이 Meters
const oneMin = seconds(60); // 타입이 Seconds
```
