// Cargar los datos del inventario desde el almacenamiento local
var inventario = JSON.parse(localStorage.getItem("inventario")) || [];

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
    var nuevaSucursal = prompt("Ingrese el nuevo código de la sucursal:");
    editarProducto(codigo, nuevoCodigo, nuevoNombre, nuevaDescripcion, nuevaCantidad, nuevoPrecioCosto, nuevaSucursal);
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
  var productoEncontrado = buscarProductoPorCodigo(codigo);

  if (productoEncontrado) {
    if (isNaN(cantidad)) {
      mostrarMensaje("La cantidad de salida debe ser un número válido.");
      return;
    }

    cantidad = parseInt(cantidad);

    if (productoEncontrado.cantidad >= cantidad) {
      productoEncontrado.cantidad -= cantidad;
      productoEncontrado.salidas += cantidad;
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

function editarProducto(codigo, nuevoCodigo, nuevoNombre, nuevaDescripcion, nuevaCantidad, nuevoPrecioCosto, nuevaSucursal) {
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
    productoExistente.sucursal = nuevaSucursal;

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
  inventoryBody.innerHTML = "";

  var totalCosto = 0;

  for (var i = 0; i < inventario.length; i++) {
    var row = document.createElement("tr");

    var codigoCell = document.createElement("td");
    codigoCell.textContent = inventario[i].codigo;
    row.appendChild(codigoCell);

    var nombreCell = document.createElement("td");
    nombreCell.textContent = inventario[i].nombre;
    row.appendChild(nombreCell);

    var descripcionCell = document.createElement("td");
    descripcionCell.textContent = inventario[i].descripcion;
    row.appendChild(descripcionCell);

    var precioCostoCell = document.createElement("td");
    precioCostoCell.textContent = inventario[i].precioCosto;
    row.appendChild(precioCostoCell);

    var entradasCell = document.createElement("td");
    entradasCell.textContent = inventario[i].entradas;
    row.appendChild(entradasCell);

    var salidasCell = document.createElement("td");
    salidasCell.textContent = inventario[i].salidas;
    row.appendChild(salidasCell);

    var cantidadCell = document.createElement("td");
    cantidadCell.textContent = inventario[i].cantidad;
    row.appendChild(cantidadCell);

    var costoTotalCell = document.createElement("td");
    costoTotalCell.textContent = inventario[i].costoTotal;
    row.appendChild(costoTotalCell);

    // Agregar la casilla "Sucursal"
    var sucursalCell = document.createElement("td");
    sucursalCell.textContent = inventario[i].sucursal;
    row.appendChild(sucursalCell);

    inventoryBody.appendChild(row);

    var costoTotalProducto = parseFloat(inventario[i].costoTotal);
    totalCosto += costoTotalProducto;
  }

  globalCostCell.textContent = totalCosto.toFixed(2);
}


function actualizarCostoTotalProducto(producto) {
  producto.costoTotal = (producto.precioCosto * producto.cantidad).toFixed(2);
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
  inventoryBody.innerHTML = "";
  var totalCosto = 0;

  for (var i = 0; i < productos.length; i++) {
    var producto = productos[i];
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

    var costoTotalCell = document.createElement("td");
    costoTotalCell.textContent = producto.costoTotal;
    row.appendChild(costoTotalCell);

    // Agregar la casilla "Sucursal"
    var sucursalCell = document.createElement("td");
    sucursalCell.textContent = inventario[i].sucursal;
    row.appendChild(sucursalCell);

    inventoryBody.appendChild(row);

    var costoTotalProducto = parseFloat(producto.costoTotal);
    totalCosto += costoTotalProducto;
  }

  var globalcostCell = document.getElementById("global-cost");
  if (productos.length > 0) {
    globalcostCell.textContent = totalCosto.toFixed(2);
  } else {
    globalcostCell.textContent = "";
  }
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

// Crear una nueva función para agregar el producto a una sucursal
function agregarASucursal() {
  var codigoProducto = prompt("Ingrese el código del producto:");
  var nombreProducto = prompt("Ingrese el nombre del producto:");
  var codigoSucursal = prompt("Ingrese el código de la sucursal:");
  var cantidadUnidades = parseInt(prompt("Ingrese la cantidad de unidades a guardar en la sucursal:"));

  // Verificar si el código de sucursal está permitido
  if (sucursalesPermitidas.includes(codigoSucursal)) {
    // Buscar el producto en el inventario
    var productoEncontrado = inventario.find(function(producto) {
      return producto.codigo === codigoProducto && producto.nombre === nombreProducto;
    });

    if (productoEncontrado) {
      productoEncontrado.sucursal = codigoSucursal;
      // Sumar la cantidad ingresada a la cantidad existente en la sucursal
      productoEncontrado[codigoSucursal] = (productoEncontrado[codigoSucursal] || 0) + cantidadUnidades;

      console.log(`Se han agregado ${cantidadUnidades} unidades del producto "${nombreProducto}" a la sucursal "${codigoSucursal}".`);
      mostrarInventarioCompleto(); // Llamar a la función para mostrar el inventario completo
    } else {
      console.log("Error: Producto no encontrado en el inventario.");
    }
  } else {
    console.log("Error: Código de sucursal no válido. Ingrese un código válido.");
  }

  guardarInventarioEnLocal();
}

function buscarPorSucursal() {
  var codigoSucursal = prompt("Ingrese el código de la sucursal:");

  // Verificar si el código de sucursal está permitido
  if (sucursalesPermitidas.includes(codigoSucursal)) {
    // Filtrar el inventario por el código de la sucursal
    var inventarioFiltrado = inventario.filter(function(producto) {
      return producto.sucursal === codigoSucursal;
    });

    // Mostrar el inventario filtrado por sucursal
    var inventoryBody = document.getElementById("inventory-body");
    var globalCostCell = document.getElementById("global-cost");
    inventoryBody.innerHTML = "";

    var totalCosto = 0;

    for (var i = 0; i < inventarioFiltrado.length; i++) {
      var row = document.createElement("tr");

      var codigoCell = document.createElement("td");
      codigoCell.textContent = inventarioFiltrado[i].codigo;
      row.appendChild(codigoCell);

      var nombreCell = document.createElement("td");
      nombreCell.textContent = inventarioFiltrado[i].nombre;
      row.appendChild(nombreCell);

      var descripcionCell = document.createElement("td");
      descripcionCell.textContent = inventarioFiltrado[i].descripcion;
      row.appendChild(descripcionCell);

      var precioCostoCell = document.createElement("td");
      precioCostoCell.textContent = inventarioFiltrado[i].precioCosto;
      row.appendChild(precioCostoCell);

      var entradasCell = document.createElement("td");
      entradasCell.textContent = inventarioFiltrado[i].entradas;
      row.appendChild(entradasCell);

      var salidasCell = document.createElement("td");
      salidasCell.textContent = inventarioFiltrado[i].salidas;
      row.appendChild(salidasCell);

      var cantidadCell = document.createElement("td");
      var cantidadEspecifica = inventarioFiltrado[i][codigoSucursal];
      cantidadCell.textContent = cantidadEspecifica;
      row.appendChild(cantidadCell);

      var costoTotalCell = document.createElement("td");
      costoTotalCell.textContent = inventarioFiltrado[i].costoTotal;
      row.appendChild(costoTotalCell);

      var sucursalCell = document.createElement("td");
      sucursalCell.textContent = inventarioFiltrado[i].sucursal;
      row.appendChild(sucursalCell);

      inventoryBody.appendChild(row);

      var costoTotalProducto = parseFloat(inventarioFiltrado[i].costoTotal);
      totalCosto += costoTotalProducto;
    }

    globalCostCell.textContent = totalCosto.toFixed(2);
  } else {
    console.log("Error: Código de sucursal no válido. Ingrese un código válido.");
  }
}


