## 앞장 그냥 정리

### 아이템6 편집기를 사용하여 타입 시스템 탐색하기

> 💡 튜플타입?
> 길이와 각 요소마다의 타입이 고정된 배열 타입
> 그러나 push를 통해 길이를 늘려버릴 수 있는데, readonly로 방어 가능.

* 이 장은 그냥 IDE를 통해 사용할 수 있는 기능들에 대해 소개

### 아이템7 타입이 값들의 집합이라고 생각하기

* 가장 작은 집합은 아무 타입도 포함하지 않는 공집합, never 타입

* 한 가지 값만 포함하는 타입, 리터럴 타입
  * `type A = 'A'`

* 두 개 혹은 세 개로 묶으면 유니온 타입

* 튜플 타입은 length 체크도 하는듯?

* ❓ A & B가 A와 B의 속성을 모두 가지는 건데 왜 교집합으로 표현이 되는 걸까..?

## 아이템8 타입 공간과 값 공간의 심벌 구분하기

* 타입스크립트의 심벌은 타입 공간이나 값 공간 중의 한 곳에 존재합니다.

```ts
interface Cylinder { radius: number; height: number; }
const Cylinder = (radius: number, height: number) => ({ readius, height });

function calculateVolume(shape) {
    if(shape instanceof Cylinder) { shape.radius }
}
```

* 위 코드에서 shape가 Cylinder 타입인지 체크하려고 했으나, 함수를 참조 하기 때문에 에러

* 타입과 값 구분법
  * const, let, var 선언에 쓰이는 것은 값
  * 타입 선언(`:`), 단언문(`as`) 다음에 나오는 심벌은 타입, `=` 다음에 나오는 것은 값
  * class, enum은?
  * 클래스는 타입으로 쓰일 때는 형태(속성과 메서드)가 사용되고 값으로 쓰일 때는 생성자가 사용됨

```ts
class Cylinder {
    radius=1;
    height=1;
}
function calculateVolume(shape) {
    if (shape instanceof Cylinder) {
        console.log(shape, shape.radius);
    }
}
```

* typeof는 타입에서 쓰일 때와 값에서 쓰일 때 다른 기능
  * 타입에 할당하면 타입을 반환
  * 값에 할당하면 런타임 타입 반환
    * 자스의 런타임 타입은 단 6개
    * `string` `number` `boolean` `undefined` `object` `function`

```ts
const p:Person = { first: 'hi' }
type T1 = typeof p; // Person
const v1 = typeof p; // object
```

* 참고로 class를 타입에 할당할 때는, `type C = InstanceType<typeof Cylinder>;` 를 해야 typeof cylinder 아니라 바로 cylinder타입이 할당됨.

* 속성 접근자 `[]`는 타입에서도 동일 동작.
  * `obj['field']`와 `obj.field`의 값이 동일하더라도 타입은 다를 수 있으므로 첫 번째 방법 이용하기.
* 왜 점 표기법은 사용하면 안 되지?
  * 실제로 써 보면, '네임스페이스'가 아니라는 에러가 뜬다.
  * 이 네임스페이스는 객체일 뿐이어서 선언하면 dot 과 braket모두 사용가능하다.
  * 근데 이건 지금 레거시로 간주되고 있는 기능이고, 대괄호 표기법은 2016년에 도입된 기능이다.
  * 타스는 같은 기능을 수행하는 데에 필요한 문법을 최소화하려고 했고, 그래서 대괄호 표기법만 선택.
  * 왜 둘 다 선택하지 않았을까?
  * 대괄호 표기법이 더 유연해서. 예시는 아래 링크 참고.
  * [왜 타입스크립트에서 점 표기법을 쓰면 안 되나요?](https://www.totaltypescript.com/why-you-cant-use-dot-notation-on-types)

* this: 자스의 this / 다형성 this

* & , I: 비트연산 / 인터섹션, 유니온 타입

* const: 변수 선언 / as const 리터럴

## 뒷장 그냥 정리

### 아이템9 타입 단언보다는타입 선언을 사용하기

* 타입 단언으로는 타스가 타입 체크할때 오류를 뱉지 않음

* 타입 단언이 꼭 필요한 경우는 DOM 엘리먼트를 이용할 때.

### 아이템10 객체 래퍼 타입 피하기

* 기본형 타입 `string` `number` `boolean` `null` `undefined` `symbol` `bigint`

* 기본형 타입의 변수로 메서드를 이용할 때, 자스는 기본형을 객체로 래핑하고 메서드를 호출하고 마지막에 래핑한 객체를 버림.
