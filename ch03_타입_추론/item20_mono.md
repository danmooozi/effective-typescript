
# item 20 다른 타입에는 다른 변수 사용하기

가끔 하나의 변수에 여러 목적을 가지는 다른 타입으로 재사용하는 경우가 있다. ( 나는 하는데 솔직히 하는거 보면 꿀밤 마렵다. )

```tsx
let id = '123-45-67';
fetchProduct(id);

id = 123456;
// ~~ '123456' 형식은 'string'형식에 할당할 수 없습니다.
fetchProductBySerialNumber(id);
// ~~'string' 형식의 인수는 'number' 형식의 매개변수에 할당될 수 없습니다.
```

여기를 보면 처음에 id 를 줄때 id 는 string 으로 추론한다. 그렇기 때문에 할당이 불가능한 것이다. 여기서 “변수의 값은 바뀔 수 있지만 그 타입은 보통 바뀌지 않는다”는 중요한 관점을 얻을 수 있다.

물론 타입을 바꿀 수 있는 방법으로는 타입 좁히기( 아이템 22 ) 이고 이관점에 반하는 타입 지정 밥법( 아이템 41 ) 에 있다. 

```tsx
let id:string | number = '123-45-67';
fetchProduct(id);

id = 123456; // 정상
fetchProductBySerialNumber(id); // 정상
```

다음 처럼 유니온 타입을 이용해서 확장을 하는 방법도 있다. 하지만 두 개의 타입일 수 있는 변수는 다루기 매우 어렵다 그렇기 때문에

```tsx
const id = '123-45-67';
fetchProduct(id);

const serial = 123456; // 정상
fetchProductBySerialNumber(serial); // 정상
```

이런식으로 따로 담는것이 고수이다. 절대 별 쓸모 없이 let 을 하지말자. 

```tsx
const id = '123-45-67';
fetchProduct(id);

{
	const id = 123456; // 정상
	fetchProductBySerialNumber(serial); // 정상
}
```

물론 이런식으로 Shadowed 변수를 사용해서 할 수 있다. 언뜻 보기에는 변수가 내포하는 의미도 다르고 Scope 도 달라서 사용 가능하지만, 애초에 보는 사람이 햇갈리니깐 이런식으로 하지말자.

그러니깐 한 번 더 말하자면, 다른 목적의 변수는 다른 변수에 담자.