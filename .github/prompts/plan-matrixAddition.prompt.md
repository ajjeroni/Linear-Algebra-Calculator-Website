## Plan: Matrix Addition UI and Validation

Build a first-page React UI for matrix addition with strong input validation, same-dimension enforcement, and automated repo tests.

**Steps**
1. Add a reusable helper module for matrix form validation and JS matrix addition.
   - Create `src/matrixUtils.js`.
   - Export constants: `MIN_DIMENSION = 1`, `MAX_DIMENSION = 5`, `MIN_MATRICES = 1`, `MAX_MATRICES = 5`.
   - Export a validation function that checks row/col range, matrix count, and numeric values.
   - Export a pure function that sums arrays of matrix values.

2. Replace the current `src/App.jsx` with the addition-first page.
   - Import the wasm loader and validation/addition helpers.
   - Load `createMatrixModule()` once in `useEffect` and keep it in state.
   - Add dynamic row/column selectors, matrix count controls, and matrix grids.
   - Render 2 matrices first, and allow the user to choose up to 5 matrices, and allow users to add or remove matrices.
   - Validate that all matrices use the same dimensions and that all cells are numeric.
   - On submit, compute the sum and show the result matrix.
   - Display validation messages for missing values, non-numeric entries, out-of-range dimensions, and invalid matrix count.

3. Add page styling.
   - Update `src/App.css` with grid layout and input styles for the new matrix page.
   - Import `./App.css` from `App.jsx`.
   - Style errors, buttons, matrix grids, and the result display.

4. Add automated tests for edge cases and input validation.
   - Add `vitest` and React testing support in `package.json` if not present.
   - Add `test` script to `package.json`.
   - Create `src/matrixUtils.test.js` covering:
     - valid addition of same-dimension matrices
     - missing or non-numeric input rejection
     - invalid dimensions outside 1-5
     - invalid matrix count outside allowed range
     - same-dimension enforcement across matrices
   - Optionally add a UI-level test file if the page implementation is component-friendly.

**Verification**
1. Run `npm install` to ensure any new dev dependencies are available.
2. Run `npm test` or `npx vitest run` and confirm the helper tests pass.
3. Run `npm run dev` and verify the UI:
   - row/col selectors limited to 1-5
   - matrix add/remove controls capped at 5 matrices
   - invalid inputs show errors
   - valid inputs produce correct summed matrix

**Decisions**
- Use a small limit of 1-5 for both matrix dimensions and number of matrices.
- Support dynamic matrix count, with default page state showing at least two matrices.
- Keep actual computation tied to wasm if available, while validation and testable logic remain in JS helpers.
- Do not introduce routing or multiple pages; this is a single, addition-focused app page.
