#pragma once

#include <cassert>
#include <cmath>
#include <functional>
#include <iostream>
#include <random>
#include <tuple>
#include <vector>

template <typename T>
class Matrix {
  /*
  don't have to add the private access specifier
  all things are private by default in a class
  just doing it for consistancy purposes
  */
 private:
  /*
  size_t is a data type that represents sizes and counts, unsigned
  (non-negative) guaranteed to be big enough to represent the size of any object
  in memory
  */
  size_t cols_;
  size_t rows_;

  // map from 2D to 1D
  // this is where the contents of each element will live
  std::vector<T> data_;

  std::tuple<size_t, size_t> shape_;

  // number of elements
  size_t numel_ = rows_ * cols_;

 public:
  /*---------------- Constructors -------------*/

  // default
  Matrix() : cols_{0}, rows_{0}, data_{{}} {
    shape_ = {rows_, cols_};
    numel_ = 0;
  }

  // non-default with 2 parameters
  Matrix(size_t rows, size_t cols) : rows_{rows}, cols_{cols}, data_{{}} {
    data_.resize(rows_ * cols_, T());
    shape_ = {rows_, cols_};
    numel_ = rows_ * cols_;
  }

  /*---------------- Get Methods -----------------*/

  // Get method for numel_, since it is private
  size_t GetNumEl() const;

  /* Operator Overloaders */
  // best practice to use return by reference?
  const T& operator()(size_t row, size_t col) const {
    // assert works during runtime - checks for illogical situations
    assert(row < rows_ && col < cols_);
    // matrix in cpp programming is 0-indexed
    return data_[cols_ * row + col];
  }

  // Same operator overload for "()", but a non-const version
  // in case I want to use it to change an element
  T& operator()(size_t row, size_t col) {
    // assert works during runtime - checks for illogical situations
    assert(row < rows_ && col < cols_);
    // matrix in cpp programming is 0-indexed
    return data_[cols_ * row + col];
  }

  Matrix operator+(const Matrix& target) const {
    return (*this).MatrixAddition(target);
  }

  // unary-arg matrix negation => matrix = -matrix
  Matrix operator-() const;

  // binary-arg matrix subtraction operator
  Matrix operator-(const Matrix& target) const {
    return (*this).MatrixSubtraction(target);
  }

  /*------------------- Print Methods --------------------*/
  void PrintShape() const;
  void PrintMatrix() const;

  /*------------ Basic Linear Algebra Methods ------------*/
  // our first matrix multiplication method
  Matrix MatrixMultiplication(const Matrix& other) const;

  // Hadamard Product Method
  // no geometric interpretation, its what would one expect when multiplying
  // matrices at first
  Matrix ElementWiseMultiplication(const Matrix& other) const;
  Matrix SquareElements() const;
  Matrix ScalarMultiplication(T scalar) const;
  Matrix MatrixAddition(const Matrix& other) const;
  Matrix MatrixSubtraction(const Matrix& other) const;
  Matrix MatrixTranspose() const;
  // Element-wise function application method
  Matrix MatrixFunction(const std::function<T(const T&)>& function) const;
};

// A templated utility struct that provides static factory functions for
// Matrix<T>
template <typename T>
struct mtx {
  // structs are public my default
 private:
  // create a random element generator, make sure it is only created once
  // similar to singleton pattern
  static std::mt19937& GetGenerator() {
    static std::random_device rd{};
    static std::mt19937 gen{rd()};

    return gen;
  }

 public:
  // this method creates and return a matrix filled with random elements
  // using the generator
  static Matrix<T> randn(size_t rows, size_t cols) {
    Matrix<T> M(rows, cols);

    T N(M.GetNumEl());
    // T stdev{static_cast<float>(1) / sqrt(N)};
    T stdev{static_cast<T>(1) / std::sqrt(N)};
    std::normal_distribution<T> d{0, stdev};

    auto& gen = GetGenerator();

    for (size_t r = 0; r < rows; ++r) {
      for (size_t c = 0; c < cols; ++c) {
        M(r, c) = d(gen);
      }
    }

    return M;
  }
};

#include "matrix.tpp"