// 인사말을 생성합니다. 결과는 보기 좋게 꾸며집니다.
/** 인사말을 생성합니다. 결과는 보기 좋게 꾸며집니다. */ // 이렇게 해두는 게 좋음
function greet1(name: string, title: string) {
	return `Hello ${title} ${name}`;
}

// jsDoc 스타일을 쓰기 때문에 적극적으로 쓰면 좋다고 함

/** 
 * 인사말을 생성합니다.
 * @param name 인사할 사람의 이름
 * @param title 그 사람의 칭호
 * @returns 사람이 보기 좋은 형태의 인사말
 */
function greet2(name: string, title: string) {
	return `Hello ${title} ${name}`;
}
// 함수 호출 부분에서 설명을 보여주기 때문에 좋음

/** 특정 시간과 장소에서 수행된 측정 */
interface Mesurement {
	/** 어디에서 측정되었나? */
	position: Vector3D;
	// ...
}
// Mesurement 객체 각 필드에 마우스를 올려 보면 필드별로 설명을 볼 수 있음

// 주석은 마크다운 형식으로 꾸며지므로 굵은 글씨, 기울임글씨, 글머리 기호 목록을 사용할 수 있음
/**
 * 이 _interface는 **세 가지** 속성을 가집니다.
 * 1. x
 * 2. y
 */
interface Vector3D {
	x: number;
	y: number;
}