import { describe, expect, it } from "vitest";
import {
  MIN_DIMENSION,
  MAX_DIMENSION,
  MIN_MATRICES,
  MAX_MATRICES,
  createDefaultMatrices,
  validateMatrices,
  sumMatrices,
  evaluateMatrixExpression,
} from "./matrixUtils";

describe("matrixUtils", () => {
  it("validates and sums same-dimension numeric matrices", () => {
    const matrices = [
      [
        ["1", "2"],
        ["3", "4"],
      ],
      [
        ["5", "6"],
        ["7", "8"],
      ],
    ];

    const validation = validateMatrices(2, 2, matrices);

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    expect(sumMatrices(matrices)).toEqual([
      [6, 8],
      [10, 12],
    ]);
  });

  it("rejects missing or non-numeric cells", () => {
    const matrices = [
      [
        ["1", ""],
        ["3", "x"],
      ],
    ];

    const validation = validateMatrices(2, 2, matrices);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("cell [1,2] is required"),
        expect.stringContaining("cell [2,2] must be a number"),
      ])
    );
  });

  it("uses a provided matrix module when summing matrices", () => {
    const matrices = [
      [
        ["1", "2"],
        ["3", "4"],
      ],
      [
        ["5", "6"],
        ["7", "8"],
      ],
    ];

    let createCalls = 0;
    const matrixModule = {
      createMatrix: (rows, cols) => {
        createCalls += 1;
        return {
          rows,
          cols,
          values: Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0)),
          setElement: function (rowIndex, colIndex, value) {
            this.values[rowIndex][colIndex] = value;
          },
          getElement: function (rowIndex, colIndex) {
            return this.values[rowIndex][colIndex];
          },
          add: function (other) {
            return {
              ...this,
              values: this.values.map((row, rowIndex) =>
                row.map((value, colIndex) => value + other.getElement(rowIndex, colIndex))
              ),
              getElement: function (rowIndex, colIndex) {
                return this.values[rowIndex][colIndex];
              },
            };
          },
        };
      },
    };

    expect(sumMatrices(matrices, matrixModule)).toEqual([
      [6, 8],
      [10, 12],
    ]);
    expect(createCalls).toBe(2);
  });

  it("evaluates matrix algebra expressions with scalar multiplication", () => {
    const matricesByLabel = {
      A: [
        ["1", "2"],
        ["3", "4"],
      ],
      B: [
        ["5", "6"],
        ["7", "8"],
      ],
    };

    const result = evaluateMatrixExpression("2A - 3B", matricesByLabel);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.result).toEqual([
      [-13, -14],
      [-15, -16],
    ]);
  });

  it("supports unary negation for matrices (e.g. -A + B)", () => {
    const matricesByLabel = {
      A: [
        ["1", "2"],
        ["3", "4"],
      ],
      B: [
        ["5", "6"],
        ["7", "8"],
      ],
    };

    const result = evaluateMatrixExpression("-A + B", matricesByLabel);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.result).toEqual([
      [4, 4],
      [4, 4],
    ]);
  });

  it("evaluates matrix multiplication expressions", () => {
    const matricesByLabel = {
      A: [
        ["1", "2"],
        ["3", "4"],
      ],
      B: [
        ["5", "6"],
        ["7", "8"],
      ],
    };

    const product = evaluateMatrixExpression("A * B", matricesByLabel);
    const scaledProduct = evaluateMatrixExpression("2 * A * B", matricesByLabel);
    const compactScaledProduct = evaluateMatrixExpression("2A * B", matricesByLabel);

    expect(product.valid).toBe(true);
    expect(product.result).toEqual([
      [19, 22],
      [43, 50],
    ]);

    expect(scaledProduct.valid).toBe(true);
    expect(scaledProduct.result).toEqual([
      [38, 44],
      [86, 100],
    ]);

    expect(compactScaledProduct.valid).toBe(true);
    expect(compactScaledProduct.result).toEqual([
      [38, 44],
      [86, 100],
    ]);
  });

  it("supports nested unary negation (e.g. A - -B)", () => {
    const matricesByLabel = {
      A: [
        ["1", "2"],
        ["3", "4"],
      ],
      B: [
        ["5", "6"],
        ["7", "8"],
      ],
    };

    const result = evaluateMatrixExpression("A - -B", matricesByLabel);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.result).toEqual([
      [6, 8],
      [10, 12],
    ]);
  });

  it("rejects expressions that combine mismatched dimensions", () => {
    const matricesByLabel = {
      A: [["1", "2"]],
      B: [
        ["3", "4"],
        ["5", "6"],
      ],
    };

    const result = evaluateMatrixExpression("A + B", matricesByLabel);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("same dimensions"),
      ])
    );
  });

  it("rejects matrix multiplication with incompatible dimensions", () => {
    const matricesByLabel = {
      A: [
        ["1", "2"],
        ["3", "4"],
      ],
      B: [["5", "6"]],
    };

    const result = evaluateMatrixExpression("A * B", matricesByLabel);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("must equal"),
      ])
    );
  });

  it("rejects invalid dimension values", () => {
    const matrices = createDefaultMatrices(2, 0, 2);

    const validation = validateMatrices(0, 2, matrices);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`Rows must be an integer between ${MIN_DIMENSION} and ${MAX_DIMENSION}`),
      ])
    );
  });

  it("rejects invalid matrix counts", () => {
    const matrices = createDefaultMatrices(MAX_MATRICES + 1, 2, 2);

    const validation = validateMatrices(2, 2, matrices);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`You must use between ${MIN_MATRICES} and ${MAX_MATRICES} matrices.`),
      ])
    );
  });

  it("validates only matrices referenced by the expression", () => {
    const matrices = [
      [
        ["1", "2"],
        ["3", "4"],
      ],
      [
        ["5", "6"],
        ["7", "8"],
      ],
      [
        ["", ""],
        ["", ""],
      ],
    ];

    const validation = validateMatrices(2, 2, matrices, "A + B");

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("treats lowercase labels as references during validation", () => {
    const matrices = [
      [
        ["1", "2"],
        ["3", "4"],
      ],
      [
        ["5", "6"],
        ["7", "8"],
      ],
      [
        ["", ""],
        ["", ""],
      ],
    ];

    const validation = validateMatrices(2, 2, matrices, "a + b");

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("rejects matrix shape mismatch", () => {
    const matrices = [
      [
        ["1", "2"],
        ["3", "4"],
      ],
      [["5", "6"]],
    ];

    const validation = validateMatrices(2, 2, matrices);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Matrix 2 must have 2 rows"),
      ])
    );
  });
});
