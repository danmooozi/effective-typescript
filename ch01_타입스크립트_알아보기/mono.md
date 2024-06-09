# TypeScript

## 아이템 1. 타입스크립트와 자바스크립트의 관계 이해하기

- 타입스크립트는 자바스크립트의 슈퍼셋
- 타입을 명시함으로써 타입을 확인함으로써 정적 타입언어 처럼 동작할 수 있게함
    - 결과적으로 그러한 척을 하는거지. 실제 런타임에서 그렇게 작동하지는 않음
    - 정적 타입언어의 타입에 따른 데이터 크기 같은 아름다움은 부족하다고 생각함
    - 코드의 복잡도를 올리는 액션이지만, 대규모 개발에서 사람들이 놓칠 수 있는 부분을 많이 줄여주기 때문에 개인적으로는 대규모 프로젝트에 어울리는 자바스크립트 슈퍼셋이라고 생각한다.
- TypeScript 공식 LSP
    - https://github.com/microsoft/TypeScript/wiki/Standalone-Server-(tsserver)

- 예시 TypsScript 코드 → 전환한 코드
    - 보시다시피 그렇게 큰 의미 없다.

```tsx
type buger = {
  빵: number;
  패티: string;
  야채: string[];
  소스: boolean;
};

const 빅맥: buger = {
  빵: 3,
  패티: "쇠고기",
  야채: ["양상추", "토마토", "양파"],
  소스: true,
};

console.log(빅맥);
```

```jsx
var 빅맥 = {
    빵: 3,
    패티: "쇠고기",
    야채: ["양상추", "토마토", "양파"],
    소스: true
};
console.log(빅맥);
```

- Webpack 으로 말면 조금 결과가 다름
    - 번들링 하는게 추가되어서 그럼

---

내주제 아닌것들

## 아이템 2. 타입스크립트 설정 이해하기

- tsconfig.json 을 사용하도록 하자.
    - https://www.typescriptlang.org/docs/handbook/tsconfig-json.html
- https://www.typescriptlang.org/ko/tsconfig/
    - 책에서 소개한 `noImplicitAny` 에 대한 Config 설명
    
    ```tsx
    // 타입이 표기되어 있지 않아, 타입 추론을 할 수 없을 때 TypeScript는 해당 변수의 타입을 `any`로 대체합니다.
    // 이것으로 인해 일부 오류가 누락될 수 있습니다. 예를 들면:
    function fn(s) {
      // 오류가 아닌가요?
      console.log(s.subtr(3));
    }
    fn(42);
    // 그러나 noImplicitAny를 활성화하면 TypeScript는 any를 추론 할 때마다 오류를 발생시킵니다:
    function fn(s) {
    // Parameter 's' implicitly has an 'any' type.
      console.log(s.subtr(3));
    }
    ```
    
    - `strictNullChecks`
    
    ```tsx
    /*
    strictNullChecks가 false일 때 null과 undefined는 언어에 의해 무시됩니다. 
    그러면 런타임에 예기치 않은 오류가 발생할 수 있습니다.
    
    strictNullChecks가 true일 때 null과 undefined는 고유한 유형을 가지며 특정 값이 예상되는 곳에서 사용하려고 하면 유형 오류가 발생합니다.
    
    예를 들어, 이 TypeScript 코드의 경우 users.find가 실제로 사용자를 찾을 것이라는 보장은 없지만 다음과 같이 코드를 작성할 수 있습니다:
    */
    declare const loggedInUsername: string;
     
    const users = [
      { name: "Oby", age: 12 },
      { name: "Heera", age: 32 },
    ];
     
    const loggedInUser = users.find((u) => u.name === loggedInUsername);
    console.log(loggedInUser.age);
    
    /*
    strictNullChecks를 true로 설정하면 loggedInUser가 존재하는지 확인하지 않은 오류가 발생합니다.
    */
    
    const loggedInUser = users.find((u) => u.name === loggedInUsername);
    console.log(loggedInUser.age);
    
    // 'loggedInUser' is possibly 'undefined'.
    
    ```
    

## 아이템 3. 코드 생성과 타입이 관계없음을 이해하기

- 위에 예제 에서도 보았겠지만 타입들에 대한 동작은 에디터에서 작용한다.
- JavaScript로 만드는 컴파일러 타임때, 만드는 것은 별개

## 아이템 4. 구조적 타이핑에 익숙해지기

- 구조적 타이핑에서는 두 객체가 같은 형태와 속성을 가지고 있으면 같은 타입으로 간주됩니다. 객체의 구조만을 고려하기 때문에, 객체의 이름이나 선언 위치는 중요하지 않습니다.
- 개인적으로 타입의 확장이 열려 있는 것은 좋지만, 그렇다고 미리 만들지 않았으면 좋겠다. 필요할 때 ( 실제로 그러한 기능이 필요할 시점에 ) 만들어야 한다고 생각한다.

## 아이템 5. any 타입 지양하기

- 쓰지말자.
- 정말 알지 못 한다면, unknown 으로 받은 뒤에, 타입 추론이 가능하게 조건절로 줄여나간다.
- 차라리 자바스크립트로 짜는게 좋다. 코드를 이해하기 어렵게 글만 늘리는 일이다.