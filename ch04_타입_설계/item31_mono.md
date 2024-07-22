## 아이템 31 타입 주변에 null 값 배치하기

결론 : stricNullChecks 켜서 null 처리 미리 보고 다 하자. 아니면 null 이 없게 하자.

```tsx
function extent(nums: number[]) {
    let min, max;
    for (const num of nums) {
		    if(!min) {
		        min = num;
		        max = num;
		    } else {
		        min = Math.min(min, num);
		        max = Math.max(max, num);
		    }
    }
	  return [min, max]
}
```

애초에 결함이 있는 코드

- 애초에 현재 버전들에서는 안됨 ( max 가 undefinded 가 될 수 있어서 )
- 최솟값이나 최댓값이 0인 경우, 값이 덧씌워져 버립니다. ( 조건문 때메 )
- 배열이 비어있다면 [undefined, undefined] 로 나옴

```tsx
function extent(nums: number[]) {
    let result: [number, number] | null = null;
    for (const num of nums) {
		    if(!result) {
				    result = [num, num]
		    } else {
				    result = [Math.min(num, result[0]),Math.max(num, result[1])];
		    }
    }
	  return result;
}
```

이런 식으로 미리 null 을 넣어서 해결한다고 하는데..

클래스를 할때도 안에 값들이 null 이 아니고 다 채워져야한다. ( null 일 수 있는 경우는 데이터를 fetch 를 예를 들었는데 좀 아쉽다.

```tsx
class UserPosts {
	user: UserInfo | null;
	posts: Post[] | null;
	
	constructor() {
		this.user = null;
		this.posts = null;
	}
	
	async init(userId: string) {
		return Promise.all([
				async () => this.user = await fetchUser(userId);
				async () => this.posts = await fetchPosts(userId);
		]);
	}
}
```

이러면 user 가 null 이거나 posts 가 null 이거나 둘 다 null 일 경우가 있어서 문제가 많다.

```tsx
class UserPosts {
	user: UserInfo;	
	posts: Post[];
		
	constructor(user: UserInfo, posts: Post[]) {
		this.user = null;
		this.posts = null;
	}
	
	async init(userId: string) {
		const [user,posts] = await Promise.all([
				fetchUser(userId);
				fetchPosts(userId);
		]);
		return new UserPosts(user,posts);
	}
}
```

이렇게 바꿔서 다 만든 다음에 하라고 하는데, 좀 별로인 것 같다.
