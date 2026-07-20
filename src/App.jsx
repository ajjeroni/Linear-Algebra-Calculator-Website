import { useEffect, useRef, useState } from "react";
import createMatrixModule from "./wasm/matrix.js";
import "./App.css";
import {
  MIN_DIMENSION,
  MAX_DIMENSION,
  MIN_MATRICES,
  MAX_MATRICES,
  buildMatricesWithDimensions,
  createDefaultMatrices,
  validateMatrices,
  evaluateMatrixExpression,
} from "./matrixUtils";

function App() {
  const [matrixModule, setMatrixModule] = useState(null);
  const [moduleError, setModuleError] = useState("");
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [matrixCount, setMatrixCount] = useState(2);
  const [matrices, setMatrices] = useState(() => createDefaultMatrices(2, 2, 2));
  const [errors, setErrors] = useState([]);
  const [result, setResult] = useState(null);
  const [expression, setExpression] = useState("A + B");
  const expressionInputRef = useRef(null);

  useEffect(() => {
    createMatrixModule()
      .then((Module) => setMatrixModule(Module))
      .catch((error) =>
        setModuleError(error?.message ?? "Unable to load matrix module.")
      );
  }, []);

  const updateStoredMatrices = (count, nextRows, nextCols) => {
    setMatrices((current) =>
      buildMatricesWithDimensions(count, nextRows, nextCols, current)
    );
  };

  const clearResult = () => {
    setResult(null);
  };

  const insertExpressionSnippet = (snippet) => {
    const input = expressionInputRef.current;
    const currentExpression = expression;

    if (!input) {
      setExpression(`${currentExpression}${snippet}`);
      clearResult();
      return;
    }

    const start = input.selectionStart ?? currentExpression.length;
    const end = input.selectionEnd ?? currentExpression.length;
    const nextExpression = `${currentExpression.slice(0, start)}${snippet}${currentExpression.slice(end)}`;

    setExpression(nextExpression);
    clearResult();

    window.requestAnimationFrame(() => {
      input.focus();
      const cursorPosition = start + snippet.length;
      input.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  const getDisplayLabel = (matrixIndex) => {
    const labels = ["Matrix A", "Matrix B", "Matrix C", "Matrix D", "Matrix E"];
    return labels[matrixIndex] ?? `Matrix ${matrixIndex + 1}`;
  };

  const getExpressionLabel = (matrixIndex) => {
    const labels = ["A", "B", "C", "D", "E"];
    return labels[matrixIndex] ?? `M${matrixIndex + 1}`;
  };

  const handleRowsChange = (event) => {
    const nextRows = Number(event.target.value);
    setRows(nextRows);
    updateStoredMatrices(matrixCount, nextRows, cols);
    clearResult();
  };

  const handleColsChange = (event) => {
    const nextCols = Number(event.target.value);
    setCols(nextCols);
    updateStoredMatrices(matrixCount, rows, nextCols);
    clearResult();
  };

  const handleMatrixCountChange = (nextCount) => {
    setMatrixCount(nextCount);
    updateStoredMatrices(nextCount, rows, cols);
    clearResult();
  };

  const handleCellChange = (matrixIndex, rowIndex, colIndex, value) => {
    setMatrices((current) =>
      current.map((matrix, matrixIdx) => {
        if (matrixIdx !== matrixIndex) {
          return matrix;
        }

        return matrix.map((row, rowIdx) => {
          if (rowIdx !== rowIndex) {
            return row;
          }

          return row.map((cell, colIdx) =>
            colIdx === colIndex ? value : cell
          );
        });
      })
    );
    clearResult();
  };

  const handleAddMatrix = () => {
    if (matrixCount >= MAX_MATRICES) {
      return;
    }

    handleMatrixCountChange(matrixCount + 1);
  };

  const handleRemoveMatrix = () => {
    if (matrixCount <= MIN_MATRICES) {
      return;
    }

    handleMatrixCountChange(matrixCount - 1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validateMatrices(rows, cols, matrices, expression);

    if (!validation.valid) {
      setErrors(validation.errors);
      setResult(null);
      return;
    }

    const matricesByLabel = Object.fromEntries(
      matrices.map((_, index) => [getExpressionLabel(index), matrices[index]])
    );

    const expressionResult = evaluateMatrixExpression(
      expression,
      matricesByLabel,
      matrixModule
    );

    if (!expressionResult.valid) {
      setErrors(expressionResult.errors);
      setResult(null);
      return;
    }

    setErrors([]);
    setResult(expressionResult.result);
  };

  return (
    <main className="matrix-app">
      <h1>Matrix Algebra Calculator</h1>
      <p className="intro">
        Enter between {MIN_MATRICES} and {MAX_MATRICES} matrices, then evaluate expressions such as A + B, 2A - 3B, A * B, or 2 * A * B. Dimensions must stay between {MIN_DIMENSION} and {MAX_DIMENSION}. Transpose is supported with A^T.
      </p>

      <div className="status-line">
        {moduleError
          ? `WASM error: ${moduleError}`
          : matrixModule
          ? "WASM module loaded"
          : "Loading WASM module..."}
      </div>

      <form className="controls" onSubmit={handleSubmit}>
        <div className="control-row">
          <label>
            Rows
            <select value={rows} onChange={handleRowsChange}>
              {Array.from({ length: MAX_DIMENSION }, (_, index) => index + 1).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Columns
            <select value={cols} onChange={handleColsChange}>
              {Array.from({ length: MAX_DIMENSION }, (_, index) => index + 1).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        <div className="control-row matrix-count-row">
          <button
            type="button"
            onClick={handleRemoveMatrix}
            disabled={matrixCount <= MIN_MATRICES}
          >
            Remove matrix
          </button>
          <span>
            {matrixCount} matrix{matrixCount === 1 ? "" : "es"}
          </span>
          <button
            type="button"
            onClick={handleAddMatrix}
            disabled={matrixCount >= MAX_MATRICES}
          >
            Add matrix
          </button>
        </div>

        <div className="matrices-grid">
          {matrices.map((matrix, matrixIndex) => (
            <section key={matrixIndex} className="matrix-card">
              <h2>{getDisplayLabel(matrixIndex)}</h2>
              <div className="matrix-table">
                {matrix.map((row, rowIndex) => (
                  <div className="matrix-row" key={rowIndex}>
                    {row.map((value, colIndex) => (
                      <input
                        key={colIndex}
                        type="number"
                        inputMode="decimal"
                        step="any"
                        value={value}
                        onChange={(event) =>
                          handleCellChange(
                            matrixIndex,
                            rowIndex,
                            colIndex,
                            event.target.value
                          )
                        }
                        className="matrix-input"
                        aria-label={`Matrix ${matrixIndex + 1} row ${rowIndex + 1} column ${colIndex + 1}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {errors.length > 0 && (
          <div className="error-box" role="alert">
            <strong>Fix the following:</strong>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <label className="expression-field">
          Algebra Expression
          <div className="expression-input-row">
            <input
              ref={expressionInputRef}
              type="text"
              value={expression}
              onChange={(event) => {
                setExpression(event.target.value);
                clearResult();
              }}
              placeholder="A + B"
              className="expression-input"
              aria-label="Matrix algebra expression"
            />
            <div className="expression-actions">
              <button type="button" className="expression-action-button" onClick={() => insertExpressionSnippet(" + ")}>
                +
              </button>
              <button type="button" className="expression-action-button" onClick={() => insertExpressionSnippet(" - ")}>
                -
              </button>
              <button type="button" className="expression-action-button" onClick={() => insertExpressionSnippet(" * ")}>
                *
              </button>
              <button type="button" className="expression-action-button transpose-button" onClick={() => insertExpressionSnippet("^T")}>
                A^T
              </button>
            </div>
          </div>
          <p className="expression-hint">
            Tip: use the operator buttons or type expressions manually. Try A^T, A^T + B, or A^T * B.
          </p>
        </label>

        <button type="submit" className="primary-button">
          Evaluate Expression
        </button>
      </form>

      <section className="matrix-result">
        <h2>Result</h2>
        {result ? (
          <div className="matrix-table result-table">
            {result.map((row, rowIndex) => (
              <div className="matrix-row" key={rowIndex}>
                {row.map((value, colIndex) => (
                  <div className="result-cell" key={colIndex}>
                    {value}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p>Fill every cell and enter an algebra expression to see the result.</p>
        )}
      </section>
    </main>
  );
}

export default App;
