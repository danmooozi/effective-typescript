# 아이템14 타입 연산과 제너릭 사용으로 반복 줄이기

## DRY 원칙을 타입에도 최대한 적용해라

> DRY(don't repeat yourself): 같은 코드를 반복하지 말라

- 반복된 코드를 열심히 제거하며 DRY 원칙을 지켜왔더라도 타입에 대해서는 간과할 수 있음
- 타입 중복은 코드 중복만큼 많은 문제를 발생시킴

```ts
interface Person {
	firstName: string;
	lastName: string;
}
interface PersonWithBirthDate {
	firstName: string;
	lastName: string;
	birth: Date;
}

// 선택적 필드인 middleName을 Person에 추가한다고 가정해보자. -> Person 과 PersonWithBirthDate는 다른 타입이 됨.

// ?? 원래 Person 과 PersonWithBirthDate는 다른 타입 아님? birth 를 추가하 것 같은데 middleName 을 예시로 든건가 ?
```

-> 타입 간에 매핑하는 방법을 익히면, 타입 정의에서도 DRY의 장점을 적용할 수 있음.

### 반복 줄이기 - 타입에 이름 붙이기 (타입 명명하기), extends 를 사용하기

    ```ts
    // 예시1)
    function distance(a: {x: number, y: number}, b: {x: number, y: number}) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
    // 타입이 반복적으로 등장함

    // ->
    interface Point2D {
        x: number;
        y: number;
    }
    function distance(a: Point2D, b: Point2D) { /* ... */ }

    // 상수를 사용해서 반복을 줄이는 기법을 동일하게 타입 시스템에 적용한 것.

    // 예제2)
    // 몇몇 함수가 같은 타입 시그니처를 공유하고 있다고 가정
    function get(url: string, opts: Options): Promise<Response> { /* ... */ }
    function post(url: string, opts: Options): Promise<Response> { /* ... */ }

    // 해당 시그니처를 명명된 타입으로 분리해 낼 수 있음
    type HTTPFunction = (url: string, opts: Options) => Promise<Response>;
    const get: HTTPFunction = (url, opts) => { /* ... */ };
    const post: HTTPFunction = (url, opts) => { /* ... */ };

    // 예제3)
    // Person/PersonWithBirthDate 예제에서는 한 인터페이스가 다른 인터페이스를 확장하게 해서 반복을 제거할 수 있음
    interface Person {
        firstName: string;
        lastName: string;
    }

    // 추가적인 필드만 작성하면 됨.
    interface PersonWithBirthDate extends Person {
        birth: Date;
    }

    // 이미 존재하는 타입을 확장하는 경우에, 일반적이지는 않지만 인터섹션 연산자(&)를 쓸 수도 있음
    type PersonWithBirthDate = Person & { birth: Date };
    // -> 유니온 타입(확장할 수 없는)에 속성을 추가하려고 할 때 특히 유용함.
    ```

### 표준 라이브러리에 정의된 제너릭 타입 사용하기

- 제너릭 타입은 타입을 위한 함수와 같음. 타입을 반복하는 대신 제너릭 타입을 사용하여 타입들 간에 매핑을 하는 것이 좋음.

1. Pick

   > ```ts
   > type Pick<T, K> = { [k in K]: T[k] };
   > ```

   ```ts
   // 전체 애플리케이션의 상태를 표현하는 State 타입과 부분만 표현하는 TopNavState가 있는 경우
   interface State {
   	userId: string;
   	pageTitle: string;
   	recentFiles: string[];
   	pageContents: string;
   }
   interface TopNavState {
   	userId: string;
   	pageTitle: string;
   	recentFiles: string[];
   }

   // TopNavState를 확장하여 State를 구성하기보다, State의 부분 집합으로 TopNavState를 정의하는 것이 바람직해 보임.
   // -> State를 인덱싱하여 속성의 타입에서 중복을 제거할 수 있음
   type TopNavState = {
   	userId: State["userId"];
   	pageTitle: State["pageTitle"];
   	recentFiles: State["recentFiles"];
   };
   // -> State 내의 pageTitle의 타입이 바뀌면 TopNavState에도 반영이 됨.
   // 그러나, 반복되는 코드가 여전히 존재함.
   // '매핑된 타입'을 사용하기
   type TopNavState = {
   	[k in "userId" | "pageTitle" | "recentFiles"]: State[k];
   };

   type TopNavState = Pick<State, "userId" | "pageTitle" | "recentFiles">;
   ```

2. Partial

   > ```ts
   > type Partial<T> = { [k in keyof T]?: T[k] };
   > ```

   - T의 모든 프로퍼티를 선택적(Optional)으로 만드는 타입을 구성.

   ```ts
   interface Options {
   	width: number;
   	height: number;
   	color: string;
   	label: string;
   }
   interface OptionsUpdate {
   	width?: number;
   	height?: number;
   	color?: string;
   	label?: string;
   }
   class UIWidget {
   	constructor(init: Options) {
   		/* ... */
   	}
   	update(options: OptionsUpdate) {
   		/* ... */
   	}
   }

   // 매핑된 타입과 keyof 를 사용하면 Options으로부터 OptionsUpdate를 만들 수 있음.
   type OptionsUpdate = { [k in keyof Options]?: Options[k] };

   // keyof는 타입을 받아서 속성 타입의 유니온을 반환함
   type OptionsKeys = keyof Options; // 타입이 "width" | "height" | "color" | "label"

   // Partial 사용
   class UIWidget {
   	constructor(init: Options) {
   		/* ... */
   	}
   	update(options: Partial<Options>) {
   		/* ... */
   	}
   }

   // ---
   // 값의 형태에 해당하는 타입을 정의하고 싶은 경우
   const INIT_OPTIONS = {
   	width: 640,
   	height: 480,
   	color: "#00FF00",
   	label: "VGA",
   };
   interface Options {
   	width: number;
   	height: number;
   	color: string;
   	label: string;
   }
   // 이런 경우에 typeof 를 사용하면 됨.
   type Options = typeof INIT_OPTIONS;

   // JS의 런타임 연산자 typeof를 사용한 것처럼 보이지만, 실제로는 타입스크립트 단계에서 연산되며 훨씬 더 정확하게 타입을 표현함.

   // ?? 뭘 말하려는 건지 모르겠음. -> interface 를 정의 하던가, typeof 를 사용해서 객체 리터럴의 타입을 추출 하는 방식인 듯
   ```

3. ReturnType

   > ```ts
   > type ReturnType<T extends (...args: any) => any> = T extends (
   > 	...args: any
   > ) => infer R
   > 	? R
   > 	: any;
   > ```

   - 함수나 메서드의 반환 값에 명명된 타입을 만들고 싶은 경우

   ```ts
   function getUserInfo(userId: string) {
   	// ...
   	return {
   		userId,
   		name,
   		age,
   		height,
   		weight,
   		favoriteColor,
   	};
   }
   // 추론된 반환 타입은 { userId: string; name: string; age: number, ... }

   // 이대는 조건부 타입(아이템50)이 필요함
   type UserInfo = ReturnType<typeof getUserInfo>;
   // 함수의 ‘값’인 getUserInfo가 아니라 함수의 ‘타입’인 typeof getUserInfo에 적용됨.
   ```

### extends 로 제너릭 타입 제한하기

- 제너릭 매개변수가 특정 타입을 확장한다고 선언할 수 있음

  ```ts
  interface Name {
  	first: string;
  	last: string;
  }
  type DancingDuo<T extends Name> = [T, T]; //DancingDuo 타입의 매개뱐수가 Name 을 확장한다고 선언

  const couple1: DancingDuo<Name> = [
  	{ first: "Fred", last: "Astaire" },
  	{ first: "Ginger", last: "Rogers" },
  ]; // OK
  const couple2: DancingDuo<{ first: string }> = [
  	// ~~~ 'Name' 타입에 필요한 'last' 속성이 '{fist: string}' 타입에 없습니다.
  	{ first: "Sonny" },
  	{ first: "Cher" },
  ];
  // {first: string} 은 Name을 확장하지 않기 때문에 오류가 발생함.
  ```
