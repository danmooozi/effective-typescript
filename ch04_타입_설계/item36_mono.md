# 아이템36 해당 분야의 용어로 타입 이름 짓기

이름을 짓는건 언제나 매우 중요하다 ! 

동물들의 데이터베이스를 구축한다고 가정했을때, 이를 표현하기 위한 인터페이스는 다음과 같다.

```tsx
interface Animal {
	name: string;
	endangered: boolean;
	habitat: string;
}
const leopard: Animal = {
	name: 'snow leopard',
	endangered: false,
	habitat: 'tundra'
}
```

이 코드에는 네 가지 문제가 있다고 한다.

- name은 매우 일반적인 용어이다.동물의 학명인지 일반적인 명칭인지 알 수 없다.
- endangered 속성은 boolean 으로 하는거 자체가 이상합니다. 멸종 위기나 멸종을 표현하고 싶은 것 같은데, 이미 멸종된 동물들은 어떻게 처리해야할까요?
- 서식지를 나타내는 habitat 속성은 너무 범위가 넓은 string 타입이다.
- 객체의 변수명이 leopard 이지만,name 속성의 값은 ‘snow leopard’ 라서 의도 파악이 어렵다.

그래서 이것을 문제 해결해서 만든 버전은

```tsx
interface Animal {
    commonName: string;
    genus: string;
    species: string;
    status: ConservationStatus;
    climates: KoppenClimate[];
}
type ConservationStatus = 'EX'|'EW'|'CR'|'EN'|'VU'|'NT'|'LC';
type KoppenClimate = 'AF' | 'Am' | 'As' | 'Aw' | 'Bsh' ... ~ ;
```

- name 을 더 명확히 하기 위해 commonName, genus, species 으로 구분했고
- endangerd 는 status 로 변경했다.
- climates 가 원래 쓰는 단어라 변경했다.

이걸 보면서 endagerd 를 status 로 변경한게 진짜 별로다. 뒤에 쓴사람이 하지말라는 것을 기대로 한거나 다름이 없다. 그래서 쓴사람은 다음과 같이 3가지 규칙을 제시했다.

- 동일한 의미를 나타낼 때는 같은 용어를 사용해야 합니다. 글을 쓸 때나 말을 할 때, 같은 단어를반복해서 사용하면 지루할 수 있기 때문에 동의어를 사용합니다. 그러나 코드에서는 좋지 않습니다.
- data, info, thing, item, object, entitiy 같은 모호한 애들은 피해야 합니다.
- 이름을 지을 때는 포함된 내용이나 계산 방식이 아니라 데이터 자체가 무엇인지를 고려해야합니다. 예를 들어, INodeList 가 아니라 directory 라고 짓는게 더 좋다.

### i-node list

- 리눅스에서 파일에 대한 속성 정보를 관리하기 위한 block
- 파일들에 대한 속성정보를 담고 있는 i-node 구조체 리스트로 구성됨
- i-node에는 파일명이 없음. 파일명은 디렉토리를 통해 관리됨
    - 디렉토리는 파일명과 inode number의 매핑정보를 가지고 있는 특수한 파일임
- 침해사고 발생 시, 시스템 파일 무결성 확인을 위해 타임라인을 분석하는데, 이 때 i-node 구조체의 MAC Time을 점검함
