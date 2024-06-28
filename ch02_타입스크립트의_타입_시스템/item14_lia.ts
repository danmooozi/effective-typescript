// ---
// 값의 형태에 해당하는 타입을 정의하고 싶은 경우
const INIT_OPTIONS = {
	width: 640,
	height: 480,
	color: "#00FF00",
	label: "VGA",
};
// interface Options {
// 	width: number;
// 	height: number;
// 	color: string;
// 	label: string;
// }

// 이런 경우에 typeof 를 사용하면 됨.
type Options = typeof INIT_OPTIONS;

const exampleOptions: Options = {
	width: 800,
	height: 600,
	color: "#FF0000",
	label: "SVGA",
};

// ----
function getUserInfo(userId: string) {
	// ...
	return {
		userId,
		name,
		age,
		height,
		weight,
		favoriteColor,
	};
}
// 추론된 반환 타입은 { userId: string; name: string; age: number, ... }

type UserInfo = ReturnType<typeof getUserInfo>;
