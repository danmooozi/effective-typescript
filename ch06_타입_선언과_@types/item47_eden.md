# 47. 공개 API에 등장하는 모든 타입을 익스포트하기

타입스크립트를 기반으로 라이브러리를 제작할 떄에는 공개하는 API에 사용하는 타입들은 모두 공개하는 것이 좋다.  
함수 시그니처의 매개변수나 반환값에 쓰인 타입을 공개하지 않더라도, Parameters 나 ReturnType 등의 도구들을 사용하면 타입을 추출해낼 수 있다.  
따라서 라이브러리 제작자가 타입을 숨기고 싶어서 공개하지 않더라도, 어차피 사용자들은 타입을 추출해서 사용할 수 있다.  
예를 들어 아래 예시에서 getGift의 매개변수에 쓰이는 SecretName이나 반환값에 쓰이는 SecretSanta를 익스포트하지 않더라도, 사용자들은 `Parameters`와 `ReturnType`을 이용하여 타입을 추출할 수 있다.

```ts
interface SecretName {
  first: string;
  last: string;
}

interface SecretSanta {
  name: SecretName;
  gift: string;
}

export function getGift(name: SecretName, gift: string): SecretSanta {
  // ...
}

type MySanta = ReturnType<typeof getGift>; // SecretSanta
type MyName = Parameters<typeof getGift>[0]; // SecretName
```

따라서 공개한 API에 포함된 타입들은 모두 함께 익스포트해서 공유하는 것이 좋다.
