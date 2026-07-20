# Linear Algebra Calculator Website

A browser-based matrix algebra calculator built with React, JavaScript, and a C++/WebAssembly backend. The app lets you enter matrices, choose dimensions, and evaluate algebraic expressions such as A + B, 2A - 3B, A * B, or A^T.

## Overview

This project combines a React interface with matrix validation and expression evaluation logic in JavaScript. It also includes a WebAssembly-enabled matrix layer for performance-focused operations while keeping the UI simple and interactive.

## Check It Out

[Matrix Algebra Calculator](https://linear-algebra-calculator-website.vercel.app)

## What the app can do

- Create between 1 and 5 matrices
- Set matrix dimensions between 1 and 5 rows/columns
- Fill in matrix values directly in the browser
- Evaluate expressions using:
  - addition and subtraction
  - scalar multiplication
  - unary negation
  - matrix multiplication
  - transpose with `^T` syntax
  - parentheses
- Validate required cells, invalid values, and incompatible dimensions
- Display the resulting matrix in the UI
- Insert transpose shorthand quickly with the built-in A^T button

## New features

- Added transpose support with `A^T`
- Added matrix multiplication for expressions such as `A * B`
- Added support for more algebraic expressions, including scalar-matrix combinations
- Improved validation for expression errors and dimension mismatches

## Example expressions

- A + B
- 2A - 3B
- -A + B
- (A + B) * 2
- A * B
- A^T
- A^T + B
- A^T * B

## Tech stack

- React
- Vite
- JavaScript
- C++
- WebAssembly
- Vitest
- ESLint

## Project structure

```txt
.
├── cpp/
│   ├── bindings.cpp
│   ├── matrix.h
│   └── matrix.tpp
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── matrixUtils.js
│   ├── matrixUtils.test.js
│   └── wasm/
│       └── matrix.js
├── index.html
├── package.json
└── README.md
```

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the app for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Lint the project:

```bash
npm run lint
```

## WebAssembly build

If you want to rebuild the C++/WASM module, use Emscripten:

```bash
em++ cpp/bindings.cpp -o src/wasm/matrix.js \
  --bind \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1
```
