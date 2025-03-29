from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root@localhost/db_proyecto_parcial'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy()
db.init_app(app)

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre_completo = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    clave = db.Column(db.String(255), nullable=False)
    productos = db.relationship('Inventario', backref='propietario', cascade="all, delete-orphan", lazy=True)
    
    def __repr__(self):
        return f'<Usuario {self.nombre_completo}>'

class Inventario(db.Model):
    __tablename__ = 'inventario'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    detalles = db.Column(db.Text, default=None)
    costo = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    
    def __repr__(self):
        return f'<Inventario {self.titulo}>'


@app.route('/api/signup', methods=['POST'])
def registrar_usuario():
    datos = request.get_json()
    campos_requeridos = ['nombre_completo', 'email', 'clave']
    
    if not all(campo in datos and datos[campo] for campo in campos_requeridos):
        return jsonify({'mensaje': 'Todos los campos son obligatorios', 'error': True}), 400

    if Usuario.query.filter_by(email=datos['email']).first():
        return jsonify({'mensaje': 'El email ya está en uso', 'error': True}), 400

    nuevo_usuario = Usuario(
        nombre_completo=datos['nombre_completo'],
        email=datos['email'],
        clave=datos['clave']
    )
    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify({'mensaje': 'Registro exitoso', 'exito': True, 'usuario_id': nuevo_usuario.id}), 201

@app.route('/api/login', methods=['POST'])
def iniciar_sesion():
    datos = request.get_json()
    usuario = Usuario.query.filter_by(email=datos.get('email')).first()
    
    if not usuario or usuario.clave != datos.get('clave'):
        return jsonify({'mensaje': 'Credenciales incorrectas', 'error': True}), 401
    
    return jsonify({'mensaje': 'Inicio de sesión exitoso', 'exito': True, 'usuario_id': usuario.id}), 200


@app.route('/api/inventario/<int:usuario_id>', methods=['GET'])
def obtener_productos(usuario_id):
    productos = Inventario.query.filter(Inventario.usuario_id == usuario_id).all()
    lista_productos = [
        {
            'id': p.id,
            'titulo': p.titulo,
            'detalles': p.detalles if p.detalles else 'Sin descripción',
            'costo': p.costo,
            'stock': p.stock
        }
        for p in productos
    ]
    return jsonify(lista_productos), 200


@app.route('/api/inventario/<int:usuario_id>', methods=['POST'])
def agregar_producto(usuario_id):
    datos = request.get_json()
    campos_requeridos = ['titulo', 'costo', 'stock']
    
    if not all(campo in datos and datos[campo] for campo in campos_requeridos):
        return jsonify({'mensaje': 'Faltan datos del producto', 'error': True}), 400

    nuevo_producto = Inventario(
        titulo=datos['titulo'],
        detalles=datos.get('detalles'),
        costo=max(float(datos['costo']), 0),
        stock=max(int(datos['stock']), 0),
        usuario_id=usuario_id
    )
    db.session.add(nuevo_producto)
    db.session.commit()

    return jsonify({'mensaje': 'Producto agregado correctamente', 'exito': True, 'producto_id': nuevo_producto.id}), 201


@app.route('/api/inventario/<int:usuario_id>/<int:producto_id>', methods=['PUT'])
def modificar_producto(usuario_id, producto_id):
    producto = Inventario.query.filter_by(id=producto_id, usuario_id=usuario_id).first()
    
    if not producto:
        return jsonify({'mensaje': 'El producto no existe', 'error': True}), 404

    datos = request.get_json()
    producto.titulo = datos['titulo']
    producto.detalles = datos.get('detalles')
    producto.costo = max(float(datos['costo']), 0)
    producto.stock = max(int(datos['stock']), 0)

    db.session.commit()
    return jsonify({'mensaje': 'Producto actualizado con éxito', 'exito': True}), 200


@app.route('/api/inventario/<int:usuario_id>/<int:producto_id>', methods=['DELETE'])
def borrar_producto(usuario_id, producto_id):
    producto = Inventario.query.filter_by(id=producto_id, usuario_id=usuario_id).first()
    
    if not producto:
        return jsonify({'mensaje': 'Producto no encontrado', 'error': True}), 404

    db.session.delete(producto)
    db.session.commit()
    return jsonify({'mensaje': 'Producto eliminado correctamente', 'exito': True}), 200

if __name__ == '__main__':
    app.run(debug=True)