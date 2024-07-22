# 아이템 33 string 타입보다 더 구체적인 타입 사용하기

```ts
interface Album {
	artist: string;
	title: string;
	rleaseDate: string; // YYYY-MM-DD
	recordingType: string; // live or studio
} // stringly typed(문자열을 남발하여 선언되었다) 라고 함

// 매개변수 위치 실수가 드러나지 않음
function recordRelease(title:string, date: string) {}
recordRelease(album.releaseDate, album.title);
```

```ts
type RecordingType = 'studio' | 'live';
interface Album {
	artist: string;
	title: string;
	rleaseDate: Date;
	recordingType: RecordingType;
}

// 장점 1. 타입을 명시적으로 정의함으로써 다른 곳으로 값이 전달되어도 타입 정보 유지
function getAlbumsOfType(recordingTyep: recordingType): Album[] {}

// 장점 2. 해당 타입의 의미를 설명하는 주석을 붙여 넣을 수 있습니다.
/** 이 녹음은 어떤 환경에서 이루어졌는지? */
type RecordingType = 'studio' | 'live';

// 장점 3. keyof 연산자로 더욱 세밀하게 객체의 속성 체크가 가능해집니다.
// x
function plunk(records: any[], key: string): any[] {
	return records.map(r => r[key]);
}
// 반환 값이 keyof T 전체를 다 가질 수도 있어서 아직 타입이 넓음
function plunk<T>(records: T[], key: keyof T) {
	return records.map(r => r[key]);
}
// o
function plunk<T, K extends keyof T>(records: T[], key: K): T[K][] {
	return records.map(r => r[key]);
}
```

## 그냥 정리

### 아이템 31 타입 주변에 null 값 배치하기

* 전체가 null 이거나 아니거나 두 가지 경우만 신경쓸 수 있게 설계하기

### 아이템 32 유니온의 인터페이스보다는 인터페이스의 유니온 사용하기

* 관계를 타입으로 잘 나타낼 수 있게 인터페이스의 유니온 사용.

### 아이템 34 부정확한 타입보다는 미완성 타입을 사용하기

* 너무 세세하게 하면 또 안 좋다고 함..

### 아이템 35 데이터가 아닌, API와 명세를 보고 타입 만들기
