const barajas = Array.from({ length: 54 }, (_, i) => `imagenes/${String(i + 1).padStart(2, '0')}.jpg`);

let mostrarColores = false;
let cartas = [];
let infoRepeticiones = [];

function mezclar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generarCartas() {
  const pool = mezclar([...barajas]);
  const repetidas6y7 = pool.slice(0, 4);
  let poolRestante = pool.slice(4);

  cartas = Array.from({ length: 4 }, () => Array(16).fill(null));

  // Casillas 6 y 7
  repetidas6y7.forEach((baraja, idx) => {
    cartas[idx][5] = baraja;
    cartas[idx][6] = baraja;
  });

  // 6 repeticiones entre cartas
  poolRestante = mezclar(poolRestante);
  const repeticiones = poolRestante.slice(0, 6);
  poolRestante = poolRestante.slice(6);

  infoRepeticiones = Array.from({ length: 4 }, () => []);

  repeticiones.forEach(baraja => {
    let idx1 = Math.floor(Math.random() * 4);
    let idx2;
    do {
      idx2 = Math.floor(Math.random() * 4);
    } while (idx2 === idx1);

    [idx1, idx2].forEach(cIdx => {
      const vacias = [];
      for (let i = 0; i < 16; i++) if (i !== 5 && i !== 6 && cartas[cIdx][i] === null) vacias.push(i);
      const pos = vacias[Math.floor(Math.random() * vacias.length)];
      cartas[cIdx][pos] = baraja;
      infoRepeticiones[cIdx].push({ baraja, posicion: pos });
    });
  });

  // Rellenar restantes
  for (let c = 0; c < 4; c++) {
    const vacias = [];
    for (let i = 0; i < 16; i++) if (cartas[c][i] === null) vacias.push(i);
    vacias.forEach(pos => {
      const baraja = poolRestante.shift();
      cartas[c][pos] = baraja;
    });
  }

  renderizar();
}

function renderizar() {
  const contenedor = document.getElementById("cartas");
  contenedor.innerHTML = "";

  const textoLote = document.getElementById("textoLote").value;

  cartas.forEach((carta, idx) => {
    const tablero = document.createElement("div");
    tablero.classList.add("tablero");

    carta.forEach((baraja, pos) => {
      const img = document.createElement("img");
      img.src = baraja;

      if (mostrarColores) {
        if (pos === 5 || pos === 6) {
          img.style.border = "3px solid orange";
        } else if (infoRepeticiones[idx].some(r => r.posicion === pos)) {
          img.style.border = "3px solid red";
        } else {
          img.style.border = "2px solid #000";
        }
      } else {
        img.style.border = "2px solid #000";
      }

      tablero.appendChild(img);
    });

    // Texto de lote dentro de la carta
    if (textoLote.trim() !== "") {
      const lote = document.createElement("div");
      lote.classList.add("carta-lote");
      lote.textContent = textoLote;
      tablero.appendChild(lote);
    }

    contenedor.appendChild(tablero);
  });

  // Resumen de repeticiones al final
  const resumen = document.createElement("div");
  resumen.style.textAlign = "left";
  resumen.style.marginTop = "20px";

  infoRepeticiones.forEach((lista, idx) => {
    const p = document.createElement("p");
    if (lista.length > 0) {
      p.textContent = `Carta ${idx + 1}: ` + lista.map(r => `${r.baraja.split('/').pop()}→${r.posicion + 1}`).join(", ");
    } else {
      p.textContent = `Carta ${idx + 1}: sin repeticiones (fuera de 6 y 7)`;
    }
    resumen.appendChild(p);
  });

  contenedor.appendChild(resumen);
}

// Toggle colores
function toggleColores() {
  mostrarColores = !mostrarColores;
  renderizar();
}

// Exportar todas juntas con mejor calidad
function exportarCartas() {
  const contenedor = document.getElementById("cartas");

  html2canvas(contenedor, { scale: 3 }).then(canvas => {
    const link = document.createElement("a");
    link.download = "cartas_loteria.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

// Exportar individualmente con mejor calidad
function exportarCartasIndividuales() {
  const tableros = document.querySelectorAll(".tablero");

  tableros.forEach((tablero, index) => {
    html2canvas(tablero, { scale: 3 }).then(canvas => {
      const link = document.createElement("a");
      link.download = `carta_${index + 1}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });
}

window.onload = () => {
  document.getElementById("btnGenerar").onclick = generarCartas;
  document.getElementById("btnColores").onclick = toggleColores;
  document.getElementById("btnExportar").onclick = exportarCartas;
  document.getElementById("btnExportarIndividual").onclick = exportarCartasIndividuales;

  generarCartas();
};
