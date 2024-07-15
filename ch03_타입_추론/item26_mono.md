## 아이템 26 타입 추론에 문맥이 어떻게 사용되는지 이해하기

문맥에 따라 화가나는 일이 생길 수 있다. 리팩토링 관련한 부분인데 한 번 보자.

```tsx
function setLanguage(language: string) { /* ... */ }

setLanguage('JavaScript'); // 정상

let language ='JavaScript';
setLanguage(language); // 정상
```

이걸 유니온 타입 받아서 한다고 해보자

```tsx
type Language = 'JavaScript' | 'TypeScript' | 'Python';
function setLanguage(language: Language) { /* ... */ }

setLanguage('JavaScript'); // 정상

let language ='JavaScript';
setLanguage(language); // 에러남 'string'으로 추론
```

지난번에 21아이템에서 했던대로 누가 이렇게 하는지 모르겠지만 에러난다. 당연히 해결방법은

```tsx
let language: Language ='JavaScript';
setLanguage(language); 

const language = 'JavaScript';
setLanguage(language); 
```

배운대로 명시해버리거나 const 해버리는 것이다.

<aside>
💡 어떤 언어는 변수의 최종 사용처에 기반하여 타입을 추론하기도 합니다. 그러나 이런 방법 역시 혼란스럽습니다. 타입스크립트 창시자인 아네르스 하일스베르는 이를 ‘먼 곳의 소름끼치는 일(spooky action at a distance)’이라고 했습니다. 타입스크립트는 일반적으로 값이 처음 등장할 때 타입을 결정합니다.

</aside>

### 튜플 사용시 주의

```tsx
function panTo(where : [number, number]) { /* ... */ }

panTo([10, 20]);

const loc = [10, 20];
panTo(loc); //  ~ number[] 로 추론하기 때문에 실패함

const loc = [10, 20] as const;
panTo(loc); // readonly[10, 20] 으로 추론해서 실패함
```

그래서 해결 방법이라고 나오는게 함수를

```tsx
function panTo(where : readonly [number, number]) { /* ... */ }
```

로 바꾸라는데 솔직히 별로인 방법이라고 생각한다.

### 객체 사용 시 주의

```tsx
type Language = 'JavaScript' | 'TypeScript' | 'Python';
interface GovernedLanguage {
    language: Language;
    organization: string;
}

function complaing(language: GovernedLanguage) { /* ... */ }

complaing({ language:'TypeScript', organization:'Microsoft' }); // 됨

const ts = {
    language:'TypeScript', 
    organization:'Microsoft' 
}

complaing(ts) // language 가 string 으로 추론되어서 안됨
```

as const 나 명시하는걸로 되는데. 혹시 Object.freeze 도 눈치것 되려나 ? 했는데 안됨 ㅜㅠ

### 콜백 사용 시 주의

```tsx
function callWithRandomNumbers(fn :(n1: number, n2: number) => void) {
   fn(Math.random(), Math.random());
};

callWithRandomNumbers((a,b) => {
   a; // number
   b; // number
   console.log(a + b);
});

const fn = (a, b) => {

}

callWithRandomNumbers(fn);
// 이케하면 a,b 가 any 로 추론됨
// 그러니깐 매게변수도 걍 붙이자.
```

### 요약

- 개인적인 생각인데 타입 명시하고 하면 다 해결될 것 같은데 왜 이렇게 추론빵 하는지 모르겠다. 굳이굳이 추론 레벨업 시켜주려고 그런것이라면, 한 번 봐주도록 하자.

### 아이템 27

예시가 좀 에바이기도 하고, 이 주자는 자바스크립트 내용은 뭔가 기시감이 있는데..

### 아이템 28

첫 예시보고 고객가 갸우똥 되어서 접었다. 해오는 사람이 잘 설명해주겠지 ?

### 아이템 29

나는 그래도 생성할때나 사용할때나 엄격했으면 좋겠다.

### 아이템 30

정보 모순이 일어나지 않는 것이 중요한듯.
