
const A = () => {
    interface Cylinder { radius: number; height: number; }
    const Cylinder = (radius: number, height: number) => ({ radius, height });

    function calculateVolume(shape) {
        if(shape instanceof Cylinder) { console.log(shape.radius) }
}

const B = () => {
    class Cylinder {
        radius=1;
        height=1;
    }
    function calculateVolume(shape) {
        if (shape instanceof Cylinder) {
            console.log(shape, shape.radius);
        }
    }
}

const C = () => {
    type Person = {
        name: string;
        age: number;
      };
      
      namespace Hi {
        export const hello = 3.14

        export type Bye = { test: string }
      }

      type PersonName = Person.name;
      const P:Person.name = 'gi'
      const H = Hi['hello'];
      type B = Hi.Bye;
}

interface Room {
	numDoors: number;
	ceilingHeightFt?: number;
}
const r:Room = {
	numDoors: 1,
	ceilingHeightFt: 10,
	elephant: 'present'
} // Room에 elephant가 없음

const otps = { numDoors: 1, elephant: 'gg'};
const top = { log: 1 }
const a:Room = otps;
const b:Room = top;

async function checkedFetch(input: RequestInfo, init?:RequestInit): Promise<Response> {
	const res = await fetch(input, init);
	if(!res.ok) throw new Error('requestFailed: ' + res.status);
	return res;
}