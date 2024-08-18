# 아이템 51 의존성 분리를 위해 미러 타입 사용하기

node js를 사용하여 구현한 `parseCSV` 함수를 만들자고 해보자.

```tsx
function parseCSV(contents: string | Buffer): {[column: string]: string} {
    if(typeof contents === 'object') {
		    // 버퍼인 경우
        return pasrseCSV(contents.toString('utf-8'));
    }
    // ...
}
```

해당 함수의 인자로 사용되는 타입 `Buffer`는 node.js 에서만 제공하는 타입이라서 devDependencies에 의존성을 추가해야한다. ( 아이템 45 )
`npm install --save-dev @types/node`

그러면 다음 사람들이 곤란해진다.

- typescript와 무관한 개발자
- node와 무관한 개발자

앞에서한 구조적 타이핑을 이용해서 해결하면 된다.

이러한 특성을 사용하여 기존의 라이브러리에서 제공하는 타입인 `Buffer`를 포함하는 **새로운 미러 타입**을 선언하여 사용한다.

```tsx
interface CsvBuffer {
    toString(encoding: string) : string;
}

function parseCSV(contents: string | CsvBuffer): {[column: string]: string} {
    if(typeof contents === 'object') {
        return pasrseCSV(contents.toString('utf-8'));
    }
}

```

`Buffer` 대신 우리가 새롭게 선언한 `CsvBuffer`를 사용하였다.

추후에 node개발자가 `Buffer`를 사용하는 경우, `Buffer` 타입 또한 `toString` 속성을 가지고 있으므로 `CsvBuffer` 타입에 포함되며 마찬가지로 `parseCSV` 함수를 사용할 수 있게 된다.

### 요약

- 필수가 아닌 의존성을 분리할 때는 구조적 타이핑을 사용한다.
- 공개한 라이브러리를 사용하는 자바스크립트 사용자가 @types 의존성을 가지지않게 해야 합니다. 반대도 마찬가지.
