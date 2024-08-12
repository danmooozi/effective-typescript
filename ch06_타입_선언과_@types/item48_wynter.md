# 아이템 48 API 주석에 TSDoc 사용하기

```ts
// 인사말을 생성합니다. 결과는 보기 좋게 꾸며집니다.
/** 인사말을 생성합니다. 결과는 보기 좋게 꾸며집니다. */ // 이렇게 해두는 게 좋음
function greet(name: string, title: string) {
	return `Hello ${title} ${name}`;
}

// jsDoc 스타일을 쓰기 때문에 적극적으로 쓰면 좋다고 함

/** 
 * 인사말을 생성합니다.
 * @param name 인사할 사람의 이름
 * @param title 그 사람의 칭호
 * @returns 사람이 보기 좋은 형태의 인사말
 */
function greet(name: string, title: string) {
	return `Hello ${title} ${name}`;
}
// 함수 호출 부분에서 설명을 보여주기 때문에 좋음

/** 특정 시간과 장소에서 수행된 측정 */
interface Mesurement {
	/** 어디에서 측정되었나? */
	position: Vector3D;
	// ...
}
// Mesurement 객체 각 필드에 마우스를 올려 보면 필드별로 설명을 볼 수 있음

// 주석은 마크다운 형식으로 꾸며지므로 굵은 글씨, 기울임글씨, 글머리 기호 목록을 사용할 수 있음
/**
 * 이 _interface는 **세 가지** 속성을 가집니다.
 * 1. x
 * 2. y
 */
interface Vector3D {
	x: number;
	y: number;
}
```

jsdoc에는 타입 정보도 명시하지만, tsdoc에서는 타입 정보는 명시하면 안 됨.

요약

* 익스포트된 함수, 클래스, 타입에 주석을 달 때는 jsdoc/tsdoc 형태를 사용 합시다. 편집기가 주석 정보를 표시해줍니다.
* @param, @returns 구문과 문서 서식을 위해 마크다운을 사용할 수 있습니다.
* 주석에 타입 정보를 포함하면 안 됩니다.

## 그냥 정리

### 아이템 46 타입 선언과 관련된 세 가지 버전 이해하기

* TODO 타입 포함된 라이브러리와 따로 제공하는 경우에 대해 더 공부해놓으면 좋을듯

### 아이템 47 공개 API에 등장하는 모든 타입을 익스포트하기

* 굳이 Parameters나 ReturnType같은 거 쓰게 하지 말고 공개되는 거면 다 export 해주기

### 아이템 49 콜백에서 this에 대한 타입 제공하기

* TODO this 바인딩 더 공부하기..

### 아이템 50 오버로딩 타입보다는 조건부 타입을 사용하기

* string -> string, 리터럴 'x' -/-> 'x', 'xx'
* 함수오버로딩으로 해결 -> 유니온 타입에서 문제
* 조건부 타입 + 제네릭!