# 아이템 21 타입넓히기

정적 분석 시점에 변수는 ‘가능한’ 값들의 집합인 타입을 가집니다. 명시하지 않으면 타입체커가 알아서 합니다.

그래서 변수를 이래저래 사용하다보면 가능한 값들을 유추하는 것을 ‘넓히기(widening)’ 이라고 합니다.

```tsx
interface Vector3 {
  x: number;
  y: number;
  z: number;
}
function getComponent(vector: Vector3, axis: "x" | "y" | "z") {
  return vector[axis];
}

let x = "x"; <- let 이기 때문에
let vec = { x: 1, y: 2, z: 3 };
getComponent(vec, x);
                  // ~ 'string' 형식의 인수는 '"x"|"y"|"z" 
                  // 형식의 매개변수에 할당될 수 없습니다.
```

레전드 나는 된다고 생각했는데, 타입이 string 이고 내용이 x,y,z 가 아닐 수 있으니 에러가 난다.

```tsx
const mixed = ['x', 1];
```

은 다음과 같이 추론이 가능하다고 한다.

- (’x’ | 1 )[]
- [’x’, 1]
- [string, number]
- readonly [string, number]
- (string|number) [] ← 내가 해봤을때는 얘로 됨.
- readonly ( string| number) []
- [any, any]
- any[]

그래서 어떻게 하면 넓히기를 잘 컨츄롤 할 수 있을까 ?

1. `const` 로 하기 ( object 같은게 있어서 매사 다 되는건 아님 )

```tsx
const x = 'x' // 타입이 "x" 가 됨
let vec = { x: 10, y: 20, z:30 };
getComponent(vec,x); // 정상
```

1. 명시적으로 선언하기 👍
2. 타입 체커에 문맥을 통한 ( 26과의 나옴, 아마 if 나 다른 함수 지나가면서 나오는 것들을 의미하는 것 같음 ) 

마지막으로 `as cons`를 작성하면 최대한 좁은 타입으로 추론합니다.

## 아이템 22 타입 좁히기

if 같은 걸로 분기 태워서 하는거, 나도 이런거 좋아하긴 함.

함수 만들어서 하는것도 좋은거 같음.

## 아이템 23 한꺼번에 객체 생성하기

인정이긴 한데, 전개 연산자를 이용해서 객체를 큰걸로 옮겨 가는 것도 좋은듯

## 아이템 24 일관성 있는 별칭 사용하기

별칭 꼭 써야하나 ?..

## 아이템 25 비동기 코드에는 콜백 대신 async 함수 사용하기

?? ??? 이게 왜 이책에서 ??
