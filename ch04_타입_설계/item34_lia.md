# 아이템34. 부정확한 타입보다는 미완성 타입을 사용하기

> 실수가 발생하기 쉽고 잘못된 타입은 차라리 타입이 없는 것보다 못할 수 있다.
> 따라서, 타입 선언의 정밀도를 높이는 일에는 주의를 기울여야 한다.

예제1)

```ts
// 또 이상한 예제;
// 아이템31에서 나온 GeoJSON 형식의 타입 선언을 작성한다고 가정하자
// GeoJSON 정보는 각각 다른 형태의 좌표 배열을 가지는 몇 가지 타입 중 하나가 될 수 있음
interface Point {
	type: "Point";
	coordinates: number[];
}
interface LineString {
	type: "LineString";
	coordinates: number[][];
}
interface Polygon {
	type: "Polygon";
	coordinates: number[][][];
}
type Geometry = Point | LineString | Polygon; // 다른 것들도 추가될 수 있음

// 사소한 문제) 좌표에 쓰이는 number[] 가 약간 추상적임. -> 경도와 위도를 나타내므로 튜플 타입으로 선언하는게 나음
type GeoPosition = [number, number];
interface Point {
	type: "Point";
	coordinates: GeoPosition;
}
// ...
// 타입을 더 구체적으로 개선해서 좀 더 나은 코드가 됨

// 코드에는 위도와 경도만 명시했지만, GeoJSON의 위치 정보에는 세번째 요소인 고도가 있을 수 있고 또 다른 정보가 있을 수도 있음
// 문제) 타입 선언을 세밀하게 만들고자 했지만 시도가 너무 과했고 오히려 타입이 부정확해짐
// -> 현재의 타입 선언을 그대로 사용하려면 타입 단언문을 도입하거나 as any 를 추가해서 타입체커를 무시해야함
```

예제2)

```ts
// 더 이상한 예제;

// 입력값의 전체 종류
// 1. 모두 허용
// 2. 문자열, 숫자, 배열 허용
// 3. 문자열, 숫자, 알려진 함수 이름으로 시작하는 배열 허용
// 4. 각 함수가 받는 매개변수의 개수가 정확한지 확인
// 5. 각 함수가 받는 매개변수의 타입이 정확한지 확인
??

// 1, 2
type Expression1 = any;
type Expression2 = number | string | any[];

// 표현식의 유효성 체크하는 테스트 세트
// 타입을 구체적으로 만들수록 정밀도가 손상되는 것 방지(아이템52)
const tests: Expression2[] = [
	10,
	"red",
	true,
  //~~~~ 'true' 형식은 'Expression2' 형식에 할당할 수 없습니다.
	["+", 10, 5],
	["case", [">", 20, 10], "red", "blue", "green"], // 값이 너무 많습니다.
	["**", 2, 31], // "**"는 함수가 아니므로 오류가 발생해야 합니다.
	["rgb", 255, 128, 64],
	["rgb", 255, 0, 127, 0] // 값이 너무 많습니다.
];

// 3 확인
// 정밀도를 끌어 올리기 위해 튜플의 첫 번째 요소에 문자열 리터럴 타입의 유니온 사용
type FnName = '+' | '-' | '*' | '/' | '>' | '<' | 'case' | 'rgb';
type CallExpression = [FnName, ...any[]];
type Expression3 = number | string | CallExpression;

const tests: Expression3[] = [
	10,
	"red",
	true,
  //~~~~ 'true' 형식은 'Expression3' 형식에 할당할 수 없습니다.
	["+", 10, 5],
	["case", [">", 20, 10], "red", "blue", "green"],
	["**", 2, 31],
  //~~~~~~~~~~~~~~ "**" 형식은 'FnName' 형식에 할당할 수 없습니다.
	["rgb", 255, 128, 64],
];
// 정밀도를 유지하면서 오류를 하나 더 잡음

// 4
// 타입스크립트 3.6에서는 함수의 매개변수 개수를 알아내기 위해 최소한 하나의 인터페이스를 추가해야 함
// 여러 인터페이스를 호출 표현식으로 한번에 묶을 수 없기에, 각 인터페이스를 나열해서 호출 표현식을 작성
type Expression4 = number | string | CallExpression;
type CallExpression = MathCall | CaseCall | RGBCall;
interface MathCall {
	0: '+' | '-' | '/' | '*' | '>' | '<';
	1: Expression4;
	2: Expression4;
	length: 3;
}
interface CaseCall {
	0: 'case';
	1: Expression4;
	2: Expression4;
	3: Expression4;
	length: 4 | 6 | 8 | 10 | 12 | 14 | 16 // 등등
}
interface RGBCall {
	0: 'rgb';
	1: Expression4;
	2: Expression4;
	3: Expression4;
	length: 4;
}
const tests: Expression4[] = [
	10,
	"red",
	true,
   //~~~~ 'true' 형식은 'Expression4' 형식에 할당할 수 없습니다.
	["+", 10, 5],
	["case", [">", 20, 10], "red", "blue", "green"],
		  // ~~~~~~~~~~~~~ '["case", [">", ...], ...]' 형식은 'string' 형식에 할당할 수 없습니다.
	["**", 2, 31],
  //~~~~~~~~~~~~~~ "**" 형식은 'FnName' 형식에 할당할 수 없습니다.
	["rgb", 255, 128, 64],
	["rgb", 255, 128, 64, 73]
		//  ~~~  ~~~  ~~  ~~ 'number' 형식은 'string' 형식에 할당할 수 없습니다.
];
// 오류) 무한한 표현식에서 전부 오류
// 타입 정보가 더 정밀해졌지만 잘못 사용된 코드에서 발생한 오류 메시지는 더 난해해짐

// 새 타입 선언은 더 구체적이지만 자동 완성을 방해하므로 타입스크립트 개발 경험을 해치게 됨
```

→ 타입을 정제할 때 ‘불쾌한 골짜기’ 은유 생각.
;어설프게 인간과 비슷한 로봇에서 느끼는 불쾌감 뜻함. 타입 선언에서 어설프레 완벽을 추구하려다가 오히려 역효과가 발생하는 것을 주의하자

- 일반적으로 any 같은 매우 추상적인 타입은 정제하는 것이 좋음
- 그러나, 타입이 구체적으로 정제된다고 해서 정확도가 무조건 올라가지는 않음. 타입에 의존하기 시작하면 부정확함으로 인해 발생하는 문제가 더 커질 것
