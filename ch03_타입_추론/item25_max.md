### 콜백보다는 프로미스나, async/await를 사용해야 하는 이유

- 콜백보다는 프로미스가 코드를 작성하기 쉽다.
- 콜백보다는 프로미스가 타입을 추론하기 쉽다.

```jsx
async function fetchPages() {
  const [response1, response2, response3] = await Promise.all([
    fetch(url1),
    fetch(url2),
    fetch(url3),
  ]);
  // ...
}
```

- 타입스크립트는 세 가지 response 변수 각각의 타입을 Response로 추론한다.

### Promise.race

- Promise.race를 사용하여 프로미스에 타임아웃을 추가하는 방법
  ```tsx
  function timeout(millis: number): Promise<never> {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject("timeout"), millis);
    });
  }

  async function fetchWithTimeout(url: string, ms: number) {
    return Promise.race([fetch(url), timeout(ms)]);
  }
  ```
- 타입 구문이 없어도 `fetchWithTimeout`의 타입은 Promise<Response>로 추론된다.
- 추론 과정
  - Promise.race의 반환 타입은 입력 타입들의 유니온. → Promise<Response | never>
  - never와의 유니온은 아무런 효과가 없다 → 결과 Promise<Response>

### 프로미스 생성보다는 async/await 사용

- 가끔 프로미스를 직접 생성해야 하는 경우가 있다. 특히 setTimeout과 같은 콜백 API를 래핑하는 경우
- 그러나 선택의 여지가 있다면 일반적으로는 프로미스를 생성하기보다는 async/await를 사용해야 한다.
  - 일반적으로 더 간결하고 직관적인 코드가 된다.
  - async 함수는 항상 프로미스를 반환하도록 강제한다.
  ```tsx
  const getNumber = async () => 42; // Type is () => Promise<number>
  ```
  - 프로미스를 직접 생성
  ```
  const getNumber = () => Promise.resolve(42) // Type is () => Promise<number>

  ```
  - 즉시 사용 가능한 값에도 프로미스를 반환하는 것이 이상하게 보일 수 있지만, 실제로는 비동기 함수로 통일하도록 강제하는 데 도움이 된다.
  - 함수는 항상 동기, 항상 비동기로 실행되어야 하며 절대 혼용해서는 안된다.

### 동기, 비동기 혼용 사용한 경우

```jsx
const _cache: { [url: string]: string } = {};
function fetchWithCache(url: string, callback: (text: string) => void) {
  if (url in _cache) {
    callback(_cache[url]);
  } else {
    fetchURL(url, (text) => {
      _cache[url] = text;
      callback(text);
    });
  }
}
```

- 캐시된 경우, 콜백 함수가 동기로 호출되어 fetchWithCache 함수는 이제 사용하기가 어려워진다.

```tsx
let requestStatus: "loading" | "success" | "error";
function getUser(userId: string) {
  fetchWithCache(`/user/${userId}`, (profile) => {
    requestStatus = "success";
  });
  requestStatus = "loading";
}
```

- getUser를 호출한 후에 requestStatus의 값은 온전히 profile이 cache되었는지 여부에 달려있다.
- 캐시되어 있지 않다면 requestStatus는 조만간 `success`가 된다.
- 캐시가 되어 있다면 `success` 가 되고 나서 바로 `loading`으로 다시 돌아간다.

- async를 두 함수에 모두 사용하면 일관적인 동작을 강제한다.

```jsx
const _cache: { [url: string]: string } = {};
async function fetchWithCache(url: string) {
  if (url in _cache) {
    return _cache[url];
  }
  const response = await fetch(url);
  const text = await response.text();
  _cache[url] = text;
  return text;
}

let requestStatus: "loading" | "success" | "error";
async function getUser(userId: string) {
  requestStatus = "loading";
  const profile = await fetchWithCache(`/user/${userId}`);
  requestStatus = "success";
}
```

- 두 함수가 모두 async인 경우 requestStataus가 success로 끝나는 것이 명백해졌다.
- async함수에서 프로미스를 반환하면 또 다른 프로미스(Promise<Promise<T>>)로 래핑되지 않고 하나의 프로미스(Promise<T>)만 반환.
