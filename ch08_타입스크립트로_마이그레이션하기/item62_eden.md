# 62. 마이그레이션의 완성을 위해 noImplicitAny 설정하기

noImplicitAny가 설정되지 않으면 잠재적인 오류가 드러나지 않은 것일 수 있다.  
아래 예시에도 getRanges 내부의 로직을 살펴보면 indices의 타입은 number[][]여야 하는게 맞다.  
하지만 number[]로 잘못된 타입으로 지정되었고 r은 이에 따라 number로 유추되었으나, r에 인덱스 접근을 해도 에러가 발생하지 않는다.

```ts
class Chart {
  indices: number[];

  getRanges() {
    for (const r of this.indices) {
      const low = r[0]; // 타입이 any
      const high = r[1]; // 타입이 any
      // ...
    }
  }
}
```

이와 달리 noImplicitAny를 적용하면 다음과 같이 에러가 발생한다.

```ts
class Chart {
  indices: number[];

  getRanges() {
    for (const r of this.indices) {
      const low = r[0];
      // 'Number' 형식에 인덱스 시그니처가 없으므로 요소에 암시적으로 'any' 형식이 있습니다.
      const high = r[1];
      // 'Number' 형식에 인덱스 시그니처가 없으므로 요소에 암시적으로 'any' 형식이 있습니다.
    }
  }
}
```

이러한 오류를 잡기 위해 noImplicitAny를 로컬에 적용하고 확인하며 전환을 진행하면 좋다.  
빌드에 실패하지 않는 선에서 문제를 수정해나가면서 점진적으로 마이그레이션 해 나갈 수 있다.  
그 뒤에 noImplicitAny를 원격에 적용하고 `"strict": true`를 적용하는 등 타입 체크의 강도를 높여가면 된다.
