### 아이템 10 객체 래퍼 타입 피하기

> 기본형들은 불변이며 메서드를 가지지 않는다.

```
> 'primitive'.charAt(3)
"m"
```

**1. 기본형은 메서드를 가지지 않는다.**

- 자바스크립트에는 메서드를 가지는 String `객체` 타입이 정의되어 있다.
- 자바스크립트는 기본형과 객체 타입을 자유롭게 변환한다.

2. **객체 래핑 과정**
1. 래핑 : 기본형 문자열은 자동으로 String 객체로 래핑된다.
   ```
   let tempStrObj = new String(str)
   ```
1. 메서드 호출 : 임시 객체에서 tempStrObj에서 toUpperCase() 메서드를 호출
   ```
   let upperStr = tempStrObj.toUpperCase();
   ```
1. 래핑 객체 버림 : 메서드 호출이 완료된 후, 임시로 생성된 String 객체는 버려지고, toUpperCase() 메서드 결과만 반환
   ```
   tempStrObj = null; // 임시 객체는 버려집니다.
   ```

**2. string 사용시 유의 사항**

1. 정상 동작하는 경우

   ```
   const getStringLength = (foo: String) => {
       return foo.length;
   }

   getStringLength("hello"); // 정상
   getStringLength(new String("hello")); // 정상
   ```

2. string을 매개변수로 받는 메서드에 String 객체를 전달하는 경우 문제 발생
   ```
   const isGreeting(phrase: String) => {
       return [
           'hello',
           'good day'
       ].includes(phrase);
   }
   ```
   - string에는 String을 할당할 수 있지만, String은 string에 할당할 수 없다.

**결론**

- 기본형 값과 객체 래퍼 타입의 차이를 이해하고, 불필요한 객체 래핑을 피해야 한다.
- 기본형 값을 사용하는 것이 더 효율적이며, 불필요한 타입 변환으로 인한 오류를 방지할 수 있다.
- 특히, 함수 매개변수로 기본형 값을 기대하는 경우, 객체 래퍼 타입을 사용하지 않도록 주의해야 한다.
