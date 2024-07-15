# 아이템28 유효한 상태만 표현하는 타입을 지향하기

```ts
interface State {
	pageText: string;
	isLoading: boolean;
	error?: string;
}

function renderPage(state:State) {
	if(state.error) return `Error! Unable to load ${currentPage}: ${state.error}`
	else if(state.isLoading) return `Loading ${currentPage}...`;

	return `<h1>${currentPage}</h1>\n${state.pageText}`
}
// isLoading이 true이고 error 값이 존재하면 로딩중인지 오류상태인지 모른다...?

async function changePage(state: State, newPage: string) {
	state.isLoading = true;
	try {
		const res = await fetch(getUrlForPage(newPage));
		if(!res.ok) throw new Error(`Unable to load ${newPage}: ${res.statusText}`);
		const text = await res.text();
		state.isLoading = false;
		state.pageText = text;
	} catch(e) {
		state.error = '' + e;
	}
}
// 에러시 state.isLoading을 false로 바꾸는 부분이 없음
// state.error 초기화 하는 로직이 없음
// 로딩 중에 페이지를 바꿔버리면?
```

* 위 예제에서는 에러와 로딩에 대한 정보 부족과 충돌 때문에 무효한 상태 허용

```ts
interface requestPending {
	state: 'pending';
}
interface RequestError {
	state: 'error';
	error: string
}
interface RequestSuccess {
	state: 'ok';
	pageText: string;
}
type RequestState = RequestPending | RequestError | RequestSuccess;
interface State {
	currentPage: string;
	requests: {[page:string]: RequestState};
}

function renderPage(state: State) {
	const { currentPage } = state;
	const requestState = state.requests[currentPage];
	switch (requestState.state) {
		case 'pending':
			return `Loading ${currentPage}...`;
		case 'error':
			return `Error!`;
		case 'ok':
			return `${requestState.pageText}`;
	}
}
async function changePage(state: State, newPage: string) {
	state.requests[newPage] = {state: 'pending'};
	state.currentPage = newPage;
	try {
		const res = await fetch(getUrlForPage(newPage));
		if(!res.ok) throw new Error(`Unable to load ${newPage}: ${res.statusText}`);
		const text = await res.text();
		state.requests[newPage] = {state: 'ok', pageText:text}
	} catch(e) {
		state.requests[newPage] = {state: 'error', error: '' + e}
	}
}
```

* 위 예제에서는 모호함이 없어짐. 페이지별 요청을 나눴기 때문에 페이지 이동시 대응도 가능.

```ts
interface CockpitControls {
	leftSideStick: number;
	rightSideStick: number;
}

function getStickSetting(controls: CockpitControls) {
	const { leftSideStick, rightSideStick } = controls;
	if(leftSideStick === 0) return rightSideStick;
	else if(rightSideStick === 0) return leftSideStick;
	// 두 스틱 모두 중립이 아닌 경우

	// 비슷한 값이라면 평균 이용하면 좋겠지만, 다른 값이라면...?
	if(Math.abs(leftSideStick - rightSideStick) < 5) {
		return (leftSideStick + rightSideStick) / 2;
	}
}
```

* 주어진 입력으로는 getStickSetting을 구현하는 제대로 된 방법이 없음
* 원래 비행기에서는 기계적으로 두 스틱이 연결되어 있어서 상태가 하나라고 함 ㅜ

## 그냥 정리

### 아이템26 타입 추론에 문맥이 어떻게 사용되는지 이해하기

* 타입을 지정하여 값 제한, const 사용

### 아이템27 함수형 기법과 라이브러리로 타입 흐름 유지하기

* 서드파티 라이브러리 이용하는 거 싫어했는데, 꽤 좋을지도..

### 아이템 29 사용할 때는 너그럽게, 생성할 때는 엄격하게

* 반환 타입이 넓으면 쓰기 불편하다

### 아이템 30 문서에 타입 정보를 쓰지 않기

* 와.... 진짜 맥스......