
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