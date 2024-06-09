### **타입스크립트의 타입 시스템**

❗이 기능들의 핵심은 `any` 타입이다.

- 점진적
  - 조금씩 타입을 추가하는게 가능
- 선택적
  - 언제든지 타입체커 해제 가능

```jsx
let age: number
age = '12'
// ~~~ Type '"12"' is not assignable to type 'number'
age = '12' as any // OK
```

- 타입 단언문(as any)을 사용해 number 타입의 age 변수에 string 타입 할당이 가능하게 함

### any 타입의 위험성

1. **any 타입에는 타입 안정성이 없다.**

- number 타입에 string 타입이 할당 가능함(→ any 타입은 모든 타입의 슈퍼타입이자 서브 타입이기 때문에)

1. **any는 함수 시그니처를 무시해 버린다.**

ℹ️ **함수 시그니처** : 함수 이름, 함수 매개변수 목록, 매개변수의 타입, 반환 타입을 포함하는 함수의 정의

```jsx
function calculateAge(birthDate: Date): number {
  return 0;
}

let birthDate: any = "1990-01-19";
calculateAge(birthDate); // OK
```

- any 타입을 사용하는 경우 calculateAge의 시그니처를 무시하게 된다.

1. **any 타입에는 언어 서비스가 적용되지 않는다.**

- 타입스크립트 언어 서비스에서 제공하는 자동완성 기능과 적절한 도움말 사용 불가
- 이름 변경 기능 사용 불**가**

1. **any 타입은 코드 리팩터링 때 버그를 감춘다.**

- item의 타입을 모르기 때문에 any로 타입을 일단 지정.

```jsx
interface ComponentProps {
  onSelectItem: (item: any) => void;
}
```

- 함수 선언 및 타입 지정

```jsx
function renderSelector(props: ComponentProps) {
  /* ... */
}

let selectedId: number = 0;
function handleSelectItem(item: any) {
  selectedId = item.id;
}

renderSelector({ onSelectItem: handleSelectItem });
```

- 이 함수에서는 id만 필요하기 때문에 타입을 다음과 같이 변경

```jsx
interface ComponentProps {
  onSelectItem: (id: number) => void;
}
```

→ 리팩토링 후 `ComponentProps` 인터페이스가 변경되었지만, `handleSelectItem` 함수는 여전히 `any` 타입의 매개변수를 기대하고 있다. 이 코드는 의도와 실제 동작이 불일치하게 된다.

1. **any는 타입 설계를 감춰버린다.**

- 객체를 정의하기 위해서는 객체 안에 있는 수많은 속성의 타입을 일일이 작성해야 한다.
- 하지만, any를 사용하면 객체의 설계를 감춰버리기 때문에 설계가 어떻게 되어 있는지 전혀 알 수 없다.

1. **any는 타입시스템의 신뢰도를 떨어뜨린다.**

- 타입시스템의 신뢰도 : 타입스크립트가 코드에서 데이터의 타입을 정확히 추론하고 검사하여 타입 오류를 조기에 발견하고 방지하는 능력.
