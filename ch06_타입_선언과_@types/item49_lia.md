# 아이템49. 콜백에서 this에 대한 타입 제공하기

> let 이나 const 로 선언된 변수가 렉시컬 스코프(lexical scope)인 반면,
> this는 다이나믹 스코프(dynamic scope)임
> 다이나믹 스코프의 값은 ‘정의된’ 방식이 아니라 ‘호출된’ 방식에 따라 달라짐

this는 전형적으로 객체의 현재 인스턴스를 참조하는 클래스에서 가장 많이 쓰임

```tsx
class C {
	vals = [1, 2, 3];
	logSquares() {
		for (const val of this.vals) {
			console.log(val * val);
		}
	}
}

const c = new C();
c.logSquares();
// 출력
// 1
// 4
// 9

// logSquares를 외부 변수에 넣고 호출하면 ?
const c = new C();
const method = c.logSquares;
method();
// 런타임 오류
// Uncaught TypeError: undefined의 'vals' 속성을 읽을 수 없습니다.
```

- `c.logSquares();` 가 실제로 두 가지 작업을 수행하기 때문에 문제가 발생함
  C.prototype.logSquares 를 호출하고, 또한 this의 값을 c 로 바인딩함
- 두번째의 경우, logSquares의 참조 변수를 사용함으로써 두 가지 작업을 분리했고, this의 값은 undefined로 설정됨

---

자바스크립트에서 this 바인딩을 온전히 제어할 수 있는 방법 → **call 을 사용하여 명시적으로 this 바인딩하기**

```tsx
const c = new C();
const method = c.logSquares;
method.call(c); // 제곱을 출력합니다.
// method를 실행할 때의 this 컨텍스트를 c 로 직접 바인딩해줌.
```

- this 가 반드시 C의 인스턴스에 바인딩되어야 하는 것은 아니며, 어떤 것이든 바인딩할 수 있음.
  → 라이브러리들은 API의 일부에서 this의 값을 사용할 수 있게 함.
  심지어 DOM에서도 this를 바인딩할 수 있음.
      ```tsx
      // 예) 이벤트 핸들러
      document.querySelector('input')!.addEventListener('change', function(e) {
      	console.log(this); // 이벤트가 발생한 input 엘리먼트를 출력합니다.
      });
      ```
- this 바인딩은 종종 콜백 함수에서 쓰임
  ```tsx
  // 예) 클래스 내에 onClick 핸들러 정의
  class ResetButton {
  	render() {
  		return makeButton({ text: "Reset", onClick: this.onClick });
  	}
  	onClick() {
  		alert(`Reset ${this}`);
  	}
  }
  ```
  그러나 `ResetButton`에서 `onClick`을 호출하면, this 바인딩 문제로 인해 ‘Reset이 정의되지 않았습니다’라는 경고가 뜸 ??
  ⇒ 생성자에서 메서드에 this를 바인딩시키기
  ```tsx
  class ResetButton {
  	constructor() {
  		this.onClick = this.onClick.bind(this);
  	}
  	render() {
  		return makeButton({ text: "Reset", onClick: this.onClick });
  	}
  	onClick() {
  		alert(`Reset ${this}`);
  	}
  }
  ```
  - `onClick() { … }` 은 `ResetButton.prototype` 의 속성을 정의함. → `ResetButton`의 모든 인스턴스에서 공유 됨
  - 그러나, 생성자에서 `this.onClick = …` 으로 바인딩하면, `onClick` 속성에 this 가 바인딩되어 해당 인스턴스에 생성됨.
  - 속성 탐색 순서(lookup sequence)에서 onClick 인스턴스 속성은 onClick 프로토타입 속성보다 앞에 놓이므로, render() 메서드의 this.onClick은 바인딩된 함수를 참조하게 됨.
  조금 더 간단한 방법으로 바인딩 해결하기
  ```tsx
  class ResetButton {
  	render() {
  		return makeButton({ text: "Reset", onClick: this.onClick });
  	}
  	onCick = () => {
  		alert(`Reset ${this}`); // "this"가 인스턴스를 참조합니다.
  	};
  }
  // 화살표 함수를 사용하면, 화살표 함수를 정의하는 시점의 컨텡스트 객체가 this에 바인딩됨.
  ```
  - `onClick`을 화살표 함수로 바꿈
    → ResetButton 이 생성될 때마다 제대로 바인딩된 this를 가지는 새 함수를 생성하게 됨.
    ```tsx
    // 자바스크립트가 실제로 생성한 코드
    class ResetButton {
    	constructor() {
    		var _this = this;
    		this.onClick = function () {
    			alert("Reset " + _this);
    		};
    	}
    	render() {
    		return makeButton({ text: "Reset", onClick: this.onClick });
    	}
    }
    ```
- this 바인딩 문제는 콜백 함수의 매개변수에 this를 추가하고, 콜백 함수를 call로 호출해서 해결할 수 있음.
  ```tsx
  function addKeyListener(
  	el: HTMLElement,
  	fn: (this: HTMLElement, e: KeyboardEvent) => void
  ) {
  	el.addEventListener("keydown", e => {
  		fn.call(el, e); // fn를 실행할 때의 this컨텍스트를 el로 직접 바인딩해줌.
  	});
  }
  ```
  콜백 함수의 첫번째 매개변수에 있는 this는 특별하게 처리됨.
  ```tsx
  function addKeyListener(
  	el: HTMLElement,
  	fn: (this: HTMLElement, e: KeyboardEvent) => void
  ) {
  	el.addEventListener("keydown", e => {
  		fn(el, e);
  		//   ~ 1개의 인수가 필요한데 2개를 가져왔습니다.
  	});
  }
  ```
  콜백 함수의 매개변수에 this를 추가하면 this 바인딩이 체크되기 때문에 실수를 방지할 수 있음
  ```tsx
  function addKeyListener(
  	el: HTMLElement,
  	fn: (this: HTMLElement, e: KeyboardEvent) => void
  ) {
  	el.addEventListener("keydown", e => {
  		fn(e);
  		//~~~~~~ 'void' 형식의 'this' 컨텍스트를 메서드의 'HTMLElement' 형식 'this'에 할당할 수 없습니다.
  	});
  }
  ```
  또한 라이브러리 사용자의 콜백 함수에서 this를 참조할 수 있고 완전한 타입 안정성도 얻을 수 있음
  ```tsx
  declare let el: HTMLElement;
  addKeyListener(el, function (e) {
  	this.innerHTML; // 정상, "this"는 HTMLElement 타입
  });
  ```
  만약 라이브러리 사용자가 콜백을 화살표 함수로 작성하고 this를 참조하려고 하면 타입스크립트가 문제를 잡아냄
  ```tsx
  class Foo {
  	registerHandler(el: HTMLElement) {
  		addKeyListener(el, e => {
  			this.innerHTML;
  			// ~~~~~~~~~~ 'Foo' 유형에 'innerHTML' 속성이 없습니다.
  		});
  	}
  }
  ```
- 콜백 함수에서 this값을 사용해야 한다면 this는 API 의 일부가 되는 것이기 때문에 반드시 타입 선언에 포함해야 함.
