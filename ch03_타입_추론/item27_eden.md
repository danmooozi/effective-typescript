# 27. 함수형 기법과 라이브러리로 타입 흐름 유지하기

자바스크립트에는 Lodash, Ramda와 같은 라이브러리를 통해 유용한 유틸리티 기능이나 함수형 기법을 사용하는 것이 가능하다.  
이러한 라이브러리의 일부 기능들은 순수 자바스크립트에도 구현되어 있다. (map, reduce, filter 등)  
이들을 잘 활용하면 루프를 대체할 수 있어서 불필요한 코드를 상당 부분 줄일 수 있고, 타입 스크립트와도 잘 호환되어 타입 흐름을 유지할 수 있다.

예를 들어 csv를 파싱하여 객체를 만드는 코드를 작성한다고 해보자.  
reduce를 사용하면 함수형으로 코드를 작성할 수 있지만, 타입을 명시적으로 지정해주지 않으면 타입 에러가 발생한다.  
이러한 에러를 방지하기 위해서는 {}의 타입을 `Record<string, string>`으로 명시적으로 지정해주어야 한다.

```typescript
const rows = rawRows.slice(1).map((rowStr) =>
  rowStr.split(",").reduce((row, val, i) => {
    row[headers[i]] = val;
    // '{}' 형식에서 'string' 형식의 매개변수가 포함된 인덱스 시그니처를 찾을 수 없습니다.
    return row;
  }, {})
);
```

이와 달리, lodash의 `_.zipObject`를 사용하면 타입을 지정하지 않아도 타입이 정확히 추론된다.

```typescript
// _.Dictionary<string>[] - 로대시의 타입 별칭, Record<string, string>과 동일
const rows = rawRows
  .slice(1)
  .map((rowStr) => _.zipObject(headers, rowStr.split(",")));
```

데이터 가공이 복잡해질수록 장점은 더 명확해진다.  
예를 들어 각 팀과 선수 정보 목록을 매핑해서 가진 roasters 객체가 있다고 하자.  
이 때 전체 선수 목록을 배열로 추출하기 위해서 for 루프를 사용하면, 전체 선수 배열에 각 팀의 선수 목록을 concat으로 추가해나가야 한다.  
이를 위해 let으로 전체 목록을 선언해야 하며, 초기화 시점에 직접 타입 구문도 작성해야 한다.

```typescript
declare const rosters: { [team: string]: BasketballPlayer[] };

let allPlayers: BasketballPlayer[] = [];
for (const players of Object.values(rosters)) {
  allPlayers = allPlayers.concat(players);
}
```

해당 로직을 함수형 메서드인 Array.prototype.flat을 사용하면 더 간결하게 작성할 수 있다.  
flat의 함수 시그니처는 `T[][] => T[]`로, 추가적인 타입 구문 없이 타입 추론이 가능하다.  
결과 변수를 const로 선언하여 변경이 되지 않도록 하는 것도 가능하다.

```typescript
// BasketballPlayer[]
const allPlayers = Object.values(rosters).flat();
```

이번엔 좀 더 복잡한 연산을 수행해보자.  
전체 선수 명단으로부터 각 팀의 가장 높은 연봉의 선수들 명단을 추출하는 로직을 작성하려고 한다.  
최종 결과는 최고 연봉 선수들을 다시 연봉 순서대로 정렬해야 한다.

이를 루프문을 사용해서 구현하면 다음과 같이 작성할 수 있다.  
각 단계에서 새롭게 변수를 선언해야 하고, 함수형 기법을 사용하지 않는 부분에서는 타입을 직접 지정해줘야 한다.

```typescript
const teamToPlayers: { [team: string]: BasketballPlayer[] } = {};
for (const player of allPlayers) {
  const { team } = player;
  teamToPlayers[team] = teamToPlayers[team] || [];
  teamToPlayers[team].push(player);
}

for (const players of Object.values(teamToPlayers)) {
  players.sort((a, b) => b.salary - a.salary);
}

const bestPaid = Object.values(teamToPlayers).map((players) => players[0]);
bestPaid.sort((playerA, playerB) => playerB.salary - playerA.salary);
```

이와 달리 로대시의 체인을 이용한 함수형 기법으로 구현하면, 더욱 직관적인 방식으로 로직을 작성할 수 있다.  
`_(allPlayers)`를 통해 체인이 적용되는 배열로 래핑하고, `value()`를 통해 다시 일반 배열로 언래핑한다.  
체인을 사용하면 연산자의 등장 순서와 실행 순서를 일치시킬 수 있다.

```typescript
// BasketballPlayer[]
const bestPaid = _(allPlayers)
  .groupBy((player) => player.team)
  .mapValues((players) => _.maxBy(players, (p) => p.salary)!)
  .values()
  .sortBy((p) => -p.salary)
  .value();
```

내장된 Array.prototype에 내장된 메서드 대신 lodash의 메서드를 사용하면 더 다양한 방식으로 편리하게 함수형 기법을 사용할 수 있다.  
대표적인 장점 중 하나가 map에서 콜백 대신 속성의 이름으로 값을 추출할 수 있다는 것이다.

```typescript
const namesA = allPlayers.map((player) => player.name); // string[]
const namesB = _.map(allPlayers, (player) => player.name); // string[]
const namesC = map(allPlayers, "name"); // string[]
```

콜백을 넘기는 방식과 속성 이름을 넘기는 방식 중 어떤 것을 사용하든, 결과 타입이 자연스럽게 도출된다.  
또한 함수 호출에 전달된 매개변수를 건드리는 대신 매번 새로운 값을 반환하여, 새로운 타입으로 안전하게 반환할 수 있다.
