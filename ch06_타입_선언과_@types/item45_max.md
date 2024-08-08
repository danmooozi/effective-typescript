# item 45. devDependencies에 typescript와 @types 추가하기

### package.json

- 프로젝트가 의존하고 있는 라이브러리들의 버전을 지정.

### dependencies

- 프로젝트를 실행(런타임에 필요)하는 데 필수적인 라이브러리들
- npm에 공개된 패키지를 설치하는 경우, dependencies에 들어 있는 라이브러리도 함께 설치
    - 전이 의존성

### devDependencies

- 현재 프로젝트를 개발하고 테스트하는 데 사용되지만, 런타임에는 필요 없는 라이브러리들
- dependecies에 명시된 패키지와는 다르게 다른 사용자가 설치하면 devDependencies에 포함된 라이브러릳들은 제외된다.

### peerDependencies

- 런타임에  필요하긴 하지만, 의존성을 직접 관리하지 않는 라이브러리들.
- 플러그인
    - 플러그인이 사용되는 실제 프로젝트에서 선택하도록 만들 떄 사용

## Typescript dependencies

- 타입스크립트의 타입은 런타임에 존재하지 않으니까 타입스크립트와 관련된 라이브러리는 일반적으로 devDependencies에 속한다.

### TS에서 공통적으로 고려해야 할 의존성 두 가지

1. **TS 자체 의존성**
- ts는 시스템 레벨로 설치할 수도 있지만 동일 버전 설치 보장이 없고, 프로젝트 셋업 시 별도의 단계가 추가되어야 해 추천하지 않음
- devDependencies에 추가하면 정확한 버전의 타입스크립트 설치 가능
- npx를 사용해서 devDependencies를 통해 설치된 타입스크립트 컴파일러를 실행 가능

1. **타입 의존성(@types)**
- 라이브러리에 타입 선언이 포함되어 있지 않은 경우 DefinitelyTyped에서 타입 정보를 얻을 수 있다.
    - 타입 정보만 있고, 구현체는 없음
- 원본 라이브러리가 dependencies에 있어도 @types는 devDependecies에 포함
