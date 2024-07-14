```tsx
/**
 * Returns a string with the foreground color.
 * Takes zero or one arguments. With no arguments, returns the
 * standard foreground color. With one argument, returns the foreground color
 * for a particular page.
 */
function getForegroundColor(page?: string) {
  return page === "login" ? { r: 127, g: 127, b: 127 } : { r: 0, g: 0, b: 0 };
}

export default {};
```

- 주석 : string 형식의 color를 리턴. 0개의 매개변수인 경우 표준 color를, 한 개인 경우 특정 페이지의 color를 리턴한다.
- 함수 : string 형태의 color가 아닌 `{r, g, b}`형태의 객체를 리턴

❗가장 큰 문제는 함수보다 주석이 더 길다.

### 주석 대신 타입 정보를 작성

```tsx
// HIDE
type Color = { r: number; g: number; b: number };
// END
/** Get the foreground color for the application or a specific page. */
function getForegroundColor(page?: string): Color {
  // COMPRESS
  return page === "login" ? { r: 127, g: 127, b: 127 } : { r: 0, g: 0, b: 0 };
  // END
}
```

### 매개변수 설명은 @param 구문

### 값을 변경하지 않는다는 주석

```tsx
/** Does not modify nums */
function sort(nums: number[]) {
  /* ... */
}
function sort(nums: readonly number[]) {
  /* ... */
}
```

- 아래 코드처럼 readonly를 선언하여 타입스크립트가 규칙을 강제할 수 있게 하면 된다.

### 타입이 명확하지 않은 경우는 변수명에 단위 정보를 포함.

- 변수명을 ageNum으로 하는 것보다는 age로 하고 타입을 number로 명시
- 단위가 있는 숫자들의 경우에는 time보다는 timeMs로
