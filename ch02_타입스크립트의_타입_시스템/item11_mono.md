# 아이템 11. 잉여 속성 체크의 한계 인지하기

타입이 명시된 변수에 객체 리터럴을 할당할 때 타입스크립트는 해당 타입의 속성이 있는지, 그리고 ‘그 외의 속성이 없는지’ 확인합니다.

```tsx
interface Room {
	numDoors: number;
	ceilingHeightFt: number;
}
const r: Room = {
	numDoors: 1,
	ceilingHeightFt: 10,
	elephant: 'present',
	// ~~~ 에러난다 ~~~
};
```

Room 타입에 생뚱맞게 elephant 속성이 있는 것이 어색하긴 하지만, 구조적 타이핑 관점으로 생각해 보면 오류가 발생하지 않아야 합니다.  ( 아이템 4 )

```tsx
const obj = {
	numDoors: 1,
	ceilingHeightFt: 10,
	elephant: 'present',
};
const r: Room = obj;
// ~~~ 쌉가능 ~~~
```

obj 의 타입은 `{ numDoors: number, ceilingHeightFt: number, elephant:string }` 으로 추론 가능하다.  ( 아이템 7 ) obj 타입은 Room 타입의 부분 집합을 포함하므로

첫번째 예제에서는 ‘잉여 속성 체크’라는 과정이 수행되었습니다.

잉여 속성 체크는 구조적 타이핑 시스템에서 허용되는 속성 이름의 오타 같은 실수를 잡는 데 효과적인 방법입니다.

```tsx
interface Options {
	title: string;
	darkMode?: boolean;
}
function createWindow(options: Options) {
	if(options.darkMode) {
		setDarkMode();
	}
	// ...
}
createWindow({
	title: 'spider solitaire',
	darkmode: true,
	// ~~~~~~~~~~~ 개체 리터럴은 알려진 속성만 지정할 수 있지만
	//             'Options' 형식에 'darkmode'가 없습니다.
	//             'darkMode'를 쓰려고 했습니까 ?
});
```

의도대로 동작하지 않을 수 있는 것을 막아준다.

객체 리터럴을 변수에 할당하거나 함수에 매개변수로 전달할 때 잉여 속성 체크가 수행됩니다.

```tsx
interface Room {
	numDoors: number;
	ceilingHeightFt: number;
}
const r: Room = {
	numDoors: 1,
	ceilingHeightFt: 10,
	elephant: 'present',
	// ~~~ 에러난다 ~~~
};
```

잉여 속성 체크는 오류를 찾는 효과적인 방법이지만, 타입스크립트 타입체커가 수행하는 일반적인 구조적 할당 가능성 체크와 일반적인 구조적 할당 가능성 체크를 구분할 수 있습니다.

```tsx
const obj = {
	numDoors: 1,
	ceilingHeightFt: 10,
	elephant: 'present',
};
const r: Room = obj;
// ~~~ 쌉가능 ~~~
```

잉여 속성 체크에는 한계가 있습니다. 임시 변수를 도입하면 잉여 속성 체크를 건더뛸 수 있다는 점을 기억해야 합니다.

```tsx
interface Options {
	darkMode?: boolean;
	[otherOptions: string]: unknown;
}
const o: Options = { darkmode: true }; // 정상
```
