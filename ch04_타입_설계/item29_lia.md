# 아이템29. 사용할 때는 너그럽게, 생성할 때는 엄격하게

> 함수의 매개변수는 타입의 범위가 넓어도 되지만, 결과를 반환할 때는 일반적으로 타입의 범위가 더 구체적이어야 한다.

```ts
// 예) 3D 매핑 API - 카메라의 위치 지정, 경계 박스의 뷰포트를 계산하는 방법 제공
declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): CameraOptions;

// 카메라의 위치를 잡기 위해 viewportForBounds 의 결과가 setCamera로 바로 전달될 수 있다면 편리할 것.

interface CameraOptions {
	center?: LngLat;
	zoom?: number;
	bearing?: number;
	pitch?: number;
}
// 일부 값은 건드리지 않으면서 동시에 다른 값을 설정할 수 있어야 하므로 CameraOptions 의 필드는 모두 선택적

type LngLat =
	| { lng: number; lat: number }
	| { lon: number; lat: number }
	| [number, number];
// LngLat 타입도 setCamera의 매개변수 범위를 넓혀 줌.
// 매개변수로 {lng, lat} 객체, {lon, lat} 객체, [lng, lat] 쌍을 넣을 수도 있음

type LngLatBounds =
	| { northeast: LngLat; southwest: LngLat }
	| [LngLat, LngLat]
	| [number, number, number, number];
// LngLat는 세 가지 형태를 받을 수 있기 때문에, LngLatBounds 의 가능한 형태는 19가지 이상으로 매우 자유로운 타입임
```

→ 편의성을 제공하여 함수 호출을 쉽게 할 수 있음

```ts
// 뷰포트를 조절하고, 새 뷰포트를 URL에 저장하는 함수
function focusOnFeature(f: Feature) {
	const bounds = calculateBoundingBox(f);
	const camera = viewportForBounds(bounds);
	setCamera(camera);
	const {
		center: { lat, lng },
		zoom,
	} = camera;
	//  ~~       ... 형식에 'lat' 속성이 없습니다.
	//        ~~ ... 형식에 'lng' 속성이 없습니다.
	zoom; // 타입이 number | undefined
	window.location.search = `?v=@${lat},${lng}z${zoom}`;
}
```

→ 문제: `viewportForBounds` 의 타입 선언이 사용될 때뿐만 아니라 만들어질 때에도 너무 자유롭다는 것.
매개변수 타입의 범위가 넓으면 사용하기 편리하지만, 반환 타입의 범위가 넓으면 불편함.
즉, 사용하기 편리한 API일수록 반환 타입이 엄격함

### <strong>⇒ 유니온 타입의 각 요소별로 코드를 분기하기</strong>

```ts
// 1. 좌표를 위한 기본 형식 구분하기
// 배열과 배열 같은 것(array-like)의 구분. LngLat와 LngLatLike로 구분
// 완전하게 정의된 Camera 타입과 Camera 타입이 부분적으로 정의된 버전을 구분
interface LngLat {
	lng: number;
	lat: number;
}
type LngLatLike = LngLat | { lon: number; lat: number } | [number, number];
interface Camera {
	center: LngLat;
	zoom: number;
	bearing: number;
	pitch: number;
}
interface CameraOptions extends Omit<Partial<Camera>, "center"> {
	center?: LngLatLike;
}
// Camera 가 너무 엄격하므로 조건을 완화하여 느슨한 CameraOptions 타입으로 만들었음.
// 혹은 다음처럼 명시적으로 타입 추출하는 방법 사용해야함
interface CameraOptions {
	center?: LngLat;
	zoom?: number;
	bearing?: number;
	pitch?: number;
}
// 두 방식 모두 focusOnFeature 함수가 타입 체커를 통과할 수 있게 함

type LngLatBounds =
	| { northeast: LngLatLike; southwest: LngLatLike }
	| [LngLatLike, LngLatLike]
	| [number, number, number, number];

declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): Camera;

function focusOnFeature(f: Feature) {
	const bounds = calculateBoundingBox(f);
	const camera = viewportForBounds(bounds);
	setCamera(camera);
	const {
		center: { lat, lng },
		zoom,
	} = camera; // 정상
	zoom; // 타입이 number
	window.location.search = `?v=@${lat},${lng}z${zoom}`;
}
```

→ `viewportForBounds` 함수를 사용하기 훨씬 쉬워짐.

경계 박스의 형태를 19가지나 허용하는 것은 좋은 설계가 아님.

---

### 요약

- 보통 매개변수 타입은 반환 타입에 비해 범위가 넓은 경향이 있음. 선택적 속성과 유니온 타입은 반환 타입보다 매개변수 타입에 더 일반적임
- 매개변수와 반환 타입의 재사용을 위해서 기본 형태(반환 타입)와 느슨한 형태(매개변수 타입)를 도입하는 것이 좋음
