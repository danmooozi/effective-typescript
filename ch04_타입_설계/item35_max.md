**파일 형식, API, 명세와 같은 것들은 프로젝트 외부에서 비롯된 것이다.**

- 핵심은 데이터가 아니라 명세를 참고해 타입을 생성한다는 것.
- 데이터를 보고 타입을 결정하면, 눈앞에 있는 데이터들만 고려하게 되므로 예기치 않은 곳에서 오류 발생 가능.

```jsx
const calculateBoundingBox(f: Feature): BoundingBox | null => {
	let box: BoundingBox | null = null;

	const helper = (coords: any[]) => {
		//...
	};

	const {geometry} = f;
	if(geometry) {
		helper(geometry.coordinates);
	}
	return box;
}
```

- Feature 타입은 명시적으로 정의된 적이 없다.
- 공식 GeoJSON 명세를 사용. DefinitelyTypes에는 이미 타입 선언이 존재
  - **DefinitelyTyped**는 자바스크립트 라이브러리와 프레임워크에 대한 타입 정의 파일을 제공하는 오픈 소스 프로젝트

### 타입 추가

- GeoJSON 선언을 넣는 순간 타입스크립트는 오류 발생

```tsx
const calculateBoundingBox = (f: Feature): BoundingBox | null => {
  let box: BoundingBox | null = null;

  const helper = (coords: any[]) => {
    // ...
  };

  const { geometry } = f;
  if (geometry) {
    helper(geometry.coordinates);
    // ~~~~~~~~~~~~~~
    // 'Geometry' 형식에 'coordinates' 속성이 없습니다.
    // 'GeometryCollection<Geometry>' 형식에 'coordinates' 속성이 없습니다.
  }

  return box;
};
```

- coordinates 속성이 없어서 발생한 오류

### 타입 체크

```jsx
const { geometry } = f;
if (geometry) {
  if (geometry.type === "GeometryCollection") {
    throw new Error("GeometryCollections are not supported.");
  }
  helper(geometry.coordinates);
}
```

- 이 오류를 고치는 한 가지 방법은 다음 코드처럼 GeometryCollections을 명시적으로 차단하는 것.
- 하지만 GeometryCollections 타입을 차단하기보다는 모든 타입을 지원하는 것이 더 좋은 방법

  - 조건을 분기해서 헬퍼 함수를 호출하면 모든 타입을 지원할 수 있다.

  ```tsx
  const geometryHelper = (g: Geometry) => {
    if (geometry.type === "GeometryCollection") {
      geometry.geometries.forEach(geometryHelper);
    } else {
      helper(geometry.coordinates);
    }
  };

  const { geometry } = f;
  if (geometry) {
    geometryHelper(geometry);
  }
  ```

- 직접 작성한 타입 선언에는 GeometryCollection 같은 예외 상황이 포함되지 않았을 테고 완벽할 수도 없다.
- 반면, 명세를 기반으로 타입을 작성한다면 현재까지 경험한 데이터뿐만 아니라 사용한 가능한 모든 값에 대해서 작동한다는 확신을 가질 수 있다.

### GraphQL

- API의 명세로부터 타입을 생성할 수 있다면 그렇게 하는 것이 좋다.
- GraphQL은 자체적으로 타입이 정의되어 있다.
  - 가능한 모든 쿼리와 인터페이스를 명세하는 스키마로 이루어진다.

**Github GraphQL API를 사용해서 저장소에 대한 정보를 얻는 코드**

```jsx
query {
	repository(owner: "Microsoft", name: "TypeScript") {
		createdAt
		description
	}
}
```

- 결과

```jsx
{
  "data": {
    "repository": {
      "createdAt": "2023-01-01T00:00:00Z",
      "description": "TypeScript is a superset of JavaScript that compiles to clean JavaScript output."
    }
  }
}
```

- 특정 쿼리에 대해 타입스크립트 타입을 생성할 수 있다.

### 타입에 null이 가능한지 정확하게 모델링 가능

```jsx
query getLicense($owner: String!, $name: String!){
  repository(owner: $owner, name: $name) {
	  description
    licenseInfo {
      spdxId
      name
    }
  }
}
```

- $owner와 $name은 타입이 정의된 GraphQL 변수
- String은 GraphQL의 타입
- GraphQL의 string타입에서는 null이 가능 → 타입 뒤 !는 null이 아님을 명시

### Apollo

- GraphQL 쿼리를 타입스크립트 타입으로 변환해 주는 도구
- 자동으로 생성된 타입 정보는 API를 정확히 사용할 수 있도록 도와준다.
- 쿼리가 바뀐다면 타입도 자동으로 바뀌며 스키마가 바뀐다면 타입도 자동으로 바뀐다.

### ETC

- 만약 명세 정보나 공식 스키마가 없다면 데이터로부터 타입을 생성해야 한다.
- 이를 위해 quicktype 같은 도구를 사용할 수 있다.
  - 그러나 생성된 타입이 실제 데이터와 일치하지 않을 수 있다는 점을 주의??
