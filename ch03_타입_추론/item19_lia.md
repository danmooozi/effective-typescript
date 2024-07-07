# 아이템19 추론 가능한 타입을 사용해 장황한 코드 방지하기

많은 타입 구문은 사실 불필요하다.
모든 변수에 타입을 선언하는 것은 비생산적이며 형편없는 스타일로 여겨짐

```ts
let x: number = 12;
// 충분
let x = 12;
// 편집기에서 x에 마우스를 올려보면, 타입이 number로 이미 추론되어 있음을 확인할 수 있음
```

---

### 타입 추론이 된다면 명시적 타입 구문은 필요하지 않다

```ts
// 객체 추론
const person: {
	name: string;
	born: {
		where: string;
		when: string;
	};
	died: {
		where: string;
		when: string;
	};
} = {
	name: "Sojourner Truth",
	born: {
		where: "Swartekill, NY",
		when: "c.1797",
	},
	died: {
		where: "Battle Creek, MI",
		when: "Nov. 26, 1883",
	},
};
// 충분
const person = {
	name: "Sojourner Truth",
	born: {
		where: "Swartekill, NY",
		when: "c.1797",
	},
	died: {
		where: "Battle Creek, MI",
		when: "Nov. 26, 1883",
	},
};

// 배열의 경우도 마찬가지
// TS는 어떤 타입을 반환하는지 정확히 알고 있음
function square(nums: number[]) {
	return nums.map(x => x * x);
}
const squares = square([1, 2, 3, 4]); // 타입은 number[]

// 예상한 것보다 더 정확하게 추론하는 경우도 있음
const axis1: string = "x"; // 타입은 string
const axis2 = "y"; // 타입은 'y'
```

(이러한 추론이 어떻게 타입 오류를 방지하는지는 아이템 21에서 다룸 )

---

### 타입이 추론되면 리팩토링 역시 용이해짐

```ts
// 1)
interface Product {
	id: number;
	name: string;
	price: number;
}

function logProduct(product: Product) {
	const id: number = product.id;
	const name: string = product.name;
	const price: number = product.price;
	console.log(id, name, price);
}

// 2)
// id에 문자도 들어 있을 수 있음.
// Product 내의 id 타입 변경
// -> 오류: logProduct 내의 id 변수 선언에 있는 타입과 맞지 않음
interface Product {
	id: string;
	name: string;
	price: number;
}
function logProduct(product: Product) {
	const id: number = product.id; // ~~ 'string' 형식은 'number' 형식에 할당할 수 없습니다.
	const name: string = product.name;
	const price: number = product.price;
	console.log(id, name, price);
}

// 3)
// logProduct 함수 내의 명시적 타입 구문이 없었다면, 코드 수정 없이 타입 체커 통과했을 것.
// logProduct는 비구조화 할당문을 사용해 구현하는게 나음(아이템 58)
// 비구조화 할당문은 모든 지역 변수의 타입이 추론되도록 함
function logProduct(product: Product) {
	const { id, name, price } = product;
	console.log(id, name, price);
}

// 4)
// 여기에 추가로 아래처럼 명시적 타입 구문을 넣는다면 불필요한 타입 선언으로 코드가 번잡해짐
function logProduct(product: Product) {
	const { id, name, price }: { id: string; name: string; price: number } =
		product;
	console.log(id, name, price);
}
```

---

### 함수 매개변수에 타입 구문을 생략하는 경우

```ts
// 예) 기본값이 있는 경우
function parseNumber(str: string, base = 10) {
	// ...
}
// base 타입은 number 로 추론됨
```

타입 정보가 있는 라이브러리 -> 콜백 함수의 매개변수 타입은 자동으로 추론됨

```ts
// 예) express HTTP 서버 라이브러리를 사용하는 request와 response의 타입선언은 필요 X
// X
app.get("/health", (request: express.Request, response: express.Response) => {
	response.send("OK");
});
// O
app.get("/health", (request, response) => {
	response.send("OK");
});
```

---

### 타입이 추론될 수 있음에도 여전히 타입을 명시하고 싶은 상황

1. 객체 리터럴 정의할 때

```ts
const elmo: Product = {
	name: "Tickle Me Elmo",
	id: "048188 627152",
	price: 28.99,
};

// 타입을 명시 -> 잉여 속성 체크가 동작함.
// 타입 구문 제거 -> 잉여 속성 체크 동작 X -> 객체 선언한 곳(x) 사용되는 곳(o)에서 타입 오류 발생

const furby = {
	name: "Furby",
	id: 630509430963,
	price: 35,
};
logProduct(furby); // ~~~ ...형식의 인수는 'Product' 형식의 매개변수에 할당될 수 없습니다. 'id' 속성의 형식이 호환되지 않습니다. 'number' 형식은 'string' 형식에 할당할 수 없습니다.

// 타입 구문을 제대로 명시하면 실수가 발생한 부분에 오류 표시해줌
const furby = {
	name: "Furby",
	id: 630509430963, // ~~~ 'number' 형식은 'string' 형식에 할당할 수 없습니다.
	price: 35,
};
logProduct(furby);
```

2. 함수의 반환타입 (이점3가지)

   - 오류의 위치를 제대로 표시해 준다.

     ```ts
     // 예) 주식 시세 조회 함수
     function getQuote(ticker: string) {
     	return fetch(`https://quotes.example.com/?q=${ticker}`).then(response =>
     		response.json()
     	);
     }

     // 이미 조회한 종목을 다시 요청하지 않도록 캐시 추가
     const cache: { [ticker: string]: number } = {};
     function getQuote(ticker: string) {
     	if (ticker in cache) {
     		return cache[ticker];
     	}
     	return fetch(`https://quotes.example.com/?q=${ticker}`)
     		.then(response => response.json())
     		.then(quote => {
     			cache[ticker] = quote;
     			return quote;
     		});
     }

     // 오류
     // getQuote는 항상 Promise 를 반환하므로 if 구문에 cache[ticker]가 아니라 Promies.resolve(cache[ticker])가 반환되도록 해야함.
     // 실행해보면 오류는 호출한 코드에서 발생함
     getQuote("MSFT").then(considerBuying); // ~~~ 'number | Promise<any>' 형식에 'then' 속성이 없음. 'number' 형식에 'then' 속성이 없음

     // 의도된 반환 타입(Promise<number>) 명시 -> 정확한 위치에 오류 표시됨
     const cache: { [ticker: string]: number } = {};
     function getQuote(ticker: string): Promise<number> {
     	if (ticker in cache) {
     		return cache[ticker]; // ~~~ 'number' 형식은 'Promise<number>' 형식에 할당할 수 없습니다.
     	}
     	// ...
     }
     ```

   - 함수에 대해 더욱 명확하게 알 수 있다.
   - 명명된 타입을 사용할 수 있다.
     ```ts
     interface Vector2D {
     	x: number;
     	y: number;
     }
     function add(a: Vector2D, b: Vector2D) {
     	return { x: a.x + b.x, y: a.y + b.y };
     }
     // 반환타입을 {x: number; y: number;} 로 추론함.
     // Vector2D와 호환되지만, 입력이 Vector2D인데 반해 출력은 Vector2D가 아니기 때문에 당황스러울 수 있음
     ```
