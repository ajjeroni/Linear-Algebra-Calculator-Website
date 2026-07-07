# AI Context

This project is a React + WebAssembly linear algebra calculator.

## Stack
- React with Vite
- C++ Matrix library
- Emscripten Embind
- JavaScript ES modules

## Goals
- Expose C++ Matrix<double> operations to JavaScript
- Build a clean UI for matrix operations
- Keep C++ code modular and testable

## Current WASM Exports
- Matrix
- createMatrix
- randn
- add
- subtract
- multiply
- transpose