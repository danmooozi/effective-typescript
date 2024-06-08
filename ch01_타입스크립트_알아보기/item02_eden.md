## 2. 타입스크립트 설정 이해하기

타입스크립트 설정에서는 어떤 파일을 컴파일 할지, 출력 파일의 형태가 무엇인지 등의 컴파일러 관련 설정도 있지만, **언어의 핵심 요소를 설정하는 것도 가능하다.**  
`noImplicitAny`와 `strictNullChecks`는 언어의 고수준 설계를 변경하는 대표적인 설정들이다.  
이들을 어떤 값으로 설정했는지에 따라 타입스크립트는 완전히 다른 언어처럼 동작한다.

### noImplicitAny

`noImplicitAny`는 **암시적인 any 타입 유추를 금지하는 설정**이다.  
예를 들어 다음 코드에 `noImplicitAny`가 설정되어 있지 않다면, 아무런 타입 정보가 없는 매개변수들이 모두 any로 유추되고, 타입 체커를 통과한다.

```ts
function add(a, b) {
  return a + b;
}
// function add(a: any, b: any): any
```

하지만 noImplicitAny 설정을 하게 되면 해당 부분들에서 모두 타입 체크에 실패한다.  
타입 체크를 통과하기 위해서는 모든 매개변수의 타입을 명시해야 한다.

```ts
function add(a: number, b: number) {
  return a + b;
}
```

noImplicitAny 설정을 해제하는 것은 자바스크립트 프로젝트를 타입스크립트로 전환하는 상황에만 한시적으로 허용된다.  
그 외의 경우에는 가능한 noImplicitAny를 설정하여 코드를 작성할 때마다 타입을 명시하도록 해야 한다.

### strictNullChecks

`strictNullChecks`는 **undefined, null과 관련된 타입을 엄격하게 체크할지를 설정하는 값**이다.  
strictNullChecks가 설정되면 일반 타입과 undefined/null이 명확히 구분되며, 명시적으로 null 체크 등의 처리를 해야 타입 체크에 통과할 수 있다.

예를 들어 strictNullChecks가 설정되어 있을 때 다음 코드는 타입체커에 걸리게 된다.

```ts
const x: number = null;
//    ~ 'null' 형식은 'number' 형식에 할당할 수 없습니다.
const x: number = undefined;
//    ~ 'undefined' 형식은 'number' 형식에 할당할 수 없습니다.
```

null을 할당하기 위해서는 타입 지정 시 명시적으로 null을 허용해야 한다.

```ts
const x: number | null = null;
```

또한 nullable한 변수들은 null 체크나 타입 단언을 거쳐야 일반 타입으로 사용할 수 있다.

```ts
const el = document.getElementById("status1");

el.textcontent = "Ready"; // el 개체가 'null'인 것 같습니다.

// null 체크
if (el) {
  el.textcontent = "Ready";
}

// 타입 단언
el!.textcontent = "Ready";
```

strictNullChecks를 설정하기 위해서는 null 체크 코드가 많은 부분에 추가되어야 한다.  
이로 인해 설정 난이도가 높은 편이지만, 런타임에서 'undefined는 객체가 아닙니다.' 등의 에러가 발생하는 것을 상당 부분 방지할 수 있다.

### 다른 언어에서는 어떨까? (ex. Java)

java는 대표적인 정적 타입 언어이다.  
java에서는 타입 유추라는 개념이 없기 때문에, 모든 변수의 선언부에는 타입이 명시되어야 한다.  
따라서 implicitAny와 같은 설정 자체가 성립하지 않는다.

```java
public class Main {
  public static void add(int a, int b) {
    int sum = a + b;  // 타입 유추 x, 직접 int로 명시
    System.out.println(a + b);
  }
}
```

또한 java의 클래스 타입에는 언제나 null이 할당될 수 있다.  
따라서 strictNullChecks가 언제나 false로 설정된 것과 같다.

```java
public class Main {
  public static void add(int a, int b) {
    Object obj = null;  // null 할당 가능
    String str = null;  // null 할당 가능
  }
}
```

java 진영에서도 이러한 점이 null 체크의 필요성을 감출 수 있음을 우려하여, java 8부터는 Optional이라는 클래스를 제공하고 있다.  
Optional은 null을 명시적으로 다룰 수 있도록 도와준다.

```java
Optional<String> possibleValue = Optional.empty();

// 값이 존재할 경우 처리
possibleValue.ifPresent(value -> System.out.println("Value is: " + value));

// 값이 없을 경우 대체값 사용
String valueOrDefault = possibleValue.orElse("Default Value");

// 값이 없을 경우 예외 발생
String valueOrException = possibleValue
  .orElseThrow(() -> new IllegalArgumentException("Value not found"));
```
