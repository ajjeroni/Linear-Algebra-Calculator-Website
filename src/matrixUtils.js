export const MIN_DIMENSION = 1;
export const MAX_DIMENSION = 5;
export const MIN_MATRICES = 1;
export const MAX_MATRICES = 5;

export function createDefaultMatrices(count, rows, cols) {
  return Array.from({ length: count }, () =>
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""))
  );
}

export function buildMatricesWithDimensions(count, rows, cols, previous = []) {
  return Array.from({ length: count }, (_, matrixIndex) =>
    Array.from({ length: rows }, (_, rowIndex) =>
      Array.from({ length: cols }, (_, colIndex) => {
        const previousMatrix = previous[matrixIndex];
        const previousValue =
          previousMatrix &&
          Array.isArray(previousMatrix[rowIndex]) &&
          typeof previousMatrix[rowIndex][colIndex] !== "undefined"
            ? previousMatrix[rowIndex][colIndex]
            : "";
        return previousValue;
      })
    )
  );
}

export function validateMatrices(rows, cols, matrices) {
  const errors = [];

  if (!Number.isInteger(rows) || rows < MIN_DIMENSION || rows > MAX_DIMENSION) {
    errors.push(
      `Rows must be an integer between ${MIN_DIMENSION} and ${MAX_DIMENSION}.`
    );
  }

  if (!Number.isInteger(cols) || cols < MIN_DIMENSION || cols > MAX_DIMENSION) {
    errors.push(
      `Columns must be an integer between ${MIN_DIMENSION} and ${MAX_DIMENSION}.`
    );
  }

  if (!Array.isArray(matrices)) {
    errors.push("Matrices must be provided as an array.");
    return { valid: errors.length === 0, errors };
  }

  if (matrices.length < MIN_MATRICES || matrices.length > MAX_MATRICES) {
    errors.push(
      `You must use between ${MIN_MATRICES} and ${MAX_MATRICES} matrices.`
    );
  }

  matrices.forEach((matrix, matrixIndex) => {
    if (!Array.isArray(matrix)) {
      errors.push(`Matrix ${matrixIndex + 1} must be an array.`);
      return;
    }

    if (matrix.length !== rows) {
      errors.push(
        `Matrix ${matrixIndex + 1} must have ${rows} rows, but it has ${matrix.length}.`
      );
    }

    matrix.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) {
        errors.push(
          `Matrix ${matrixIndex + 1} row ${rowIndex + 1} must be an array.`
        );
        return;
      }

      if (row.length !== cols) {
        errors.push(
          `Matrix ${matrixIndex + 1} row ${rowIndex + 1} must have ${cols} columns, but it has ${row.length}.`
        );
      }

      row.forEach((value, colIndex) => {
        if (value === "" || value === null || value === undefined) {
          errors.push(
            `Matrix ${matrixIndex + 1} cell [${rowIndex + 1},${colIndex + 1}] is required.`
          );
        } else if (Number.isNaN(Number(value))) {
          errors.push(
            `Matrix ${matrixIndex + 1} cell [${rowIndex + 1},${colIndex + 1}] must be a number.`
          );
        }
      });
    });
  });

  return { valid: errors.length === 0, errors };
}

export function sumMatrices(matrices, matrixModule = null) {
  if (!matrices.length) {
    return [];
  }

  const rows = matrices[0].length;
  const cols = matrices[0][0]?.length ?? 0;

  if (matrixModule && typeof matrixModule.createMatrix === "function") {
    const toWasmMatrix = (matrixValues) => {
      const wasmMatrix = matrixModule.createMatrix(rows, cols);

      matrixValues.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          if (typeof wasmMatrix.setElement === "function") {
            wasmMatrix.setElement(rowIndex, colIndex, Number(value));
          }
        });
      });

      return wasmMatrix;
    };

    const toPlainMatrix = (wasmMatrix) =>
      Array.from({ length: rows }, (_, rowIndex) =>
        Array.from({ length: cols }, (_, colIndex) =>
          Number(wasmMatrix.getElement(rowIndex, colIndex))
        )
      );

    let resultMatrix = null;

    try {
      for (let index = 0; index < matrices.length; index++) {
        const matrix = matrices[index];
        const wasmMatrix = toWasmMatrix(matrix);

        if (index === 0) {
          resultMatrix = wasmMatrix;
          continue;
        }

        if (resultMatrix && typeof resultMatrix.add === "function") {
          const oldResult = resultMatrix;
          const newResult = oldResult.add(wasmMatrix);

          if (wasmMatrix && typeof wasmMatrix.delete === "function") {
            try {
              wasmMatrix.delete();
            } catch {
              /* ignore deletion errors */
            }
          }

          if (oldResult && typeof oldResult.delete === "function") {
            try {
              oldResult.delete();
            } catch {
              /* ignore deletion errors */
            }
          }

          resultMatrix = newResult;
        } else {
          // If we can't perform a wasm add, free the temporary wasmMatrix
          if (wasmMatrix && typeof wasmMatrix.delete === "function") {
            try {
              wasmMatrix.delete();
            } catch {
              /* ignore deletion errors */
            }
          }
        }
      }

      if (resultMatrix) {
        const plain = toPlainMatrix(resultMatrix);

        if (resultMatrix && typeof resultMatrix.delete === "function") {
          try {
            resultMatrix.delete();
          } catch {
            /* ignore deletion errors */
          }
        }

        return plain;
      }
    } catch (err) {
      if (resultMatrix && typeof resultMatrix.delete === "function") {
        try {
          resultMatrix.delete();
        } catch {
          /* ignore deletion errors */
        }
      }
      throw err;
    }
  }

  const result = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  );

  matrices.forEach((matrix) => {
    matrix.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        result[rowIndex][colIndex] += Number(value);
      });
    });
  });

  return result;
}
