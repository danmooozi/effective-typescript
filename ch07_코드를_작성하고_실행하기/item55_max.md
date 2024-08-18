# item55. DOM 계층 구조 이해하기

### 1. DOM 계층

- 타입스크립트에서는 DOM 엘리먼트의 계층 구조를 파악하기 용이
- Element와 EventTarget에 달려 있는 Node의 구체적인 타입을 안다면, 타입 오류 디버깅 가능 그리고 언제 타입 단언을 사용해야 하는지 알 수 있다.

```jsx
function handleDrag(eDown: Event) {
  const targetEl = eDown.currentTarget;
  targetEl.classList.add("dragging");

  const dragStart = [eDown.clientX, eDown.clientY];
  const handleUp = (eUp: Event) => {
    targetEl.classList.remove("dragging");
    targetEl.removeEventListener("mouseup", handleUp);
    const dragEnd = [eUp.clientX, eUp.clientY];
    console.log(
      "dx, dy = ",
      [0, 1].map((i) => dragEnd[i] - dragStart[i])
    );
  };
  targetEl.addEventListener("mouseup", handleUp);
}

const div = document.getElementById("surface");
div.addEventListener("mousedown", handleDrag);
```

![스크린샷 2024-08-18 오후 11.34.16.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/fef31b45-5ba1-48ad-8b81-f071e47abdeb/ea2b1def-931c-4be4-843e-1d46fa2a7a1b/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2024-08-18_%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE_11.34.16.png)

- 오류가 많이 나타난다.

### 1-1. DOM 계층의 타입들

```jsx
const p = document.getElementsByTagName("p")[0];
p instanceof HTMLparagraphElement; // true
```

- HTMLparagraphElement는 HTMLElement의 서브타입
- HTMLElement은 Element의 서브타입
- Element는 Node의 서브 타입
- Node는 EventTarget의 서브타입

**계층 구조에 따른 타입의 몇 가지 예시**

| 타입              | 예시                         |
| ----------------- | ---------------------------- |
| EventTarget       | window, XMLHttpRequest       |
| Node              | document, Text, Comment      |
| Element           | HTMLElement, SVGElement 포함 |
| HTMLElement       | <i>, <b>                     |
| HTMLButtonElement | <button>                     |

1. EventTarget

- EventTarget은 DOM 타입 중 가장 추상화 된 타입
- 이벤트 리스너를 추가(`addEventListener`) or 삭제(`removeEventListener`)하고, 이벤트를 보내는 것(`dispatchEvent`)밖에 할 수 없다.

```tsx
function handleDrag(eDown: Event) {
  const targetEl = eDown.currentTarget
  targetEl.classList.add('dragging')
//~~~~~~~~~ 'targetEl은(는) 'null'일 수 있습니다.
//           ~~~~~~~~~ 'EventTarget' 형식에 'classList' 속성이 없습니다.
  ...
}
```

- 여기서 Event의 currentTarget 속성의 타입은 `EventTarget | null`
  - 그렇기 때문에 null 가능성이 오류로 표시
  - 또한, EventTarget 타입에 classList 속성이 없기 때문에 오류가 발생
- 한편, eDown.currentTarget은 실제로는 HTMLElement 타입이지만, 타입 관점에서는 window나 XMLHttpRequest가 될 수도 있다.

1. Node 타입

- Element가 아닌 Node인 경우를 몇가지 예로 들어보면 텍스트 조각과 주석이 있다.

```jsx
<p>
	And <i>yet</i> it moves
	<!-- quote from Galileo -->
</p>
```

- 가장 바깥 엘리먼트는 HTMLParagraphElement. children과 childNodes 속성을 가지고 있다.
  - children : 배열과 유사한 구조인 HTMLCollection
  - childNodes: 엘리먼트뿐만 아니라 텍스트 조각과 주석까지도 포함

1. Element와 HTMLElement

- SVG 태그의 전체 계층구조를 포함하면서 HTML이 아닌 엘리먼트가 존재
  - Element의 또 다른 종류인 SVGElement
  - <html> : HTMLhtmlElement
  - <svg> : SVGSvgElement

1. HTMLxxxElement

- 자신만의 고유한 속성을 가지고 있다.
  - HTMLImageElement에는 src 속성이 있고,
  - HTMLInputElement에는 value 속성
- 이런 속성에 접근하려면, 타입 정보 역시 실제 엘리먼트 타입이어야 한다. → 타입을 상당히 구체적으로 지정 필요
- 보통은 태그 값에 해당하는 리터럴 값을 사용하여 DOM에 대한 정확한 타입을 얻을 수 있다.

```
document.getElementsByTagName('p')[0] // HTMLParagraphElement
document.createElement('button') // HTMLButtonElement
document.querySelector('div') // HTMLDivElement
```

### 2. 타입 단언문

- DOM과 관련해서는 타입스크립트보다 우리가 더 정확히 알고 있는 경우가 있다.

> strictNullChecks가 설정된 상태라면, document.getElementById가 null인 경우를 체크

```jsx
document.getElementById('my-div') // HTMLElement

document.getElementById('my-div') as HTMLDivElement
```

### 3. Event 타입

```tsx
function handleDrag(eDown: Event) {
  const targetEl = eDown.currentTarget
  targetEl.classList.add('dragging')

  const dragStart = [eDown.clientX, eDown.clientY]
  //'Event' 형식에 'clientX' 속성이 없습니다.ts(2339)
  // 'Event' 형식에 'clientY' 속성이 없습니다.ts(2339)
  ...
}
```

- Event 타입에도 별도의 계층 구조가 있다.
  - 52개의 Event 종류가 존재
- Event는 가장 추상화된 이벤트

  - UIEvent, MouseEvent, TouchEvent, WheelEvent, KeyboardEvent

- 위 코드의 오류는 handleDrag 함수의 매개변수는 Event로 선언된 반면, clientX와 clientY는 보다 구체적인 MouseEvent 타입에 있기 때문

```tsx
function addDragHandler(el: HTMLElement) {
  el.addEventListener("mousedown", (eDown) => {
    const dragStart = [eDown.clientX, eDown.clientY];
    const handleUp = (eUp: MouseEvent) => {
      el.classList.remove("dragging");
      el.removeEventListener("mouseup", handleUp);
      const dragEnd = [eUp.clientX, eUp.clientY];
      console.log(
        "dx, dy = ",
        [0, 1].map((i) => dragEnd[i] - dragStart[i])
      );
    };
    el.addEventListener("mouseup", handleUp);
  });
}

const div = document.getElementById("surface");
if (div) {
  addDragHandler(div);
}
```

- `mousedown` 이벤트 핸들러를 인라인 함수로 만들면 타입스크립트는 더 많은 문맥 정보를 사용.
- 또한 매개변수 타입을 Event 대신 MouseEvent로 선언 가능
- 마지막 if 구문은 엘리먼트가 없는 경우를 체크하기 위함
