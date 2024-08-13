## item50. 오버로딩 타입보다는 조건부 타입을 사용하기

```jsx
function double(x) {
	return x + x;
} 
```

1. x에는 string, number가 올 수 있다. → 유니온 타입 추가

```jsx
function double(x:number|string):number|string;
function double(x:any) {return x+x;}
```

```jsx
const num = double(12); // string | number;
const str = double('x'); // string | number;
```

- 위의 함수는 string을 넣으면 string 리턴, number를 넣으면 number를 리턴
- 선언문에는 number 타입을 넣으면 string을 리턴하는 경우도 포함

1. 제너릭을 사용하여 동작 모델링

```jsx
function double<T extends number|string>(x:T):T;
function double(x:any) {return x+x;}
```

- 타입을 구체적으로 선언하려는 시도는 좋았지만 타입이 너무 과하게 구체적

1. 여러가지 타입 선언으로 분리
- 타입스크립트에서 구현체는 하나이지만, 여러 개의 타입 선언은 가능

```jsx
function double(x:number):number;
function double(x: string): string;
function double(x:any) {return x+x;}
```

- 타입이 좀 더 명확해 졌지만, 여전히 버그는 존재
- 유니온 타입을 받는 경우 문제가 밥ㄹ생

```jsx
function f(x:number|string){
	return double(x);
			// ~ 'string|number' 형식의 인수는 'string' 형식의 매개변수에 할당 불가
}
```

- 오버로딩 타입 중 일치하는 타입을 찾을 때까지 순차적 검색
- 마지막 타입인 string까지 검색을 한 후 string|number는 string에 할당할 수 없기 때문에 오류 발생

1. 조건부 타입 사용

```jsx
function double<T extends number|string>(
	x:T
): T extends string? string:number;
function double(x:any){ return x + x;}
```

- T 가 string의 부분집합이면 string리턴
- 그 외의 경우 number
- 유니온 타입에 대해 모두 동작
    - 유니온에 조건부 타입을 적용하면, 조건부 타입의 유니온으로 분리된다.
        - (number|string) extends string ? string :number
        
        →   (number extends string? string : number) | 
        
         (string extends string ? string : number)
        
        →   number|string
