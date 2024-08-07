# 아이템44. 타입 커버리지를 추적하여 타입 안정성 유지하기

noImplicitAny를 설정하고 모든 암시적 any 대신 명시적 타입 구문을 추가해도 any 타입과 관련된 문제들로부터 안전하다고 할 수 없음.

any 타입이 여전히 프로그램 내에 존재할 수 있는 두 가지 경우가 있음

- 명시적 any 타입
  아이템 38과 아이템 39의 내용에 따라 any 타입의 범위를 좁히고 구체적으로 만들어도 여전히 any 타입임. 특히 `any[]`와 `{[key : string] : any}` 같은 타입은 인덱스를 생성하면 단순 any가 되고 코드 전반에 영향을 미침.
- 서드파티 타입 선언
  @types 선언 파일로부터 any 타입이 전파되기 때문에 특별히 조심해야 함. noImplicityAny 를 설정하고 절대 any를 사용하지 않았다 하더라도 여전히 any 타입은 코드 전반에 영향을 미침

⇒ any 타입은 타입 안정성과 생산성에 부정적 영향을 미칠 수 있으므로, 프로젝트에서 any 의 개수를 추적하는 것이 좋음.

npm 의 type-coverage 패키지를 활용하여 any 를 추적할 수 있는 몇 가지 방법

```tsx
$ npx type-coverage
9985 / 10117 98.69%

// 프로젝트의 10,117개 심벌 중 9,985개(98.69%)가 any가 아니거나 any의 별칭이 아닌 타입을 가지고 있음. 실수로 any 타입이 추가된다며느 백분율이 감소하게됨.
```

```tsx
$ npx type-coverage --detail
path/to/code.ts:1:10 getColumnInfo
path/to/module.ts:7:1 pt2
...
// --detail 플래그를 붙이면, any 타입이 있는 곳을 모두 출력해줌
```

코드에 any가 남아 있는 이유는 다양함.

- 오류를 간단히 해결하기 위해 종종 명시적으로 any를 선언했을 수 있음
- 타입 오류가 발생했지만 해결하는 데 시간을 쏟고 싶지 않았을 수도 있음
- 아직까지 타입을 제대로 작성하지 못했을 수도 있음
- 급하게 작업하느라 any인 채로 나두었을 수도 있음

---

any가 등장하는 몇 가지 문제와 그 해결책

```tsx
// 표 형태의 데이터에서 어떤 종류의 열(column) 정보를 만들어 내는 함수를 만든다고 가정
function getColumnInfo(name: string): any {
	return utils.buildColumnInfo(appState.dataSchema, name); // any를 반환합니다.
}

// utils.buildColumnInfo 호출은 any를 반환함. 그래서 getColumnInfo 함수의 반환에는 주석과 함께 명시적으로 : any 구문을 추가함

// 문제) 이후에 타입 정보를 추가하기 위해 ColumnInfo 타입을 정의하고 utils.buildColumnInfo 가 any 대신 ColumnInfo를 반환하도록 개선해도 getColumnInfo 함수의 반환문에 있는 any 타입이 모든 타입 정보를 날려버리게 됨
// 해결책) getColumnInfo 에 남아있는 any까지 제거해야 문제가 해결됨.
```

---

서드파티 라이브러리로부터 비롯되는 any 타입은 몇 가지 형태로 등장할 수 있음.

가장 극단적인 예는 전체 모듈에 any 타입을 부여하는 것임

```tsx
declare module "my-module";
// my-module 에서 어떤 것이든 오류 없이 임포트할 수 있음
// 임포트한 모든 심벌은 any 타입이고, 임포트한 값이 사용되는 곳마다 any 타입을 양산하게 됨

import { someMethod, someSymbol } from "my-module"; // 정상

const pt1 = {
	x: 1,
	y: 2,
}; // 타입이 {x: number, y: number}
const pt2 = someMethod(pt1, someSymbol); // 정상, pt2의 타입이 any

// 일반적인 모듈의 사용법과 동일하기 때문에, 타입 정보가 모두 제거됐다는 것을 간과할 수 있음
```

다른 형태,

타입에 버그가 있는 경우. ..

→ 타입 커버리지를 추적하면 이러한 부분들을 쉽게 발견할 수 있기 때문에 코드를 꾸준히 점검할 수 있게 해줌
