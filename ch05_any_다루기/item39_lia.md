# 아이템39. any를 구체적으로 변형해서 사용하기

> any
>
> - 자바스크립트에서 표현할 수 있는 모든 값을 아우르는 매우 큰 범위의 타입
> - any 타입에는 모든 숫자, 문자열, 배열, 객체, 정규식, 함수, 클래스, DOM 엘리먼트는 물론 null과 undefined까지도 포함
> - 일반적인 상황에서는 any보다 더 구체적으로 표현할 수 있는 타입이 존재할 가능성이 높기 때문에 더 구체적인 타입을 찾아 타입 안정성을 높이도록 해야함

any 타입의 값을 그대로 정규식이나 함수에 넣는 것은 권장되지 않음

```tsx
function getLengthBad(array: any) {
	// 이렇게 하지 맙시다!
	return array.length;
}

function getLength(array: any[]) {
	return array.length;
}
```

→ 후자가 더 좋은 함수

1. 함수 내의 array.length 타입이 체크됨
2. 함수의 반환 타입이 any 대신 number 로 추론됨
3. 함수 호출될 때 매개변수가 배열인지 체크됨

```tsx
// 배열이 아닌 값을 넣어서 실행해 보면, getLength는 제대로 오류를 표시하지만 getLengthBad는 오류를 잡아내지 못하는 것을 볼 수 있음
getLengthBad(/123/); // 오류 없음, undefined를 반환합니다.
getLength(/123/);
//  ~~~~~ 'RegExp' 형식의 인수는
//        'any[]' 형식의 매개변수에 할당될 수 없습니다.
```

- 함수의 매개변수를 구체화할 때, 배열의 배열 형태라면 `any[][]` 처럼 선언하면됨
- 함수의 매개변수가 객체이긴 하지만 값을 알 수 없다면 `{[key: string]: any}` 처럼 선언하면 됨

```tsx
function hasTwelveLetterKey(o: { [key: string]: any }) {
	for (const key in o) {
		if (key.length === 12) {
			return true;
		}
	}
	return false;
}
// {[key: string]: any} 대신 모든 비기본형(non-primitive) 타입을 포함하는 object 타입을 사용할 수도 있음
// object 타입은 객체의 키를 키를 열거할 수는 있지만 속성에 접근할 수 없다는 점에서 {[key: string]: any}와 약간 다름
function hasTwelveLetterKey(o: object) {
	for (const key in o) {
		if (key.length === 12) {
			console.log(key, o[key]);
			// ~~~~~~ '{}' 형식에 인덱스 시그니처가 없으므로 요소에 암시적으로 'any' 형식이 있습니다.
			return true;
		}
	}
	return false;
}
// 객체지만 속성에 접근할 수 없어야 한다면 unknown 타입이 필요한 상황일 수 있음 (아이템42)
```
