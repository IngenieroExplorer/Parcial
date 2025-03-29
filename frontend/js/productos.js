document.addEventListener("DOMContentLoaded", function () {
    const idUsuario = localStorage.getItem("userId");
    const login = localStorage.getItem("isLoggedIn");

    if (!idUsuario || !login) {
        window.location.href = "index.html";
        return;
    }

    const contenedorProductos = document.getElementById("contenedorProductos");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");
    const mensajeDiv = document.getElementById("mensaje");

    btnCerrarSesion.addEventListener("click", cerrarSesion);
    document.getElementById("formularioProducto").addEventListener("submit", gestionarProductoCreate);
    document.getElementById("formularioProductoUpdate").addEventListener("submit", gestionarProductoUpdate);

    cargarProductos();
    window.obtenerDatosFormulario = obtenerDatosFormulario;

    function cargarProductos() {
        fetch(`http://localhost:5000/api/inventario/${idUsuario}`)
            .then((respuesta) => respuesta.json())
            .then((productos) => {
                limpiarContenedor();

                if (!Array.isArray(productos)) {
                    console.error("Error: La API no devolvió un array", productos);
                    return;
                }

                if (productos.length === 0) {
                    mostrarMensaje("No hay productos registrados", "info");
                    return;
                }
                document.getElementById("mensaje").classList.add("d-none")
                productos.forEach(crearTarjetaProducto);
            })
            .catch((error) => {
                mostrarMensaje("Error al cargar productos", "error");
            });
    }

    function crearTarjetaProducto(producto) {
        const card = document.createElement("div");
        card.classList.add("card-producto", "p-3", "bg-black", "rounded", "text-white");

        const titulo = document.createElement("h5");
        titulo.classList.add("card-title");
        titulo.textContent = producto.titulo;

        const detalles = document.createElement("p");
        detalles.classList.add("card-text");
        detalles.textContent = producto.detalles || "Sin descripción";

        const costo = document.createElement("p");
        costo.classList.add("card-text", "fw-bold");
        costo.textContent = `Precio: $${producto.costo.toFixed(2)}`;

        const stock = document.createElement("p");
        stock.classList.add("card-text");
        stock.textContent = `Stock: ${producto.stock}`;

        const contenedorBotones = document.createElement("div");
        contenedorBotones.classList.add("card-buttons", "mt-2");

        const btnEditar = crearBoton("Editar", "btn btn-primary btn-sm m-2", () => cargarFormularioEdicion(producto));
        const btnEliminar = crearBoton("Eliminar", "btn btn-danger btn-sm m-2", () => eliminarProducto(producto.id));

        contenedorBotones.appendChild(btnEditar);
        contenedorBotones.appendChild(btnEliminar);

        card.appendChild(titulo);
        card.appendChild(detalles);
        card.appendChild(costo);
        card.appendChild(stock);
        card.appendChild(contenedorBotones);

        contenedorProductos.appendChild(card);
    }

    function crearBoton(texto, clases, callback) {
        const boton = document.createElement("button");
        boton.textContent = texto;
        boton.classList.add(...clases.split(" "));
        boton.addEventListener("click", callback);
        return boton;
    }

    function gestionarProductoCreate(event) {
        event.preventDefault();
        crearProducto();
    }

    function gestionarProductoUpdate(event) {
        event.preventDefault();
        actualizarProducto()
    }

    function crearProducto() {
        const productoData = obtenerDatosFormulario();
        if (!productoData) return;

        fetch(`http://localhost:5000/api/inventario/${idUsuario}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productoData),
        })
            .then((respuesta) => respuesta.json())
            .then((data) => {
                manejarRespuesta(data, "Producto agregado correctamente")
                document.getElementById("productoId").value = ""
                document.getElementById("nombre").value = ""
                document.getElementById("descripcion").value = ""
                document.getElementById("precio").value = ""
                document.getElementById("cantidad").value = ""
            })
            .catch(() => mostrarMensaje("Error al agregar producto", "error"));
    }

    function actualizarProducto() {
        const productoData = obtenerDatosFormularioUpdate();
        if (!productoData) return;

        fetch(`http://localhost:5000/api/inventario/${idUsuario}/${productoData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productoData),
        })
            .then((respuesta) => respuesta.json())
            .then((data) => {
                manejarRespuesta(data, "Producto actualizado correctamente")
                document.getElementById("productoIdUpdate").value = ""
                document.getElementById("nombreUpdate").value = ""
                document.getElementById("descripcionUpdate").value = ""
                document.getElementById("precioUpdate").value = ""
                document.getElementById("cantidadUpdate").value = ""
                document.getElementById("btnActualizar").disabled = true
            })
            .catch(() => mostrarMensaje("Error al actualizar producto", "error"));
    }

    function eliminarProducto(productoId) {
        if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

        fetch(`http://localhost:5000/api/inventario/${idUsuario}/${productoId}`, {
            method: "DELETE",
        })
            .then((respuesta) => respuesta.json())
            .then((data) => manejarRespuesta(data, "Producto eliminado correctamente"))
            .catch(() => mostrarMensaje("Error al eliminar producto", "error"));
    }

    function cargarFormularioEdicion(producto) {
        document.getElementById("btnActualizar").disabled = false
        document.getElementById("productoIdUpdate").value = producto.id;
        document.getElementById("nombreUpdate").value = producto.titulo;
        document.getElementById("descripcionUpdate").value = producto.detalles || "";
        document.getElementById("precioUpdate").value = producto.costo;
        document.getElementById("cantidadUpdate").value = producto.stock;
    }

    function obtenerDatosFormulario() {
        const titulo = document.getElementById("nombre").value.trim();
        const detalles = document.getElementById("descripcion").value.trim();
        const costo = parseFloat(document.getElementById("precio").value);
        const stock = parseInt(document.getElementById("cantidad").value);

        if (!titulo || isNaN(costo) || isNaN(stock)) {
            mostrarMensaje("Todos los campos son obligatorios", "error");
            return null;
        }

        return { titulo, detalles, costo, stock };
    }

    function obtenerDatosFormularioUpdate() {
        const id = document.getElementById("productoIdUpdate").value;
        const titulo = document.getElementById("nombreUpdate").value.trim();
        const detalles = document.getElementById("descripcionUpdate").value.trim();
        const costo = parseFloat(document.getElementById("precioUpdate").value);
        const stock = parseInt(document.getElementById("cantidadUpdate").value);

        if (!titulo || isNaN(costo) || isNaN(stock)) {
            mostrarMensaje("Todos los campos son obligatorios", "error");
            return null;
        }

        return { id, titulo, detalles, costo, stock };
    }

    function manejarRespuesta(data, mensajeExito) {
        if (data.error) {
            mostrarMensaje(data.mensaje, "error");
        } else {
            cargarProductos();
        }
        limpiarMensaje();
    }

    function limpiarContenedor() {
        while (contenedorProductos.firstChild) {
            contenedorProductos.removeChild(contenedorProductos.firstChild);
        }
    }

    function mostrarMensaje(texto, tipo) {
        mensajeDiv.textContent = texto;
        mensajeDiv.className = `text-center mt-5 pt-5`;
    }

    function limpiarMensaje() {
        setTimeout(() => {
            mensajeDiv.textContent = "";
            mensajeDiv.className = "";
        }, 3000);
    }

    function cerrarSesion() {
        localStorage.removeItem("idUsuario");
        localStorage.setItem("login", false);
        window.location.href = "index.html";
    }
});
