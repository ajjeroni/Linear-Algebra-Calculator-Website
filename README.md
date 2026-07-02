# Linear Algebra Calculator Website

A mini linear algebra project built with C++ and WebAssembly, designed to bring matrix operations to the browser.

## Overview

This project uses a custom C++ `Matrix` template class and exposes matrix functionality to JavaScript through WebAssembly. The goal is to create a fast, browser-based linear algebra calculator while practicing C++, WebAssembly, and modern frontend development.

## Features

* Custom templated `Matrix<T>` class
* Matrix creation with rows and columns
* Get and set matrix elements
* Matrix addition and subtraction
* Matrix multiplication
* Element-wise multiplication
* Scalar multiplication
* Matrix transposition
* Element-wise function application
* WebAssembly integration for use in JavaScript/React

## Tech Stack

* C++
* WebAssembly
* Emscripten
* JavaScript
* React

## Project Structure

```txt
.
├── src/
│   ├── wasm/
│   │   ├── matrix.js
│   │   └── matrix.wasm
│   └── index.js
├── matrix.h
├── matrix.tpp
└── README.md
```

## Build

Compile the C++ matrix code to WebAssembly using Emscripten:

```bash
em++ bindings.cpp -o src/wasm/matrix.js \
  --bind \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1
```

## Run

Install dependencies:

```bash
npm install
```

Start the project:

```bash
npm run dev
```
