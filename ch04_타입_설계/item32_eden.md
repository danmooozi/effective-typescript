# 32. 유니온의 인터페이스보다는 인터페이스의 유니온 사용하기

유니온 속성을 가지는 인터페이스를 정의하는 대신 인터페이스의 유니온으로 정의하는 것이 더 적합할 수 있다.  
이를 통해 속성들이 잘못된 조합으로 섞이는 것을 막고, 타입이 유효한 상태만을 표현하도록 할 수 있다.

예를 들어 특정 위치와 색을 나타내는 타입을 정의 중이라고 하자.  
기하학적인 특성에 따라서 Fill, Line, Point 로 나뉘고, 각 속성들은 종류에 따라 매칭되는 타입이 존재한다.  
이 때 각 속성을 다음과 같이 인터페이스의 유니온으로 정의할 수 있다.

```ts
interface Layer {
  layout: FillLayout | LineLayout | PointLayout;
  paint: FillPaint | LinePaint | PointPaint;
}
```

이 때 Layer 인터페이스는 속성들의 잘못된 조합을 허용한다는 문제를 가지고 있다.  
예를 들어 layout이 FillLayout 이면서 paint가 LinePaint 인 경우는 유효하지 않으나, 위 인터페이스는 이를 허용한다.  
이렇게 설계하는 대신 각 종류에 맞게 별개로 인터페이스를 정의하고, 해당 인터페이스들의 유니온으로 전체 타입을 정의하면 더 나은 설계가 된다.  
이 때 태그된 유니온 타입으로 구성하면 태그 속성으로 타입을 구분할 수 있다.

```ts
interface FillLayer {
  type: "fill";
  layout: FillLayout;
  paint: FillPaint;
}

interface LineLayer {
  type: "line";
  layout: LineLayout;
  paint: LinePaint;
}

interface PointLayer {
  type: "point";
  layout: PointLayout;
  paint: PointPaint;
}

type Layer = FillLayer | LineLayer | PointLayer;

function drawLayer(layer: Layer) {
  if (layer.type === "fill") {
    // FillLayer
  } else if (layer.type === "line") {
    // LineLayer
  } else {
    // PointLayer
  }
}
```

특정 속성들이 동시에 undefined이거나 동시에 값이 있는 경우에도 동일한 방식으로 설계를 개선할 수 있다.  
다음 예시에서 Person 인터페이스의 placeOfBirth, dateOfBirth은 둘 다 동시에 있거나 동시에 없는 속성이다.  
이 때 속성들을 각각 optional 하게 정의하는 것보다는, 두 개의 속성을 하나로 묶어서 전체를 optional 하게 설계하면 더 적합하다.

```ts
interface Person {
  name: string;
  placeOfBirth?: string;
  dateOfBirth?: Date;
}

interface Person {
  name: string;
  birth?: {
    place: string;
    date: Date;
  };
}
```

하지만 위 방식은 birth 속성 내에 place, date를 위치시키는 식으로 데이터 구조를 변경해야 한다.  
데이터 구조 변경이 어렵다면, placeOfBirth와 dateOfBirth가 함께 존재하거나 존재하지 않는 인터페이스들의 유니온으로 타입 정의를 개선할 수 있다.

```ts
interface Name {
  name: string;
}

interface PersonWithBirth extends Name {
  placeOfBirth: string;
  dateOfBirth: Date;
}

type Person = Name | PersonWithBirth;
```
