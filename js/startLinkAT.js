let isMouseDown = false; // 判斷滑鼠點擊
const emptySlot = "emptySlot", planeTop = "planeTop", planeBottom = "planeBottom"; // 空位、平面頂部、平面底部
let camera, scene, renderer; // 相機、場景、渲染器之容器
const mouse = { x: 0, y: 0 }; // 滑鼠位置
const camPos = { x: 0, y: 0, z: 10 }; // 相機位置
const sw = window.innerWidth, sh = window.innerHeight;  // 判斷用戶螢幕長寬
const cols = 20; // 列數
const rows = 16; // 行數
const gap = 20; // 間距
const size = { width: 100, height: 30, depth: 150, } // 方塊長寬高
const planeOffset = 250; // 平面偏移
const allRowsDepth = rows * (size.depth + gap); // 所有行高
const allColsWidth = cols * (size.depth + gap); // 所有列寬
const speedNormal = 4; // 正常速度
const speedFast = 34;  // 加速度
let speed = speedNormal; // 當前速度
// 方塊
let boxes = {
  planeBottom: [], planeTop: []
};
// 
let boxes1d = [];
// 頂點著色器
const vertexShader = ["varying vec2 vUv;", "void main()", "{", " vUv = uv;", " vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", " gl_Position = projectionMatrix * mvPosition;", "}"].join("");
// 片段著色器
const fragmentShader = ["uniform float r;", "uniform float g;", "uniform float b;", "uniform float distanceZ;", "uniform float distanceX;", "uniform float pulse;", "uniform float speed;", "varying vec2 vUv;", "void main( void ) {", " vec2 position = abs(-1.0 + 2.0 * vUv);", " float edging = abs((pow(position.y, 5.0) + pow(position.x, 5.0)) / 2.0);", " float perc = (0.2 * pow(speed + 1.0, 2.0) + edging * 0.8) * distanceZ * distanceX;", " float red = r * perc + pulse;", " float green = g * perc + pulse;", " float blue = b * perc + pulse;", " gl_FragColor = vec4(red, green, blue, 1.0);", "}"].join("");
init(); // 執行初始化

/*===============函式區===============*/
// 初始化
function init() {
  // 建立場景
  scene = new THREE.Scene();
  // 建立視野相機
  camera = new THREE.PerspectiveCamera(
    100,  // 相機的垂直視野
    sw / sh, // 相機的外觀比例
    1, // 接近的相機視體平面距離值
    10000 // 遠的相機視體平面距離值
  );
  scene.add(camera);   // 將相機加入場景
  // 建立渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(sw, sh);  // 設定渲染器渲染範圍
  // 產出方塊資料庫
  for (let j = 0, jl = rows; j < jl; j++) {
    boxes.planeBottom[j] = [];
    boxes.planeTop[j] = [];
    for (let i = 0, il = cols; i < il; i++) {
      boxes.planeBottom[j][i] = emptySlot;
      boxes.planeTop[j][i] = emptySlot;
    };
  };
  // 產製方塊平面
  for (var i = 0, il = rows * cols; i < il; i++) {
    createBox();
  };
  // 製作方塊
  function createBox() {
    const xi = Math.floor(Math.random() * cols), xai = xi;
    const yi = Math.random() > 0.5 ? 1 : -1, yai = yi === -1 ? planeBottom : planeTop;
    const zi = Math.floor(Math.random() * rows), zai = zi;
    const x = (xi - cols / 2) * (size.width + gap);
    const y = yi * planeOffset;
    const z = zi * (size.depth + gap);
    if (boxes[yai][zai][xai] === emptySlot) {
      let box = draw(size);
      box.position.y = y;
      box.isWarping = false;
      box.offset = {
        x: x, z: 0
      };
      box.posZ = z;
      boxes[yai][zai][xai] = box; // 方塊回寫
      boxes1d.push(box); // 儲存方塊
      scene.add(box); // 將此方塊加入場景
    }
  }
  function draw(props) {
    // 定義顏色
    let colours = {
      slow: {
        r: num(0, 0.2), g: num(0.5, 0.9), b: num(0.3, 0.7)
      },
      fast: {
        r: num(0.9, 1.0), g: num(0.1, 0.7), b: num(0.2, 0.5)
      }
    };
    // 定義格式
    let uniforms = {
      r: { type: "f", value: colours.slow.r },
      g: { type: "f", value: colours.slow.g },
      b: { type: "f", value: colours.slow.b },
      distanceX: { type: "f", value: 1.0 },
      distanceZ: { type: "f", value: 1.0 },
      pulse: { type: "f", value: 0 },
      speed: { type: "f", value: speed },
    };
    // 建立材質 Material
    let material = new THREE.ShaderMaterial({
      uniforms: uniforms, vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });
    // 建立矩形 Geometry
    let geometry = new THREE.BoxGeometry(props.width, props.height, props.depth);
    // 使用以上矩形與材質, 將其實例化成一個方塊
    let object = new THREE.Mesh(geometry, material);
    object.colours = colours;
    return object; // 完成一個方塊參數
  }
  // 製造rgb色碼隨機數
  function num(min, max) {
    return Math.random() * (max - min) + min;
  }
  document.body.appendChild(renderer.domElement); // 將渲染元素加入 body

  // 監聽用戶行為
  function listen(eventNames, callback) {
    for (var i = 0; i < eventNames.length; i++) {
      window.addEventListener(eventNames[i], callback);
    }
  };
  // 監聽：重新調整視窗
  listen(["resize"], function (e) {
    sw = window.innerWidth;
    sh = window.innerHeight
    camera.aspect = sw / sh;
    camera.updateProjectionMatrix(); renderer.setSize(sw, sh);
  });
  // 監聽：按下滑鼠
  listen(["mousedown", "touchstart"], function (e) {
    e.preventDefault();
    isMouseDown = true;
  });
  // 監聽：放開滑鼠
  listen(["mouseup", "touchend"], function (e) {
    e.preventDefault();
    isMouseDown = false;
  });
  // 監聽：滑鼠移動
  listen(["mousemove", "touchmove"], function (e) {
    e.preventDefault();
    if (e.changedTouches && e.changedTouches[0]) e = e.changedTouches[0];
    mouse.x = (e.clientX / sw) * 2 - 1;
    mouse.y = -(e.clientY / sh) * 2 + 1;
  });
  render(0); // 初始完畢後開始畫面作動渲染
}
// 畫面作動渲染
function render(time) {
  speed -= (speed - (isMouseDown ? speedFast : speedNormal)) * 0.05;
  let box;
  for (let b = 0, bl = boxes1d.length; b < bl; b++) {
    box = boxes1d[b];
    box.posZ += speed;
    let distanceZ = 1 - ((allRowsDepth - box.posZ) / (allRowsDepth) - 1);
    box.material.uniforms.distanceZ.value = distanceZ;
    let distanceX = 1 - (Math.abs(box.position.x)) / (allColsWidth / 3);
    box.material.uniforms.distanceX.value = distanceX;
    let colour = isMouseDown ? box.colours.fast : box.colours.slow; // 如果按下滑鼠，用fast的色調
    box.material.uniforms.r.value -= (box.material.uniforms.r.value - colour.r) * 0.1;
    box.material.uniforms.g.value -= (box.material.uniforms.g.value - colour.g) * 0.1;
    box.material.uniforms.b.value -= (box.material.uniforms.b.value - colour.b) * 0.1;
    let currentSpeed = (speed - speedNormal) / (speedFast - speedNormal)
    box.material.uniforms.speed.value = currentSpeed;
    if (Math.random() > (0.99995 - currentSpeed * 0.005)) {
      box.material.uniforms.pulse.value = 1;
    }
    box.material.uniforms.pulse.value -= box.material.uniforms.pulse.value * 0.1 / (currentSpeed + 1);
  }
  // 向前移動
  for (var j = 0, jl = rows; j < jl; j++) {
    for (var i = 0, il = cols; i < il; i++) {
      move(i, planeBottom, j);
      move(i, planeTop, j);
    };
  };
  // 相機位置
  camPos.x -= (camPos.x - mouse.x * 400) * 0.02;
  camPos.y -= (camPos.y - mouse.y * 150) * 0.05;
  camPos.z = -100;
  camera.position.set(camPos.x, camPos.y, camPos.z);
  camera.rotation.y = camPos.x / -1000;
  camera.rotation.x = camPos.y / 1000;
  camera.rotation.z = (camPos.x - mouse.x * 400) / 2000;
  renderer.render(scene, camera); // 定義渲染器函數
  requestAnimationFrame(render); // 定義動畫渲染器
}

// 移動
function move(x, y, z) {
  var box = boxes[y][z][x]; if (box !== emptySlot) {
    box.position.x = box.offset.x;
    box.position.z = box.offset.z + box.posZ;
    if (box.position.z > 0) {
      box.posZ -= allRowsDepth;
    }
    if (!box.isWarping && Math.random() > 0.999) {
      var dir = Math.floor(Math.random() * 5), xn = x, zn = z, yn = y, yi = 0, xo = 0, zo = 0;
      switch (dir) {
        case 0:
          xn++;
          xo = 1;
          break;
        case 1:
          xn--;
          xo = -1;
          break;
        case 2:
          zn++;
          zo = 1;
          break;
        case 3:
          zn--;
          zo = -1;
          break;
        case 4:
          yn = (y === planeTop) ? planeBottom : planeTop;
          yi = (y === planeTop) ? -1 : 1;
          break;
      }
      if (boxes[yn][zn] && boxes[yn][zn][xn] === emptySlot) {
        boxes[y][z][x] = emptySlot; box.isWarping = true;
        boxes[yn][zn][xn] = box;
        if (dir === 4) {
          TweenMax.to(box.position, 0.5, {
            y: yi * planeOffset
          });
        } else {
          TweenMax.to(box.offset, 0.5, { x: box.offset.x + xo * (size.width + gap), z: box.offset.z + zo * (size.depth + gap), });
        }
        TweenMax.to(box.offset, 0.6, {
          onComplete: function () { box.isWarping = false; }
        });
      }
    }
  }
}
