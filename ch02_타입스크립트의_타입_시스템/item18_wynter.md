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
  * 지역 변수와 관련된 모든 종류의 변경 오류를 방지할 수 있음

```ts
function parseTaggedText(lines: string[]): string[][] {
	const paragraphs: string[][] = [];
	const currPara: string[] = [];

	const addParagraph = () => {
		if(currPara.length) {
			paragraphs.push(currPara); // 참조값 그대로 넣어버리면 어떡함? ;;
			currPara.length = 0;
		}
	}
	for (const line of lines) {
		if(!line) addParagraph();
		else currPara.push(line);
	}
	addParagraph();
	return paragraphs;
}
```

* currPara 배열을 직접 변경하려고 해서 생긴 문제이므로 currPara에 readonly를 넣자.
* 바꿈으로써 생긴 에러에 대한 해결법
  * 해결법 1. currPara의 복사본을 paragraphs에 넣으면 됨
  * 해결법 2. pargraphs도 readonly로 하면 됨
  * 해결법 3. push할 때만단언문을 쓰면 됨

* DeepReadonly가 아닌 이상, readonly 에 담긴 내용물 자체는 변경 가능한 값임.

---

# 아이템 18 매핑된 타입을 사용하여 값을 동기화하기

```ts
interface ScatterProps {
	//the data
	xs: number[];
	ys: number[];

	//Display
	xRange: [number, number];
	yRange: [number, number];
	color: string;

	//Events
	onClick: (x:nubmer, y:number, index:number) => void;
}
```

* 이벤트 핸들러 변경시에는 리렌더링할 필요가 없음. 최적화 구현을 위한 함수 구현은 아래

```ts
function shouldUpdate (old: ScatterProps, new: ScatterProp) {
	let k: keyofScatterProps;
	for(k in oldProps) {
		if(oldProps[k] !== newProps[k]) {
			if(k!=='onClick') return true;
		}
	}
	return false;
}
```

* 값이 변경될 때마다 차트가 다시 그려질 것인데, 이것을 보수적(conservative) 접근법(=실패에 닫힌(fail close)) 접근법 이라고 함.
  * 정확하지만 너무 자주 그려질 가능성

```ts
const REQUIRES_UPDATE: {[k in keyof ScatterProps]: boolean} = {
	xs:true,
	...
	onClick: false,
}
function shouldUpdate (old: ScatterProps, new: ScatterProp) {
	let k: keyofScatterProps;
	for(k in oldProps) {
		if(oldProps[k] !== newProps[k] && REQUIRES_UPDATE[k]) {
			return true;
		}
	}
	return false;
}
```

* 위 코드처럼 짬으로써 값과 타입 동기화 가능

---

## 그냥 정리

### 아이템16 number 인덱스 시그니처보다는 Array, 튜플, ArrayLike를 사용하기

책의 레전드 발언

* 자바스크립트는 이상하게 동작하기로 유명한 언어입니다. ㅋㅋㅋ
* 자바스크립트 객체 모델에도 이상한 부분들이 있으며,

---

* 자스에서는 가능했던 암시적 변환 중, 키를 number로 하던 string으로 하던 string이 되던 것이 타스에서는 타입체커가 잡아줌
* 타입이 불확실하면 for-in루프는 for-of 또는 c스타일 for에 비해 몇배는 느림
* for-in < for-of < forEach 순으로 쓰자.

### 아이템19 추론 가능한 타입을 사용해 장황한 코드 방지하기

* 모든 변수에 타입을 선언하는 것은 비생산적이며 형편없는 스타일로 여겨짐!
  * 타입 추론이 된다면 명시적 타입 구문은 필요하지 않습니다.
  * 그런데 추론이 되더라도 객체 리터럴과 함수 반환에는 타입 명시를 고려해야함

### 아이템20 다른 타입에는 다른 변수 사용하기

* 맥스 맨날 쉬운거걸리네..
