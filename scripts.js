// Cargar los datos del inventario desde el almacenamiento local
var inventario = JSON.parse(localStorage.getItem("inventario")) || [];

verificarCasillasEnBlanco();
mostrarInventarioCompleto();


function ejecutarOpcion() {
  var opcion = document.getElementById("opcion").value;
  var resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (opcion === "1") {
    agregarProducto();
  } else if (opcion === "2") {
    var codigo = prompt("Ingrese el código del producto a editar:");
    var nuevoCodigo = prompt("Ingrese el nuevo código del producto:");
    var nuevoNombre = prompt("Ingrese el nuevo nombre del producto:");
    var nuevaDescripcion = prompt("Ingrese la nueva descripción del producto:");
    var nuevaCantidad = parseInt(prompt("Ingrese la nueva cantidad del producto:"));
    var nuevoPrecioCosto = parseFloat(prompt("Ingrese el nuevo precio costo del producto:"));
    editarProducto(codigo, nuevoCodigo, nuevoNombre, nuevaDescripcion, nuevaCantidad, nuevoPrecioCosto);
  } else if (opcion === "3") {
    var codigo = prompt("Ingrese el código del producto:");
    var cantidad = parseInt(prompt("Ingrese la cantidad a dar salida:"));
    darSalidaProducto(codigo, cantidad);
  } else if (opcion === "4") {
    var codigo = prompt("Ingrese el código del producto a eliminar:");
    var nombre = prompt("Ingrese el nombre del producto a eliminar:");
    eliminarProducto(codigo, nombre);
  } else if (opcion === "5") {
    agregarCantidadProducto();
  } else if (opcion === "6") {
    var nombre = prompt("Ingrese el nombre del producto a buscar:");
    buscarProductoPorNombre(nombre);
  } else if (opcion === "7") {
    mostrarInventarioCompleto();
  } else if (opcion === "8") {
    imprimirTabla();
  } else if (opcion === "9") {
    generarPDF();
  } else if (opcion === "10") {
    limpiarInventario();
  } else if (opcion === "11") {
    agregarASucursal();
  } else if (opcion === "12") {
    buscarPorSucursal();
  } else if (opcion === "13") {
    darSalidaDesdeSucursal();
  } else if (opcion === "14") {
    guardarRespaldoInventario();
  } else if (opcion === "15") {
    cargarRespaldoInventario();
  } else {
    resultsDiv.innerHTML = "Seleccione una opción válida.";
  }
}



function agregarProducto() {
  var codigo = prompt("Ingrese el código del producto:");
  if (codigo === null) {
    // El usuario ha cancelado, no se realiza ninguna acción
    return;
  }

  // Verificar si el código ya existe en el inventario
  var productoExistente = inventario.find(function(producto) {
    return producto.codigo === codigo;
  });

  if (productoExistente) {
    mostrarMensaje("El código del producto ya existe en el inventario.");
    return;
  }

  var nombre = prompt("Ingrese el nombre del producto:");
  if (nombre === null) {
    // El usuario ha cancelado, no se realiza ninguna acción
    return;
  }

  var descripcion = prompt("Ingrese la descripción del producto:");
  if (descripcion === null) {
    // El usuario ha cancelado, no se realiza ninguna acción
    return;
  }

  var precioCosto = parseFloat(prompt("Ingrese el precio de costo del producto:"));
  if (isNaN(precioCosto) || precioCosto === null) {
    // Si el precio de costo no es un número válido o el usuario ha cancelado, no se realiza ninguna acción
    return;
  }

  var cantidad = parseInt(prompt("Ingrese la cantidad del producto:"));
  if (isNaN(cantidad) || cantidad === null) {
    // Si la cantidad no es un número válido o el usuario ha cancelado, no se realiza ninguna acción
    return;
  }

  // Calcular el costo total
  var costoTotal = precioCosto * cantidad;

  // Crear un objeto con la información del producto
  var producto = {
    codigo: codigo,
    nombre: nombre,
    descripcion: descripcion,
    precioCosto: precioCosto,
    cantidad: cantidad,
    costoTotal: costoTotal,
    entradas: 0,
    salidas: 0
  };

  // Agregar el producto al inventario
  inventario.push(producto);

  // Guardar el inventario actualizado en el almacenamiento local
  guardarInventarioEnLocal();

  mostrarMensaje("Producto agregado correctamente.");
  mostrarInventarioCompleto();
}

function darSalidaProducto(codigo, cantidad) {
  var productoEncontrado = null;

  for (var i = 0; i < inventario.length; i++) {
    if (inventario[i].codigo === codigo) {
      productoEncontrado = inventario[i];
      break;
    }
  }

  if (productoEncontrado) {
    if (isNaN(cantidad)) {
      mostrarMensaje("La cantidad de salida debe ser un número válido.");
      return;
    }

    cantidad = parseInt(cantidad);

    if (productoEncontrado.cantidad >= cantidad) {
      productoEncontrado.cantidad -= cantidad;
      
      if (productoEncontrado.fuenteSalida !== "darSalidaDesdeSucursal") {
        // Solo actualizar la propiedad "salidasGenerales" si la salida no proviene de la función darSalidaDesdeSucursal
        productoEncontrado.salidasGenerales += cantidad;
      }

      productoEncontrado.salidas += cantidad; // Actualizar la cantidad de salidas en el inventario general
      productoEncontrado.costoTotal = (productoEncontrado.precioCosto * productoEncontrado.cantidad).toFixed(2);

      costoTotal = calcularCostoTotalGlobal();

      guardarInventarioEnLocal();
      mostrarMensaje("Salida registrada correctamente.");
    } else {
      mostrarMensaje("No hay suficiente cantidad del producto.");
    }
  } else {
    mostrarMensaje("El código del producto no existe.");
  }

  mostrarInventarioCompleto();
}

function editarProducto(codigo, nuevoCodigo, nuevoNombre, nuevaDescripcion, nuevaCantidad, nuevoPrecioCosto) {
  if (!confirm("¿Desea editar el producto?")) {
    mostrarMensaje("Edición cancelada.");
    return;
  }

  if (!nuevoCodigo || !nuevoNombre || !nuevaDescripcion || isNaN(nuevaCantidad) || isNaN(nuevoPrecioCosto)) {
    mostrarMensaje("Edición cancelada. No se han proporcionado todos los datos necesarios.");
    return;
  }

  var productoExistente = buscarProductoPorCodigo(codigo);
  var productoEncontrado = buscarProductoPorCodigo(nuevoCodigo);

  if (productoExistente && (!productoEncontrado || productoExistente.codigo === nuevoCodigo)) {
    // Verificar si el nuevo código ya está asignado a otro producto en el inventario
    if (productoEncontrado && productoExistente.codigo !== nuevoCodigo) {
      mostrarMensaje("El nuevo código ya está asignado a otro producto en el inventario.");
      return;
    }

    // Guardar las entradas y salidas actuales
    var entradasActuales = productoExistente.entradas;
    var salidasActuales = productoExistente.salidas;

    // Reiniciar las entradas y salidas del producto
    productoExistente.entradas = 0;
    productoExistente.salidas = 0;

    // Actualizar el código, nombre, descripción, cantidad, precio costo y sucursal del producto
    productoExistente.codigo = nuevoCodigo;
    productoExistente.nombre = nuevoNombre;
    productoExistente.descripcion = nuevaDescripcion;
    productoExistente.cantidad = nuevaCantidad;
    productoExistente.precioCosto = nuevoPrecioCosto;

    // Recalcular el costo total del producto
    productoExistente.costoTotal = nuevoPrecioCosto * nuevaCantidad;

    guardarInventarioEnLocal();
    mostrarMensaje("Producto editado correctamente.");
    mostrarInventarioCompleto();
  } else {
    mostrarMensaje("No se encontró el producto o el nuevo código ya está asignado a otro producto en el inventario.");
  }
}


function mostrarInventarioCompleto() {
  var inventoryBody = document.getElementById("inventory-body");
  var globalCostCell = document.getElementById("global-cost");
  var totalUnitsCell = document.getElementById("total-units");

  inventoryBody.innerHTML = "";

  var totalCosto = 0;
  var totalUnits = 0;

  for (var i = 0; i < inventario.length; i++) {
    var producto = inventario[i];
    var sucursalesRegistradas = [];

    // Verificar si el producto tiene un array de sucursales
    if (!producto.hasOwnProperty("sucursales")) {
      producto.sucursales = [];
    }

    // Obtener las sucursales registradas en el producto
    for (var j = 0; j < producto.sucursales.length; j++) {
      sucursalesRegistradas.push(producto.sucursales[j].sucursal);
    }

    var row = document.createElement("tr");

    var codigoCell = document.createElement("td");
    codigoCell.textContent = producto.codigo;
    row.appendChild(codigoCell);

    var nombreCell = document.createElement("td");
    nombreCell.textContent = producto.nombre;
    row.appendChild(nombreCell);

    var descripcionCell = document.createElement("td");
    descripcionCell.textContent = producto.descripcion;
    row.appendChild(descripcionCell);

    var precioCostoCell = document.createElement("td");
    precioCostoCell.textContent = producto.precioCosto;
    row.appendChild(precioCostoCell);

    var entradasCell = document.createElement("td");
    entradasCell.textContent = producto.entradas;
    row.appendChild(entradasCell);

    var salidasCell = document.createElement("td");
    salidasCell.textContent = producto.salidas;
    row.appendChild(salidasCell);

    var cantidadCell = document.createElement("td");
    cantidadCell.textContent = producto.cantidad;
    row.appendChild(cantidadCell);

    // Calcular el costo total
    var costoTotal = parseFloat(producto.precioCosto) * parseFloat(producto.cantidad);
    var costoTotalCell = document.createElement("td");
    costoTotalCell.textContent = isNaN(costoTotal) ? "" : costoTotal.toFixed(2);
    row.appendChild(costoTotalCell);

    // Agregar la casilla "Sucursal"
    var sucursalCell = document.createElement("td");
    sucursalCell.textContent = sucursalesRegistradas.join(", ");
    row.appendChild(sucursalCell);

    inventoryBody.appendChild(row);

    // Sumar el costo total al costo total global
    if (!isNaN(costoTotal)) {
      totalCosto += costoTotal;
    }

    if (!isNaN(producto.cantidad)) {
      totalUnits += parseFloat(producto.cantidad);
    }
  }

  globalCostCell.textContent = totalCosto.toFixed(2);
  totalUnitsCell.textContent = totalUnits;
}

function calcularCostoTotalProducto(producto) {
  if (producto.cantidad === 0) {
    producto.costoTotal = "0.00";
  } else {
    producto.costoTotal = (producto.cantidad * producto.precioCosto).toFixed(2);
  }
}


function agregarCantidadProducto() {
  var codigo = prompt("Ingrese el código del producto:");
  if (codigo === null) {
    // El usuario ha cancelado, no se realiza ninguna acción
    return;
  }

  // Buscar el producto en el inventario
  var productoEncontrado = null;
  for (var i = 0; i < inventario.length; i++) {
    if (inventario[i].codigo === codigo) {
      productoEncontrado = inventario[i];
      break;
    }
  }

  if (productoEncontrado === null) {
    mostrarMensaje("El producto no se encuentra en el inventario.");
    return;
  }

  var cantidad = parseInt(prompt("Ingrese la cantidad a agregar:"));
  if (isNaN(cantidad) || cantidad === null) {
    // Si la cantidad no es un número válido o el usuario ha cancelado, no se realiza ninguna acción
    return;
  }

  // Actualizar la cantidad y entrada del producto
  productoEncontrado.cantidad += cantidad;
  productoEncontrado.entradas += cantidad;
  productoEncontrado.costoTotal += productoEncontrado.precioCosto * cantidad; // Multiplicar el precio costo por la cantidad agregada

  // Guardar el inventario actualizado en el almacenamiento local
  guardarInventarioEnLocal();

  mostrarMensaje("Existencias agregadas correctamente.");
  mostrarInventarioCompleto();
}


function buscarProductoPorNombre(nombre) {
  var productosEncontrados = [];

  for (var i = 0; i < inventario.length; i++) {
    if (inventario[i].nombre.toLowerCase() === nombre.toLowerCase()) {
      productosEncontrados.push(inventario[i]);
    }
  }

  if (productosEncontrados.length > 0) {
    mostrarProductosEncontrados(productosEncontrados);
  } else {
    mostrarMensaje("No se encontraron productos con el nombre especificado.");
  }
}


function buscarProductoPorCodigo(codigo) {
  var productoEncontrado = null;
  for (var i = 0; i < inventario.length; i++) {
    if (inventario[i].codigo === codigo) {
      productoEncontrado = inventario[i];
      break;
    }
  }
  if (productoEncontrado) {
    mostrarMensaje("Producto encontrado:<br>" + productoEncontrado.nombre + ": " + productoEncontrado.cantidad);
  } else {
    mostrarMensaje("Producto no encontrado.");
  }
  return productoEncontrado;
  mostrarInventarioCompleto();
}


function mostrarProductosEncontrados(productos) {
  var inventoryBody = document.getElementById("inventory-body");
  var globalCostCell = document.getElementById("global-cost");
  var totalUnitsCell = document.getElementById("total-units");

  inventoryBody.innerHTML = "";
  var totalCosto = 0;
  var totalUnits = 0;

  for (var i = 0; i < productos.length; i++) {
    var row = document.createElement("tr");

    var codigoCell = document.createElement("td");
    codigoCell.textContent = productos[i].codigo;
    row.appendChild(codigoCell);

    var nombreCell = document.createElement("td");
    nombreCell.textContent = productos[i].nombre;
    row.appendChild(nombreCell);

    var descripcionCell = document.createElement("td");
    descripcionCell.textContent = productos[i].descripcion;
    row.appendChild(descripcionCell);

    var precioCostoCell = document.createElement("td");
    precioCostoCell.textContent = productos[i].precioCosto;
    row.appendChild(precioCostoCell);

    var entradasCell = document.createElement("td");
    entradasCell.textContent = productos[i].entradas;
    row.appendChild(entradasCell);

    var salidasCell = document.createElement("td");
    salidasCell.textContent = productos[i].salidas;
    row.appendChild(salidasCell);

    var cantidadCell = document.createElement("td");
    cantidadCell.textContent = productos[i].cantidad;
    row.appendChild(cantidadCell);

    var costoTotal = parseFloat(productos[i].precioCosto) * parseFloat(productos[i].cantidad);
    var costoTotalCell = document.createElement("td");
    costoTotalCell.textContent = (isNaN(costoTotal) ? "" : costoTotal.toFixed(2));
    row.appendChild(costoTotalCell);

    var sucursalCell = document.createElement("td");
    sucursalCell.textContent = productos[i].sucursal;
    row.appendChild(sucursalCell);

    inventoryBody.appendChild(row);

    if (!isNaN(costoTotal)) {
      totalCosto += costoTotal;
    }

    if (!isNaN(productos[i].cantidad)) {
      totalUnits += parseFloat(productos[i].cantidad);
    }
  }

  globalCostCell.textContent = totalCosto.toFixed(2);
  totalUnitsCell.textContent = totalUnits;
}



function mostrarMensaje(mensaje) {
  var resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = mensaje;
}

function guardarInventarioEnLocal() {
  localStorage.setItem("inventario", JSON.stringify(inventario));
}

function limpiarInventario() {
  var password = prompt("Ingrese la contraseña para limpiar el inventario:");

  if (password === "KratosProSM") {
    inventario = [];
    guardarInventarioEnLocal();
    mostrarMensaje("Inventario limpiado correctamente.");
  } else {
    mostrarMensaje("Contraseña incorrecta. No se pudo limpiar el inventario.");
  }
  mostrarInventarioCompleto();
}

function imprimirTabla() {
  var menuDiv = document.getElementById("menu");
  var resultsDiv = document.getElementById("results");
  var inventoryTable = document.getElementById("inventory-table");

  // Ocultar el menú y los resultados
  menuDiv.style.display = "none";
  resultsDiv.style.display = "none";

  // Agregar el estilo top: 100px al elemento inventory-table
  inventoryTable.style.top = "100px";

  // Imprimir la página actual
  window.print();

  // Restaurar la visibilidad del menú y los resultados
  menuDiv.style.display = "block";
  resultsDiv.style.display = "block";

  // Eliminar el estilo top: 100px del elemento inventory-table
  inventoryTable.style.top = "";
}


function generarPDF() {
  var table = document.getElementById("inventory-table");

  html2canvas(table).then(function(canvas) {
    var imgData = canvas.toDataURL("image/png");
    var pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10);
    pdf.save("inventory.pdf");
  });
}

function eliminarProducto(codigo, nombre) {
  var productoEncontrado = buscarProductoPorCodigo(codigo);
  if (productoEncontrado && productoEncontrado.nombre === nombre) {
    // Eliminar el producto de la tabla
    var indiceProducto = inventario.indexOf(productoEncontrado);
    inventario.splice(indiceProducto, 1);

    guardarInventarioEnLocal();
    mostrarMensaje("Producto eliminado correctamente.");
    mostrarInventarioCompleto();
  } else {
    mostrarMensaje("No se encontró un producto con el código y nombre especificados.");
  }
}


var sucursalesPermitidas = ["TLMB11", "TLMB13", "KATINKA", "FIXMI"];

function agregarASucursal() {
  var codigoProducto = prompt("Ingrese el código del producto:");
  var nombreProducto = prompt("Ingrese el nombre del producto:");
  var cantidadSucursales = parseInt(prompt("Ingrese la cantidad de sucursales (máximo 4) en las que desea agregar el producto:"));

  // Verificar si el código de producto y nombre están presentes
  if (!codigoProducto || !nombreProducto) {
    mostrarMensaje("Error: Debe ingresar el código y el nombre del producto.");
    return;
  }

  // Buscar el producto en el inventario
  var productoEncontrado = inventario.find(function(producto) {
    return producto.codigo === codigoProducto && producto.nombre === nombreProducto;
  });

  if (productoEncontrado) {
    if (cantidadSucursales > 0 && cantidadSucursales <= 4) {
      productoEncontrado.sucursales = productoEncontrado.sucursales || [];

      var mensaje = `${nombreProducto} (${codigoProducto}) fue añadido a estas sucursales:`;

      for (var i = 0; i < cantidadSucursales; i++) {
        var codigoSucursal = prompt("Ingrese el código de la sucursal " + (i + 1) + ":");
        if (sucursalesPermitidas.includes(codigoSucursal)) {
          var cantidadUnidades = parseInt(prompt("Ingrese la cantidad de unidades a guardar en la sucursal " + (i + 1) + ":"));
          if (isNaN(cantidadUnidades)) {
            mostrarMensaje("Error: La cantidad debe ser un número válido.");
            return;
          }

          // Verificar si la sucursal ya existe en el producto
          var sucursalExistente = productoEncontrado.sucursales.find(function(sucursal) {
            return sucursal.sucursal === codigoSucursal;
          });

          // Si la sucursal ya existe, actualizamos la cantidad
          if (sucursalExistente) {
            if (cantidadUnidades > productoEncontrado.cantidad) {
              mostrarMensaje("Error: No se puede agregar más unidades de las disponibles en el inventario general.");
              return;
            }
            sucursalExistente.cantidad += cantidadUnidades;
            sucursalExistente.entradas += cantidadUnidades;
          } else {
            // Si la sucursal no existe, la agregamos al producto con las cantidades
            if (cantidadUnidades > productoEncontrado.cantidad) {
              mostrarMensaje("Error: No se puede agregar más unidades de las disponibles en el inventario general.");
              return;
            }
            productoEncontrado.sucursales.push({
              sucursal: codigoSucursal,
              cantidad: cantidadUnidades,
              entradas: cantidadUnidades
            });
          }

          mensaje += ` ${codigoSucursal}(${cantidadUnidades})`; // Agregar al mensaje las cantidades ingresadas a cada sucursal
        } else {
          mostrarMensaje("Error: Código de sucursal no válido. Ingrese un código válido.");
          return;
        }
      }

      guardarInventarioEnLocal();
      mostrarMensaje(`${mensaje} correctamente.`);
      mostrarInventarioCompleto();
    } else {
      mostrarMensaje("Error: Cantidad de sucursales inválida. Debe ser un número entre 1 y 4.");
    }
  } else {
    mostrarMensaje("Error: Producto no encontrado en el inventario.");
  }
}


function buscarPorSucursal() {
  var codigoSucursal = prompt("Ingrese el código de la sucursal:");

  // Verificar si el código de sucursal está permitido
  if (sucursalesPermitidas.includes(codigoSucursal)) {
    // Filtrar el inventario por el código de la sucursal
    var inventarioFiltrado = inventario.filter(function(producto) {
      return producto.sucursales && producto.sucursales.some(function(sucursal) {
        return sucursal.sucursal === codigoSucursal;
      });
    });

    // Llamar a mostrarInventarioSucursal con el inventario filtrado y el código de la sucursal
    mostrarInventarioSucursal(inventarioFiltrado, codigoSucursal);
  } else {
    mostrarMensaje("Error: Código de sucursal no válido. Ingrese un código válido.");
  }
}

// Función para filtrar el inventario por sucursal
function filtrarPorSucursal(inventario, codigoSucursal) {
  return inventario.filter(function(producto) {
    return producto.hasOwnProperty(codigoSucursal);
  });
}

// Función para mostrar el inventario filtrado por sucursal
function mostrarInventarioSucursal(inventarioFiltrado, codigoSucursal) {
  var inventoryBody = document.getElementById("inventory-body");
  var globalCostCell = document.getElementById("global-cost");
  var totalUnitsCell = document.getElementById("total-units");
  inventoryBody.innerHTML = "";

  var totalCosto = 0;
  var totalUnits = 0;

  for (var i = 0; i < inventarioFiltrado.length; i++) {
    var producto = inventarioFiltrado[i];
    var cantidadEspecifica = producto.sucursales.find(function(sucursal) {
      return sucursal.sucursal === codigoSucursal;
    });

    var cantidadEnSucursal = cantidadEspecifica ? cantidadEspecifica.cantidad : 0;
    var salidasEnSucursal = cantidadEspecifica ? cantidadEspecifica.salidas : 0; // Salidas registradas en darSalidaDesdeSucursal
    var entradasEnSucursal = cantidadEspecifica ? cantidadEspecifica.entradas : 0; // Entradas registradas en agregarASucursal

    var row = document.createElement("tr");

    var codigoCell = document.createElement("td");
    codigoCell.textContent = producto.codigo;
    row.appendChild(codigoCell);

    var nombreCell = document.createElement("td");
    nombreCell.textContent = producto.nombre;
    row.appendChild(nombreCell);

    var descripcionCell = document.createElement("td");
    descripcionCell.textContent = producto.descripcion;
    row.appendChild(descripcionCell);

    var precioCostoCell = document.createElement("td");
    precioCostoCell.textContent = producto.precioCosto;
    row.appendChild(precioCostoCell);

    var entradasCell = document.createElement("td");
    entradasCell.textContent = entradasEnSucursal; // Mostrar las entradas registradas en agregarASucursal
    row.appendChild(entradasCell);

    var salidasCell = document.createElement("td");
    salidasCell.textContent = salidasEnSucursal; // Mostrar las salidas registradas en darSalidaDesdeSucursal
    salidasCell.setAttribute("readonly", true); // Deshabilitar edición de la casilla de salidas en el inventario de sucursal
    row.appendChild(salidasCell);

    var cantidadCell = document.createElement("td");
    cantidadCell.textContent = cantidadEnSucursal.toString();
    row.appendChild(cantidadCell);

    var costoTotalCell = document.createElement("td");
    var precioCostoEspecifico = parseFloat(producto.precioCosto);
    var costoTotalEspecifico = isNaN(precioCostoEspecifico) || cantidadEnSucursal === 0 ? "" : (precioCostoEspecifico * cantidadEnSucursal).toFixed(2);
    costoTotalCell.textContent = costoTotalEspecifico;
    row.appendChild(costoTotalCell);

    var sucursalCell = document.createElement("td");
    sucursalCell.textContent = codigoSucursal;
    row.appendChild(sucursalCell);

    inventoryBody.appendChild(row);

    var costoTotalProducto = parseFloat(costoTotalEspecifico);
    if (!isNaN(costoTotalProducto)) {
      totalCosto += costoTotalProducto;
    }

    if (!isNaN(cantidadEnSucursal)) {
      totalUnits += parseFloat(cantidadEnSucursal);
    }
  }

  globalCostCell.textContent = totalCosto.toFixed(2);
  totalUnitsCell.textContent = totalUnits;
}


function darSalidaDesdeSucursal() {
  var codigoSucursal = prompt("Ingrese el código de la sucursal desde donde dará salida al producto:");
  var codigoProducto = prompt("Ingrese el código del producto:");
  var nombreProducto = prompt("Ingrese el nombre del producto:");
  var cantidad = parseInt(prompt("Ingrese la cantidad a dar salida:"));

  // Verificar si el código de sucursal está permitido
  if (sucursalesPermitidas.includes(codigoSucursal)) {
    // Buscar el producto en el inventario de la sucursal
    var productoEnSucursal = inventario.find(function(producto) {
      return producto.sucursales && producto.sucursales.some(function(sucursal) {
        return sucursal.sucursal === codigoSucursal && producto.codigo === codigoProducto && producto.nombre === nombreProducto;
      });
    });

    // Buscar la sucursal específica en el producto
    var sucursalProducto = productoEnSucursal.sucursales.find(function(sucursal) {
      return sucursal.sucursal === codigoSucursal;
    });

    // Buscar el producto en el inventario general
    var productoEnInventario = inventario.find(function(producto) {
      return producto.codigo === codigoProducto && producto.nombre === nombreProducto;
    });

    if (productoEnSucursal && sucursalProducto && productoEnInventario) {
      if (isNaN(cantidad)) {
        mostrarMensaje("La cantidad de salida debe ser un número válido.");
        return;
      }

      cantidad = parseInt(cantidad);

      if (sucursalProducto.cantidad >= cantidad && productoEnInventario.cantidad >= cantidad) {
        sucursalProducto.cantidad -= cantidad;
        sucursalProducto.salidas += cantidad; // Registrar la salida en el inventario de sucursal
        productoEnInventario.cantidad -= cantidad;
        productoEnInventario.salidas += cantidad; // Registrar la salida en el inventario general
        guardarInventarioEnLocal();
        mostrarMensaje("Salida registrada correctamente.");
      } else {
        mostrarMensaje("No hay suficiente cantidad del producto en la sucursal o en el inventario general.");
      }
    } else {
      mostrarMensaje("El producto no existe en la sucursal o en el inventario general.");
    }
  } else {
    mostrarMensaje("El código de sucursal no es válido.");
  }
  mostrarInventarioCompleto();
}


function calcularCostoTotalGlobal() {
  var totalCosto = 0;

  for (var i = 0; i < inventario.length; i++) {
    if (inventario[i].precioCosto) { // Verificar si el producto tiene un precio costo asignado
      totalCosto += parseFloat(inventario[i].costoTotal);
    }
  }

  return totalCosto.toFixed(2);
}


function despejarInventario() {
  var inventarioFiltrado = inventario.filter(function(producto) {
    return producto.codigo !== "";
  });

  inventario = inventarioFiltrado;
  guardarInventarioEnLocal();
  mostrarMensaje("Se han eliminado los productos sin código.");
  mostrarInventarioCompleto();
}

function verificarCasillasEnBlanco() {
  var productosEliminados = 0;

  for (var i = 0; i < inventario.length; i++) {
    var producto = inventario[i];

    if (producto.codigo === "" || producto.nombre === "") {
      inventario.splice(i, 1);
      productosEliminados++;
      i--; // Ajustar el índice después de eliminar un elemento
    }
  }

  if (productosEliminados > 0) {
    guardarInventarioEnLocal();
    mostrarMensaje(`Se han eliminado ${productosEliminados} productos sin código o nombre.`);
  }
}

// Función para guardar el inventario en el almacenamiento local
function guardarRespaldoInventario() {
  // Convierte el inventario en una cadena JSON
  var inventarioJSON = JSON.stringify(inventario);
  
  // Guarda el inventario en el almacenamiento local
  localStorage.setItem('respaldoInventario', inventarioJSON);
  
  mostrarMensaje('Respaldo del inventario guardado en el almacenamiento local.');
}

//Función para cargar un respaldo anterior del inventario desde el almacenamiento local
function cargarRespaldoInventario() {
  // Recupera el inventario del almacenamiento local
  var inventarioJSON = localStorage.getItem('respaldoInventario');
  
  if (inventarioJSON) {
    // Convierte la cadena JSON en un objeto JavaScript
    inventario = JSON.parse(inventarioJSON);
    
    mostrarMensaje('Respaldo del inventario cargado desde el almacenamiento local.');
    mostrarInventarioCompleto();
  } else {
    mostrarMensaje('No se encontró ningún respaldo del inventario en el almacenamiento local.');
  }
}





