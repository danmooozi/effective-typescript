# 아이템 56 정보를 감추는 목적으로 private 사용하지 않기

옛날 어른들은 (_) 를 접두로 넣어서 비공개로 하였다.

```tsx
class Foo {
	_private = 'secret123';
}
```

그러나 이렇게 만들어도 결국 접근할 수 있었다. 타입스크립트는 public, protected, private 접근 제어자를 사용해서 공개 규칙을 강제할 수 있는 것으로 올해하지만 ( 실제 private 처럼 작동할꺼라 기대함 )

런타임에서는 실제로 그렇게 작동하지 않는다.

```tsx
class Diary {
	private secret = '';
}

const diary = new Diary();
diary.secret
// 에디터에서는 private 이라서 안된다고 나옴
```

이 코드는 실제 런타임에서

```tsx
class Diary {
	construtor() {
		this.secret = '';
	}
}

const diary = new Diary();
diary.secret
```

그렇기 때문에 실제로 숨겨야 되는 데이터라면 private 를 사용해서는 안된다.

그러면 어떻게 해야 할까 ?

그거슨 바로 클로저를 사용한 방법이다.

```tsx
class PasswordChecker {
    checkPassword: (password: string) => boolean;
    constructor(passwordHash: number) {
        this.checkPassword = (password: string) => {
            return hash(password) === passwordHash;
        }
    }
}
```

- `passwordHash`는 생성자에서만 접근이 가능하다. 즉, 해당 변수는 감추어졌다.
- 하지만 해당 변수에 접근하기 위해서는 반드시 생성자 내에서 선언되어야하므로, 메서드 역시 내부에 정의되어야하고, 이렇게 되면 메서드의 복사본이 모든 인스턴스에 생성되기 때문에 메모리가 낭비된다. (클래스의 메서드의 경우, 모든 인스턴스가 공유할 수 있다.)

혹은 요즘 사용하는 # 접두사를 붙이는 거다.

```tsx
class javascript {
	#secret = '';
}
```

### 요약

- public, protected, private 는 타입 시스템에서만 동작하고 런타임에서는 소용없다.
- 확실히 데이터를 감추고 싶다면 클로저를 사용해야 한다.
