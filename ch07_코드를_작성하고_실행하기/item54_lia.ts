const obj = {
	one: "uno",
	two: "dos",
	three: "tres",
};
for (const k in obj) {
	const v = obj[k];
}

let k: keyof typeof obj; // "one" | "two" | "three" 타입
for (k in obj) {
	const v = obj[k]; // 정상
}

interface ABC {
	a: string;
	b: string;
	c: number;
}

const x = { a: "a", b: "b", c: 2, d: new Date() };
foo(x); // 정상

function foo(abc: ABC) {
	let k: keyof ABC;
	for (k in abc) {
		// let k: "a" | "b" | "c"
		const v = abc[k]; // string | number 타입
	}
}
