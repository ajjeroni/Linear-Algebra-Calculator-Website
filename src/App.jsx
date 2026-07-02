import { useEffect, useState } from "react";
import createMatrixModule from "./wasm/matrix.js";

function App() {
  const [output, setOutput] = useState("");

  useEffect(() => {
    async function runMatrixTest() {
      const Module = await createMatrixModule();

      const A = new Module.Matrix(2, 2);
      const B = new Module.Matrix(2, 2);

      A.setElement(0, 0, 1);
      A.setElement(0, 1, 2);
      A.setElement(1, 0, 3);
      A.setElement(1, 1, 4);

      B.setElement(0, 0, 10);
      B.setElement(0, 1, 20);
      B.setElement(1, 0, 30);
      B.setElement(1, 1, 40);

      const C = A.add(B);

      setOutput(`
A + B =
[${C.getElement(0, 0)}, ${C.getElement(0, 1)}]
[${C.getElement(1, 0)}, ${C.getElement(1, 1)}]
      `);

      A.delete();
      B.delete();
      C.delete();
    }

    runMatrixTest();
  }, []);

  return (
    <main>
      <h1>Linear Algebra Calculator</h1>
      <pre>{output}</pre>
    </main>
  );
}

export default App;