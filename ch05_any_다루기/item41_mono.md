?? 제목이 제정신이 아니다.

보통 타입스크립트는 변수의 타입이 변수를 선언할 때 결정된다고 하지만 정제될 수 있다. (좁혀나가기) 그러나 any 는 새로운 형태가 될 수 있다.

```tsx
function range(strat: number, limit: number) {
    const out = []; // 타입이 any[]
    for ( let i = start; i < limit; i++ ) {
	    out.pust(i); // out 타입은 any[]
	  }
	  return out; // 타입이 number[]
}
```

보는 것 처럼 이 함수의 반환형은 number[] 로 추론 된다. 처음은 any[] 이지민 number 를 넣는 순간부터 해당 내용은 number[] 로 변경된다. 타입의 진화는 타입 좁히기 ( [아이템 22](https://github.com/danmooozi/effective-typescript/blob/main/ch03_%ED%83%80%EC%9E%85_%EC%B6%94%EB%A1%A0/item22_eden.md) ) 와 다르다 왜냐하면

```tsx
const result = [] // 타입이 any[]
result.push('a');
result // 타입이 string[]
result.push(1);
result // 타입이 (string | number)[]
```

또한 조건문을 지나면서 진화도 가능하다

```tsx
let val; // 타입이 any
if (Math.random() < 0.5.) {
	val = /hello/;
	val // 타입이 RegExp
} else {
	val = 12;
	val // 타입이 number
}
val // 타입이 number | RegExp
```

정말 어메이징하다. 

하지만 명시적으로 했을때는 변하지 않는다.

```tsx
let val:any ; // 타입이 any
if (Math.random() < 0.5.) {
	val = /hello/;
	val // 타입이 any
} else {
	val = 12;
	val // 타입이 any
}
val // 타입이 any
```

나는 차라리 이렇게 any 를 써야한다면 앞에서 하는것 보다 이게 더 났다고 생각한다. 책도 그렇게 말하는데 명시적이지 않을때 이런식으로 진화한다는 것을 알려주려고 해놓은 장인것 같다.

### 요약

- 일반적인 타입들은 정제되기만 하는 반면, 암시적 any 와 any[] 타입은 진화할 수 있고, 이해하고 있어야 한다.
- any를 진화시키는 방식보다 명시적 타입 구문을 사용하는 것이 안전한 타입을 유지하는 방법이다.
