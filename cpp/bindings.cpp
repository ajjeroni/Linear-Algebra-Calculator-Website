#include <cstdio>
#include <emscripten/bind.h>
#include "matrix.h"

using namespace emscripten;

using MatrixD = Matrix<double>;

MatrixD createMatrix(size_t rows, size_t cols) {
    return MatrixD(rows, cols);
}

// MatrixD randn(size_t rows, size_t cols) {
//     return mtx<double>::randn(rows, cols);
// }

EMSCRIPTEN_BINDINGS(matrix_module) {
    class_<MatrixD>("Matrix")
        .constructor<size_t, size_t>()
        .function("getRows", &MatrixD::GetRows)
        .function("getCols", &MatrixD::GetCols)
        .function("getNumEl", &MatrixD::GetNumEl)
        .function("getElement", &MatrixD::GetElement)
        .function("setElement", &MatrixD::SetElement)
        .function("add", &MatrixD::MatrixAddition)
        .function("subtract", &MatrixD::MatrixSubtraction)
        .function("multiply", &MatrixD::MatrixMultiplication)
        .function("elementWiseMultiply", &MatrixD::ElementWiseMultiplication)
        .function("squareElements", &MatrixD::SquareElements)
        .function("scalarMultiply", &MatrixD::ScalarMultiplication)
        .function("transpose", &MatrixD::MatrixTranspose);

    function("createMatrix", &createMatrix);
    // function("randn", &randn);
}