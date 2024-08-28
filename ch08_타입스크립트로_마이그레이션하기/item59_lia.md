# 아이템59. 타입스크립트 도입 전에 @ts-check와 JSDoc으로 시험해 보기

본격적으로 타입스크립트로 전환하기에 앞서, **`@ts-check` 지시자를 사용하면 타입스크립트 전환시에 어떤 문제가 발생하는지 미리 시험해볼 수 있음**

`@ts-check` 지시자를 사용하여 타입 체커가 파일을 분석하고, 반결된 오류를 보고하도록 지시함.

**@ts-check 지시자 사용법**

```jsx
// @ts-check
const person = { first: "Grace", last: "Hopper" };
2 * person.first;
//  ~~~~~~~~~~~~ 산술 연산 오른쪽은 'any', 'number', 'bigint' 또는 열거형 형식이어야 함.

// person.firt 의 타입은 string 으로 추론되었고, 2 * person.first는 타입 불일치 오류가 됨.
```

→ @ts-check 지시자 덕분에 자바스크립트임에도 불구하고 타입 체크가 동작한 것

`@ts-check` 사용하면

위와 같은 타입 불일치나 함수의 매개변수 개수 불일치 같은 간단한 오류 외에도, 몇 가지 의미 있는 오류들을 찾아낼 수 있음.

**- 선언되지 않은 전역 변수**

변수를 선언할 때 보통 `let` 이나 `const` 를 사용함.

그러나 어딘가에 ‘숨어 있는’ 변수(예를 들어, HTML 파일 내의 `<script>` 태그)라면, 변수를 제대로 인식할 수 있게 별도로 **타입 선언 파일을 만들어야 함.**

```tsx
// types.d.ts

// @ts-check
console.log(user.firstName);
// ~~~~~ 'user' 이름을 찾을 수 없습니다.

// user 선언을 위해 types.d.ts 파일을 만들어 보자
interface UserData {
	firstName: string;
	lastName: string;
}
declare let user: UserData;
```

→ 타입 선언 파일을 만들면 오류가 해결됨.
선언 파일을 찾지 못하는 경우는 **‘트리플 슬래시’ 참조**를 사용하여 명시적으로 임포트할 수 있음.

```tsx
// @ts-check
/// <reference path="./types.d.ts" />
console.log(user.firstName); // 정상
```

**- 알 수 없는 라이브러리**

서트파티 라이브러리를 사용하는 경우, 서드파티 라이브러리의 타입 정보를 알아야 함.

```tsx
// 제이쿼리를 사용하여 HTML 엘리먼트의 크기를 설정하는 코드에서 @ts-check 지시자를 사용하면 제이쿼리를 사용한 부분에서 오류가 발생함.

// @ts-check
$('#graph').style({'width': '100px', 'height': '100px'});
// ~ '$' 이름을 찾을 수 없습니다.

// 제이쿼리 타입 선언을 설치하면 제이쿼리의 사양 정보를 참조하게 됨
$ npm install --save-dev @types/jquery

// 이제 오류가 제이쿼리의 사양과 관련된 내용으로 바뀜
// @ts-check
$('#graph').style({'width': '100px', 'height': '100px'});
						// ~~~~~ 'JQuery<HTMLElement>' 형식에 'style' 속성이 없습니다.

// 마지막으로 .style 메소드를 .css 로 바꾸면 오류가 사라짐.
```

→ `@ts-check` 를 사용하면 타입스크립트로 마이그레이션하기 전에 서드파티 라이브러리들의 타입 선언을 활용하여 타입 체크를 시험해 볼 수 있음.

**- DOM 문제**

웹브라우저에서 동작하는 코드라면, 타입스크립트는 DOM 엘리먼트 관련된 부분에 수많은 오류를 표시하게 될 것

```tsx
// @ts-check
const ageEl = document.getElementById("age");
ageEl.value = "12";
//  ~~~~~ 'HTMLElement' 유형에 'value' 속성이 없습니다.

// HTMLInputElement 타입에는 value 속성이 있지만, document.getElementById 는 더 상위 개념인 HTMLElement 타입을 반환하는 것이 오류의 원인임.
// 만약 #age 엘리먼트가 확실히 input 엘리먼트라는 것을 알고 있다면 타입 단언문을 사용해야 함.
// 그러나 앞의 코드는 자바스크립트 파일이므로 타입스크립트 단언문 as HTMLInputElement 를 쓸 수 없음.
// 대신 JSDoc 을 사용하여 타입 단언을 대체할 수 있음

// @ts-check
const ageEl = /** @type {HTMLInputElement} */ document.getElementById("age");
ageEl.value = "12"; // 정상

// 편집기에서 ageEl에 마우스를 올리면, 이제 HTMLInputElement 타입으로 인식하는 것을 볼 수 있음.
```

- JSDoc 의 `@type` 구문을 사용할 때는 타입을 감싸는 중괄호가 필요하다는 것을 주의하기 바람

한편, `@ts-check` 를 활성화하면 이미 존재하던 JSDoc 에서 부작용이 발생하기도 함.

**- 부정확한 JSDoc**

프로젝트에 이미 JSDoc 스타일의 주석을 사용 중이었다면, `@ts-check` 지시자를 설정하는 순간부터 기존 주석에 타입 체크가 동작하게 되고 갑자기 수많은 오류가 발생하게 될 것.

→ 차근차근 타입 정보 추가하면 됨~

```tsx
// 예) @ts-check 지시자를 설정하는 순간 두 개의 오류가 발생함

// @ts-check
/**
 * 엘리먼트의 크기(픽셀 단위)를 가져 옵니다.
 * @param {Node} el 해당 엘리먼트
 * @return {{w: number, h: number}} 크기
 */
function getSize(el) {
	const bounds = el.getBoundingClientRect();
	//  ~~~~~~~~~~~~~~~~~~~~~ 'Node' 형식에 'getBoundingClientRect' 속성이 없습니다.
	return { width: bounds.width, height: bounds.height };
	// ~~~~~~~~~~~~~~~~~~~~ '{ width: any; height: any; }' 형식은 '{ w: numbmer; h: number; }' 에 할당할 수 없습니다.
}

// 첫번째 오류 -> DOM 타입 불일치로 발생.
// getBoundingClientRect() 는 Node 가 아니라 Element에 정의되어 있기 때문에 @param 태그를 Node에서 Element 로 수정해야 함.

// 두번재 오류 -> @return 태그에 명시된 타입과 실제 반환 타입이 맞지 않아서 발생.
// 코드만 봐서 @return 태그와 반환 타입 중 어디가 잘못된건지 확신할 수 없지만, 일반적으로 width, height 를 사용하기 때문에 @return 태그를 수정하는 것이 올바른 방향일 것.
```

JSDoc 관련된 오류를 모두 수정했다면,

JSDoc을 활용하여 타입 정보를 점진적으로 추가할 수 있음.

타입스크립트 언어 서비스는 타입을 추론해서 **JSDoc 을 자동으로 생성해줌**

```tsx
// @ts-check
function double(val) {
	return 2 * val;
}

// 편집기에서 val 매개변수에서 나는 오류에서 빠른 수정을 실행하면 타입 정보가 JSDoc 주석으로 생성됨.
// @ts-check
/**
 * @param {number} val
 */
function double(val) {
	return 2 * val;
}
```

자동 생성 기능은 타입 정보를 빠르게 추가할 수 있기 때문에 유용하지만, 잘 동작하지 않는 경우도 있음

```tsx
function loadData(data) {
	data.files.forEach(async file => {
		// ...
	});
}

/**
 * @param {{
 *	 files: { forEach: (arg0: (file: any) => Promise<void>) => void; };
 *	}} data
 */
function loadData(data) {
	// ...
}

// 구조적 타이핑이 엉뚱하게 적용됨
// files.forEach 메서드를 가지는 어떠한 객체라도 동작이 가능하겠지만, 원래 loadData 함수가 의도한 시그니처는 {files : string []} 였을 것임.
```

자바스크립트 환경에서도 `@ts-check` 지시자와 JSDoc 주석이라면 타입스크립트와 비슷한 경험으로 작업이 가능함.

특별한 작업이 필요 없기 때문에 점진적 마이그레이션 과정 중에 유용하지만, `@ts-check` 지시자와 JSDoc 주석을 너무 장기간 사용하는 것은 좋지 않음.

다만, 이미 JSDoc 주석으로 타입 정보가 많이 담겨 있는 프로젝트라면 `@ts-check` 지시자만 간단히 추가함으로써 기존 코드에 타입 체커를 실험해 볼 수 있고 초기 오류를 빠르게 잡아낼 수 있다는 점은 기억해야 함.
