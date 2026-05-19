"use strict";

(function initMatrixApp() {
  const API_BASE_URL = "http://localhost:8080";

  const elements = {
    form: document.getElementById("matrixForm"),
    rowsInput: document.getElementById("rowsInput"),
    colsInput: document.getElementById("colsInput"),
    generateBtn: document.getElementById("generateBtn"),
    submitBtn: document.getElementById("submitBtn"),
    matrixGrid: document.getElementById("matrixGrid"),
    errorBox: document.getElementById("errorBox"),
    successBox: document.getElementById("successBox"),
    resultEmpty: document.getElementById("resultEmpty"),
    resultContent: document.getElementById("resultContent"),
    qContainer: document.getElementById("qContainer"),
    rContainer: document.getElementById("rContainer"),
    statsContainer: document.getElementById("statsContainer"),
  };

  function toPositiveInt(value) {
    const numeric = Number.parseInt(String(value), 10);
    return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
  }

  function showError(message) {
    elements.errorBox.textContent = message;
    elements.errorBox.hidden = false;
  }

  function clearError() {
    elements.errorBox.hidden = true;
    elements.errorBox.textContent = "";
  }

  function showSuccess(message) {
    elements.successBox.textContent = message;
    elements.successBox.hidden = false;
  }

  function clearSuccess() {
    elements.successBox.hidden = true;
    elements.successBox.textContent = "";
  }

  function setLoading(isLoading) {
    elements.submitBtn.disabled = isLoading;
    elements.submitBtn.textContent = isLoading ? "Calculando..." : "Calcular QR";
  }

  function validateDimensions(rows, cols) {
    if (!rows || !cols) {
      return "Filas y columnas deben ser enteros positivos.";
    }

    if (rows < cols) {
      return "La API Go requiere que la cantidad de filas sea mayor o igual a la cantidad de columnas para la factorización QR.";
    }

    return null;
  }

  function buildMatrixInputs(rows, cols) {
    elements.matrixGrid.innerHTML = "";

    for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
      const row = document.createElement("div");
      row.className = "matrix-row";
      row.style.gridTemplateColumns = `repeat(${cols}, minmax(80px, 1fr))`;

      for (let colIndex = 0; colIndex < cols; colIndex += 1) {
        const input = document.createElement("input");
        input.type = "number";
        input.step = "any";
        input.value = "0";
        input.required = true;
        input.className = "matrix-input";
        input.dataset.row = String(rowIndex);
        input.dataset.col = String(colIndex);
        input.ariaLabel = `Valor fila ${rowIndex + 1}, columna ${colIndex + 1}`;
        row.appendChild(input);
      }

      elements.matrixGrid.appendChild(row);
    }
  }

  function getMatrixValues(rows, cols) {
    const matrix = [];

    for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
      const rowValues = [];
      for (let colIndex = 0; colIndex < cols; colIndex += 1) {
        const selector = `input[data-row="${rowIndex}"][data-col="${colIndex}"]`;
        const input = elements.matrixGrid.querySelector(selector);
        const value = Number.parseFloat(input?.value ?? "");

        if (!Number.isFinite(value)) {
          return { error: `Valor inválido en fila ${rowIndex + 1}, columna ${colIndex + 1}.` };
        }
        rowValues.push(value);
      }
      matrix.push(rowValues);
    }

    return { matrix };
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) {
      return String(value);
    }
    return Number(value).toFixed(4).replace(/\.?0+$/, "");
  }

  function renderMatrix(container, matrix) {
    container.innerHTML = "";

    if (!Array.isArray(matrix) || matrix.length === 0) {
      container.textContent = "Sin datos";
      return;
    }

    const table = document.createElement("table");
    table.className = "matrix-table";

    matrix.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((value) => {
        const td = document.createElement("td");
        td.textContent = formatNumber(Number(value));
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    container.appendChild(table);
  }

  function showResult(data) {
    elements.resultEmpty.hidden = true;
    elements.resultContent.hidden = false;

    renderMatrix(elements.qContainer, data?.qr?.Q);
    renderMatrix(elements.rContainer, data?.qr?.R);
    elements.statsContainer.textContent = JSON.stringify(data?.stats ?? {}, null, 2);
  }

  async function submitMatrix(event) {
    event.preventDefault();
    clearError();
    clearSuccess();

    const rows = toPositiveInt(elements.rowsInput.value);
    const cols = toPositiveInt(elements.colsInput.value);
    const dimensionsError = validateDimensions(rows, cols);

    if (dimensionsError) {
      showError(dimensionsError);
      return;
    }

    const matrixResult = getMatrixValues(rows, cols);
    if (matrixResult.error) {
      showError(matrixResult.error);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/matrix/qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matrix: matrixResult.matrix }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        showError(payload?.error || "La API devolvió un error al procesar la matriz.");
        return;
      }

      if (!payload?.qr) {
        showError("Respuesta inesperada de la API: no se recibió el objeto QR.");
        return;
      }

      showResult(payload);
      if (payload.warning) {
        showSuccess(`QR calculado con advertencia: ${payload.warning}`);
      } else {
        showSuccess("QR calculado correctamente.");
      }
    } catch (error) {
      showError(`No fue posible conectar con la API: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleGenerateClick() {
    clearError();
    clearSuccess();

    const rows = toPositiveInt(elements.rowsInput.value);
    const cols = toPositiveInt(elements.colsInput.value);
    const dimensionsError = validateDimensions(rows, cols);

    if (dimensionsError) {
      showError(dimensionsError);
      return;
    }

    buildMatrixInputs(rows, cols);
  }

  function clampDimensionInput(input) {
    const value = Number.parseInt(input.value, 10);
    if (!Number.isInteger(value) || value < 1) {
      input.value = "1";
    }
  }

  elements.rowsInput.addEventListener("input", () => clampDimensionInput(elements.rowsInput));
  elements.colsInput.addEventListener("input", () => clampDimensionInput(elements.colsInput));
  elements.generateBtn.addEventListener("click", handleGenerateClick);
  elements.form.addEventListener("submit", submitMatrix);

  buildMatrixInputs(3, 3);
})();
