# 아이템24. 일관성 있는 별칭 사용하기

### 별칭을 남발해서 사용하면 제어 흐름을 분석하기 어렵다.

```tsx
// 다각형을 표현하는 자료구조 가정
interface Coordinate {
	x: number;
	y: number;
}

interface BoundingBox {
	x: [number, number];
	y: [number, number];
}

interface Polygon {
	exterior: Coordinate[];
	holes: Coordinate[][];
	bbox?: BoundingBox;
}
// 다각형의 기하학적 구조 정의하는 속성 - exterior, holes
// bbox 속성 - 최적화 속성. 어떤 점이 다각형에 포함되는지 빠르게 체크할 수 있음

function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
	if (polygon.bbox) {
		if (
			pt.x < polygon.bbox.x[0] ||
			pt.x > polygon.bbox.x[1] ||
			pt.y < polygon.bbox.y[0] ||
			pt.y > polygon.bbox.y[1]
		) {
			return false;
		}
	}
	// ...
}
// 잘 동작, 타입 체크 통과. but, 반복되는 부분 존재 (polygon.bbox 5번이나 등장함)

// 중복을 줄이기 위해 임수 변수 뽑아내기
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
	const box = polygon.bbox;
	if (polygon.bbox) {
		if (
			pt.x < box.x[0] ||
			pt.x > box.x[1] ||
			pt.y < box.y[0] ||
			pt.y > box.y[1]
		) {
			// ~~~ 객체가 'undefined' 일 수 있습니다.
			return false;
		}
	}
	// ...
}
// (strictNullChecks를 활성화했다고 가정)

// 코드는 동작하지만 편집기에서 오류로 표시됨
// <- polygon.bbox 를 별도의 box 라는 별칭을 만들었고, 첫 번째 예제에서는 잘 동작했던 제어 흐름 분석을 방해했기 때문

// 어떤 동작이 이루어졌나?
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
	polygon.bbox; // 타입이 BoundingBox | undefined
	const box = polygon.bbox;
	box; // 타입이 BoundingBox | undefined
	if (polygon.bbox) {
		polygon.bbox; // 타입이 BoundingBox
		box; // 타입이 BoundingBox | undefined
	}
}
// 속성 체크는 polygon.bbox 의 타입을 정제했지만 box는 그렇지 않았기 때문에 오류 발생
```

### → ‘**별칭은 일관성 있게 사용한다**’는 기본 원칙 지키면 방지 가능

```tsx
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
	const box = polygon.bbox;
	if (box) {
		if (
			pt.x < box.x[0] ||
			pt.x > box.x[1] ||
			pt.y < box.y[0] ||
			pt.y > box.y[1]
		) {
			// 정상
			return false;
		}
	}
	// ...
}
// 타입 체커 문제 해결.
// ?? box 와 bbox 는 같은 값인데 다른 이름을 사용 ??
```

### -> **객체 비구조화** 이용 -> 간결한 문법으로 **일관된 이름 사용** 가능. 배열과 중첩된 구조에서도 사용 가능

```tsx
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
	const { bbox } = polygon;
	if (bbox) {
		const { x, y } = bbox;
		if (pt.x < x[0] || pt.x > x[1] || pt.y < y[0] || pt.y > y[1]) {
			return false;
		}
	}
	// ...
}
```

- 객체 비구조화 주의 사항
  - 전채 bbox 속성이 아니라 x와 y가 선택적 속성일 경우, 속성 체크를 추가로 해야함 → 타입의 경계에 null 값을 추가하는 것이 좋음 (아이템31)
  - bbox에는 선택적 속성이 적합. holes 는 그렇지 않음
    holes가 선택적이라면, 값이 없거나 빈 배열([])이었을 것. 차이가 없는데 이름을 구별한 것. 빈 배열은 ‘holes 없음’을 나타내는 좋은 방법

### 타입스크립트의 제어 흐름 분석은 객체 속성에서 주의해야 함

```tsx
function fn(p: Polygon) {
	/* ... */
}
polygon.bbox; // 타입이 BoundingBox | undefined
if (polygon.bbox) {
	polygon.bbox; // 타입이 BoundingBox
	fn(polygon);
	polygon.bbox; // 타입이 BoundingBox
}

// fn(polygon) 호출은 polygon.bbox를 제거할 가능성이 있으므로 타입을 BoundingBox | undefined로 되돌리는 것이 안전하, 함수를 호출할 때마다 속성 체크를 반복해야 하기 때문에 좋지 않음

// polygon.bbox로 사용하는 대신 bbox 지역 변수로 뽑아내서 사용하면 bbox의 타입은 정확히 유지되지만, polygon.bbox의 값과 같게 유지되지 않을 수 있음.
```

-> 함수 호출이 객체 속성의 타입 정제를 무효화할 수 있다. 속성보다 지역 변수를 사용하면 타입 정제를 믿을 수 있음
