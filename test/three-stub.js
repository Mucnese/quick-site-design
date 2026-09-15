'use strict';
/* Bildet die von app.js/ui.js genutzte Teilmenge von three.js nach.
   Wirft bei falscher Argumentzahl oder falschem Typ, damit Tippfehler und
   vertauschte Indizes in den Baustein-Funktionen auffallen, statt still
   ein leeres Objekt zu bauen. */

function assert(cond, msg) {
  if (!cond) throw new TypeError('three-stub: ' + msg);
}
function num(v, msg) {
  assert(typeof v === 'number' && isFinite(v), msg || ('erwartet eine Zahl, bekam ' + JSON.stringify(v)));
  return v;
}

class Vector2 {
  constructor(x = 0, y = 0) { this.x = num(x); this.y = num(y); }
  set(x, y) { this.x = num(x); this.y = num(y); return this; }
}

class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = num(x); this.y = num(y); this.z = num(z); }
  set(x, y, z) { this.x = num(x); this.y = num(y); this.z = num(z); return this; }
  copy(v) { assert(v instanceof Vector3, 'copy() erwartet einen Vector3'); this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  clone() { return new Vector3(this.x, this.y, this.z); }
  distanceTo(v) {
    assert(v instanceof Vector3, 'distanceTo() erwartet einen Vector3');
    const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  lerp(v, a) {
    assert(v instanceof Vector3, 'lerp() erwartet einen Vector3');
    this.x += (v.x - this.x) * a;
    this.y += (v.y - this.y) * a;
    this.z += (v.z - this.z) * a;
    return this;
  }
  project() { return this; }
  applyQuaternion() { return this; }
}

class Color {
  constructor(hex) { this.hex = hex !== undefined ? hex : 0xffffff; }
  setHex(hex) { this.hex = hex; return this; }
}

class Euler {
  constructor(x = 0, y = 0, z = 0) { this.x = num(x); this.y = num(y); this.z = num(z); }
  set(x, y, z) { this.x = num(x); this.y = num(y); this.z = num(z); return this; }
}

class Object3D {
  constructor() {
    this.position = new Vector3();
    this.rotation = new Euler();
    this.scale = new Vector3(1, 1, 1);
    this.userData = {};
    this.children = [];
    this.parent = null;
    this.name = '';
    this.visible = true;
    this.renderOrder = 0;
    this.castShadow = false;
    this.receiveShadow = false;
    this.matrix = null;
  }
  add(child) {
    assert(child instanceof Object3D, 'add() erwartet ein Object3D (bekam ' + (child && child.constructor && child.constructor.name) + ')');
    this.children.push(child);
    child.parent = this;
    return this;
  }
  remove(child) {
    const i = this.children.indexOf(child);
    if (i >= 0) { this.children.splice(i, 1); child.parent = null; }
    return this;
  }
  traverse(fn) {
    fn(this);
    this.children.slice().forEach(function (c) { c.traverse(fn); });
  }
  updateMatrix() {
    this.matrix = {
      px: this.position.x, py: this.position.y, pz: this.position.z,
      sx: this.scale.x, sy: this.scale.y, sz: this.scale.z,
      rx: this.rotation.x, ry: this.rotation.y, rz: this.rotation.z
    };
  }
}

class Geometry {
  constructor(kind, expectedArgs, args) {
    assert(args.length === expectedArgs.length,
      kind + ' erwartet ' + expectedArgs.length + ' Argumente (' + expectedArgs.join(', ') + '), bekam ' + args.length);
    args.forEach(function (a, i) { num(a, kind + ': Argument ' + i + ' (' + expectedArgs[i] + ') ist keine Zahl'); });
    this.kind = kind;
    this.params = args;
    this.attributes = {};
    this.index = null;
  }
  setAttribute(name, attr) { this.attributes[name] = attr; return this; }
  getAttribute(name) { return this.attributes[name]; }
  setIndex(indices) { this.indices = indices; return this; }
  setFromPoints(points) {
    assert(Array.isArray(points), 'setFromPoints() erwartet ein Array von Vector3');
    points.forEach(function (p) { assert(p instanceof Vector3, 'setFromPoints(): Punkt ist kein Vector3'); });
    this.points = points;
    return this;
  }
  rotateX() { return this; }
  computeVertexNormals() {}
  dispose() { this.disposed = true; }
}

class BoxGeometry extends Geometry { constructor(w, h, d) { super('BoxGeometry', ['w', 'h', 'd'], [w, h, d]); } }
class CylinderGeometry extends Geometry {
  constructor(rt, rb, h, seg) { super('CylinderGeometry', ['radiusTop', 'radiusBottom', 'height', 'radialSegments'], [rt, rb, h, seg]); }
}
class SphereGeometry extends Geometry {
  constructor(r, ws, hs) { super('SphereGeometry', ['radius', 'widthSegments', 'heightSegments'], [r, ws, hs]); }
}
class PlaneGeometry extends Geometry {
  constructor(w, h, ws, hs) {
    super('PlaneGeometry', ['w', 'h', 'widthSegments', 'heightSegments'], [w, h, ws, hs]);
    // Stützpunktraster (widthSegments+1) x (heightSegments+1), wie im echten PlaneGeometry
    const nx = ws + 1, nz = hs + 1;
    this.attributes.position = new BufferAttribute(new Float32Array(nx * nz * 3), 3);
  }
}
class BufferGeometry extends Geometry {
  constructor() { super('BufferGeometry', [], []); }
}
class EdgesGeometry extends Geometry {
  constructor(source) {
    assert(source instanceof Geometry, 'EdgesGeometry erwartet eine Quellgeometrie');
    super('EdgesGeometry', [], []);
    this.source = source;
  }
}

class BufferAttribute {
  constructor(array, itemSize) {
    assert(array && typeof array.length === 'number', 'BufferAttribute erwartet ein typisiertes Array');
    num(itemSize, 'BufferAttribute: itemSize ist keine Zahl');
    this.array = array;
    this.itemSize = itemSize;
    this.needsUpdate = false;
  }
  setXYZ(i, x, y, z) {
    const o = i * this.itemSize;
    this.array[o] = x; this.array[o + 1] = y; this.array[o + 2] = z;
    return this;
  }
  setX(i, v) { this.array[i * this.itemSize] = v; return this; }
  setY(i, v) { this.array[i * this.itemSize + 1] = v; return this; }
  setZ(i, v) { this.array[i * this.itemSize + 2] = v; return this; }
  getX(i) { return this.array[i * this.itemSize]; }
  getY(i) { return this.array[i * this.itemSize + 1]; }
  getZ(i) { return this.array[i * this.itemSize + 2]; }
  get count() { return this.array.length / this.itemSize; }
}

class Material {
  constructor(kind, opts) {
    this.kind = kind;
    Object.assign(this, opts || {});
  }
  dispose() { this.disposed = true; }
}
class MeshLambertMaterial extends Material { constructor(opts) { super('MeshLambertMaterial', opts); } }
class MeshBasicMaterial extends Material { constructor(opts) { super('MeshBasicMaterial', opts); } }
class LineBasicMaterial extends Material { constructor(opts) { super('LineBasicMaterial', opts); } }

function makeMeshLike(name) {
  return class extends Object3D {
    constructor(geometry, mat) {
      super();
      assert(geometry instanceof Geometry, name + ' erwartet eine Geometrie als erstes Argument');
      this.geometry = geometry;
      this.material = mat;
    }
  };
}
const Mesh = makeMeshLike('Mesh');
const Line = makeMeshLike('Line');
const LineLoop = makeMeshLike('LineLoop');
const LineSegments = makeMeshLike('LineSegments');

class Group extends Object3D {}

class InstancedMesh extends Object3D {
  constructor(geometry, mat, count) {
    super();
    assert(geometry instanceof Geometry, 'InstancedMesh erwartet eine Geometrie');
    num(count, 'InstancedMesh: count ist keine Zahl');
    this.geometry = geometry;
    this.material = mat;
    this.count = count;
    this.instanceMatrices = new Array(count).fill(null);
    this.instanceMatrix = { needsUpdate: false, setUsage: function () {} };
  }
  setMatrixAt(i, matrix) {
    assert(i >= 0 && i < this.count, 'InstancedMesh.setMatrixAt: Index ' + i + ' außerhalb von 0..' + (this.count - 1));
    this.instanceMatrices[i] = matrix;
  }
  setColorAt(i, color) {
    assert(color instanceof Color, 'InstancedMesh.setColorAt erwartet eine Color');
    if (!this.instanceColors) this.instanceColors = new Array(this.count).fill(null);
    this.instanceColors[i] = color.hex;
  }
}

class Light extends Object3D {
  constructor(color, intensity) { super(); this.color = color; this.intensity = intensity; }
}
class HemisphereLight extends Light {
  constructor(sky, ground, intensity) { super(sky, intensity); this.groundColor = ground; }
}
class DirectionalLight extends Light {
  constructor(color, intensity) {
    super(color, intensity);
    this.target = new Object3D();
    this.shadow = {
      mapSize: new Vector2(512, 512),
      camera: { near: 0.5, far: 500, left: -5, right: 5, top: 5, bottom: -5 },
      bias: 0
    };
  }
}

class FogExp2 {
  constructor(color, density) { this.color = color; this.density = density; }
}

class Scene extends Object3D {
  constructor() { super(); this.background = null; this.fog = null; }
}

class PerspectiveCamera extends Object3D {
  constructor(fov, aspect, near, far) {
    super();
    this.fov = num(fov); this.aspect = num(aspect); this.near = num(near); this.far = num(far);
  }
  updateProjectionMatrix() {}
}

class Raycaster {
  constructor() {
    this.near = 0; this.far = Infinity;
    this._results = [];
  }
  setFromCamera(pointer, camera) {
    assert(pointer instanceof Vector2, 'setFromCamera() erwartet einen Vector2');
    assert(camera instanceof PerspectiveCamera, 'setFromCamera() erwartet eine Kamera');
  }
  intersectObject() { return this._results; }
  intersectObjects() { return this._results; }
}

function fakeDomElement() {
  return {
    style: {},
    addEventListener: function () {},
    removeEventListener: function () {}
  };
}

class WebGLRenderer {
  constructor(opts) {
    this.opts = opts || {};
    this.domElement = fakeDomElement();
    this.shadowMap = { enabled: false, type: null };
  }
  setSize() {}
  setPixelRatio() {}
  render() {}
}

class OrbitControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.target = new Vector3();
    this.enableDamping = false;
    this.dampingFactor = 0;
    this.maxDistance = Infinity;
    this.minDistance = 0;
    this.maxPolarAngle = Math.PI;
  }
  update() {}
}

module.exports = {
  Vector2, Vector3, Color,
  Object3D, Group, Mesh, Line, LineLoop, LineSegments, InstancedMesh,
  BoxGeometry, CylinderGeometry, SphereGeometry, PlaneGeometry, BufferGeometry, EdgesGeometry,
  BufferAttribute,
  MeshLambertMaterial, MeshBasicMaterial, LineBasicMaterial,
  HemisphereLight, DirectionalLight,
  FogExp2, Scene, PerspectiveCamera, Raycaster, WebGLRenderer, OrbitControls,
  DoubleSide: 'DoubleSide', FrontSide: 'FrontSide', BackSide: 'BackSide',
  DynamicDrawUsage: 'DynamicDrawUsage',
  PCFSoftShadowMap: 'PCFSoftShadowMap'
};
