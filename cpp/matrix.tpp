#include <iostream>
#include <tuple>
#include <vector>

#include "matrix.h"

/*------------------- Get Methods -----------------------------*/
template <typename T>
size_t Matrix<T>::GetNumEl() const {
  return (*this).numel_;
}

/*------------------- Operator Overloaders --------------------*/
template <typename T>
Matrix<T> Matrix<T>::operator-() const {
  Matrix Negated((*this));
  for (size_t r = 0; r < Negated.rows_; ++r) {
    for (size_t c = 0; c < Negated.cols_; ++c) {
      Negated(r, c) = -Negated(r, c);
    }
  }
  return Negated;
}

/*------------------- Print Methods --------------------*/
template <typename T>
void Matrix<T>::PrintShape() const {
  std::cout << "Matrix Size([" << rows_ << ", " << cols_ << "])";
  std::cout << std::endl;
  std::cout << std::endl;
}

template <typename T>
void Matrix<T>::PrintMatrix() const {
  for (size_t r = 0; r < rows_; ++r) {
    for (size_t c = 0; c < cols_; ++c) {
      std::cout << (*this)(r, c) << " ";
    }
    std::cout << std::endl;
  }
  std::cout << std::endl;
}

/*------------ Basic Linear Algebra Methods ------------*/
template <typename T>
Matrix<T> Matrix<T>::MatrixMultiplication(const Matrix& other) const {
  assert((*this).cols_ == other.rows_);
  Matrix Product((*this).rows_, other.cols_);

  // 3 loop implementation
  // O(n^3) time complexity
  for (size_t r = 0; r < Product.rows_; ++r) {
    // This - rows
    for (size_t c = 0; c < Product.cols_; ++c) {
      // Other - cols
      for (size_t i = 0; i < (*this).cols_; ++i) {
        // This - cols or Other - rows
        Product(r, c) += (*this)(r, i) * other(i, c);
      }
    }
  }

  return Product;
}

template <typename T>
Matrix<T> Matrix<T>::ElementWiseMultiplication(const Matrix& other) const {
  assert((*this).shape_ == other.shape_);
  Matrix Product((*this));

  for (size_t r = 0; r < Product.rows_; ++r) {
    for (size_t c = 0; c < Product.cols_; ++c) {
      Product(r, c) = (*this)(r, c) * other(r, c);
    }
  }

  return Product;
}

template <typename T>
Matrix<T> Matrix<T>::SquareElements() const {
  Matrix Product((*this));

  return (*this).ElementWiseMultiplication(Product);
}

template <typename T>
Matrix<T> Matrix<T>::ScalarMultiplication(T scalar) const {
  Matrix Product((*this));

  for (size_t r = 0; r < Product.rows_; ++r) {
    for (size_t c = 0; c < Product.cols_; ++c) {
      Product(r, c) = scalar * (*this)(r, c);
    }
  }

  return Product;
}

template <typename T>
Matrix<T> Matrix<T>::MatrixAddition(const Matrix& other) const {
  assert((*this).shape_ == other.shape_);
  Matrix Sum((*this));

  for (size_t r = 0; r < Sum.rows_; ++r) {
    for (size_t c = 0; c < Sum.cols_; ++c) {
      Sum(r, c) += other(r, c);
    }
  }

  return Sum;
}

template <typename T>
Matrix<T> Matrix<T>::MatrixSubtraction(const Matrix& other) const {
  assert((*this).shape_ == other.shape_);
  Matrix Negative = -other;

  return (*this).MatrixAddition(Negative);
}

template <typename T>
Matrix<T> Matrix<T>::MatrixTranspose() const {
  size_t new_rows{(*this).cols_}, new_cols{(*this).rows_};
  Matrix Transpose(new_rows, new_cols);

  for (size_t r = 0; r < new_rows; ++r) {
    for (size_t c = 0; c < new_cols; ++c) {
      Transpose(r, c) = (*this)(c, r);
    }
  }

  return Transpose;
}

template <typename T>
Matrix<T> Matrix<T>::MatrixFunction(
    const std::function<T(const T&)>& function) const {
  Matrix Output((*this));

  for (size_t r = 0; r < (*this).rows_; ++r) {
    for (size_t c = 0; c < (*this).cols_; ++c) {
      Output(r, c) = function(Output(r, c));
    }
  }

  return Output;
}