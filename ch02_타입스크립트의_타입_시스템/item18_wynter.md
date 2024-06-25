# 아이템 17 변경 관련된 오류 방지를 위해 readonly 사용하기

```ts
function printTriangles(n:number) {
	const nums = [];
	for(let i=o; i< n; i++) {
		nums.push(i);
		console.log(arraySum(nums))
	}
}

function arraySum(arr:number[]) {
	let sum = 0, num;
	while((num=arr.pop()) !== undefined) {
		sum += num;
	}
	return sum;
}
```
* 배열의 합을 순서대로 출력하는 코드인데, 원본 배열을 변경하게 됨
* arraySum이 배열을 변경하지 않는다는 선언을 하려면 `number[]` 대신 `readolny number[]`를 사용하면 됨.
  * 배열의 요소를 읽을 수 있지만, 쓸 수는 없습니다.
  * length를 읽을 수 있지만, 바꿀 수는 없습니다.
  * 배열을 변경하는 pop을 비롯한 다른 메서드를 호출할 수 없습니다.
* number[]는 readonly number[]보다 기능이 많기 때문에 서브타입이 됨. 즉, readonly number[]에 할당가능. 반대는 불가능.

* 매개변수를 readonly로 선언하면 다음과 같은 일이 생김
  * 타스는 매개변수가 함수 내에서 변경이 일어나는지 체크
  * 호출하는 쪽에서는 함수가 매개변수를 변경하지 않는다는 보장을 받음
  * 호출하는 쪽에서 함수에 readonly 배열을 매개변수로 넣을 수도 있음

* 매개변수 변경이 일어나지 않는다면 명시적으로 readonly를 주는 것이 좋음
  * readonly로 선언되지 않은 함수를 쓸 일이 생긴다면 타입 단언을 써야함.. 첨부터 걍 쭉 readonly로 써주는 것이 좋음
// 96p 이어서하기..

## 그냥 정리

### 아이템16 number 인덱스 시그니처보다는 Array, 튜플, ArrayLike를 사용하기

책의 레전드 발언

* 자바스크립트는 이상하게 동작하기로 유명한 언어입니다. ㅋㅋㅋ
* 자바스크립트 객체 모델에도 이상한 부분들이 있으며,

---

* 자스에서는 가능했던 암시적 변환 중, 키를 number로 하던 string으로 하던 string이 되던 것이 타스에서는 타입체커가 잡아줌
* 타입이 불확실하면 for-in루프는 for-of 또는 c스타일 for에 비해 몇배는 느림
* for-in < for-of < forEach 순으로 쓰자.