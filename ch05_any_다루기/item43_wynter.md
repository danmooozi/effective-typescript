# 아이템 43 몽키 패치보다는 안전한 타입을 사용하기

> ⚡ 몽키패치란 런타임에 코드의 동작을 업데이트 하는 것을 말함

```js
// 예시
String.prototype.endsWith = function(suffix) {
   return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var isSuffix = 'hello world'.endsWith('ld');
```

---

```ts
> RegExp.prototype.monkey = 'Capuchin'
"Capuchin"
> /123/.monkey // /123/ 에는 추가 한 적이 없는데 들어가 있다!
"Capuchin"

// 타입 스크립트는 임의로 추가한 속성에 대해 알 수 없다.
document.monkey = 'Tamarin'; // Document 유형에 moneky 속성이 없습니다.

(document as any).monkey = 'Tamarin' // 이렇게 하면 에러는 안 난다.
(document as any).monky = 'Tamarin' // 이것도
(document as any).monkey = /Tamarin/ // 이것도
```

꼭 해야만 한다면 첫 번째 방법.
interface augmentation

```ts
interface Document {
	/** 몽키 패치 속(genus) 또는 종(species) */
	monkey: string;
}
document.monkey = 'Tamarin'
```

보강이 any보다 나은 점

* 타입이 더 안전합니다. 오타, 잘못된 타입을 오류로 표시
* 속성에 주석 가능
* 속성에 자동완성 가능
* 몽키 패치가 어떤 부분에 적용되었는지 기록이 남음

모듈의 관점에서 제대로 동작하게 하려면 global 선언을 추가해야함

```ts
export {};
declare global {
	interface Document {
		monkey: string;
	}
}
document.monkey = 'Tamarin';
```

보강 주의점

* 코드 전체적으로 적용되므로 다른 코드나 라이브러리와 분리 불가능
* 실행되는 동안 속성을 할당하면 실행 시점에 보강을 적용할 방법이 없음
  * HTML 엘리먼트를 조작할 때, 어떤 엘리먼트는 속성이 있고 어떤 엘리먼트는 속성이 없는 경우 문제

두 번째 방법.
타입 단언문

```ts
interface MonkeyDocument extends Document {
	monkey: string;
}
(document as MonkeyDocument).monkey = 'Macaque'; // Document를 건들이지 않고 확장 가능
```

요약

* 전역 변수나 돔에 데이터를 저장하지 말고, 데이터를 분리하여 사용해야합니다.
* 내장 타입에 데이터를 저장해야 하는 경우, 안전한 타입 접근법 중 하나(보강이나 사용자 정의 인터페이스로 단언)를 사용해야 합니다.
* 보강의 모듈 영역 문제를 이해해야 합니다.

## 그냥 정리

### 아이템 41 any의 진화를 이해하기

* noImplicitAny가 설정된 상태에서 변수의 타입이 암시적으로 any인 경우에 타입체커가 알아서 타입을 유추해줌

### 아이템 42 모르는 타입의 값에는 any 대신 unknown을 사용하기

* 제너릭보다는 unknown을 반환하고 사용자가 직접 단언문을 사용하거나 원하는대로 타입을 좁히도록 강제하는 것이 좋다...

### 아이템 44 타입 커버리지를 추적하여 타입 안정성 유지하기

* type-coverage로 any의 퍼센트를 알 수있다. 신기.

### 아이템 45 devDependencies에 typescript와 @types 추가하기

* 아.. 또 쉬운거네...?
