import * as THREE from "/node_modules/three/build/three.module.js";

const canvas = document.getElementById("twinCanvas");

if (canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08111f);

  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    200
  );

  camera.position.set(25, 20, 30);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  });

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  // Lighting
  const ambient = new THREE.HemisphereLight(0xffffff, 0x26384d, 2);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.position.set(10, 20, 10);
  sun.castShadow = true;
  scene.add(sun);

  // Campus ground
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(34, 0.4, 24),
    new THREE.MeshStandardMaterial({ color: 0x1b2938 })
  );

  ground.position.y = -0.2;
  scene.add(ground);

  // Road
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.08, 4),
    new THREE.MeshStandardMaterial({ color: 0x303944 })
  );

  road.position.y = 0.04;
  scene.add(road);

  function createBuilding(name, x, z, width, height, depth) {
  const group = new THREE.Group();
  ;group.name = name;
group.userData.buildingName = name;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color: 0x71859b,
      roughness: 0.6
    })
  );

  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.25, 0.25, depth + 0.25),
    new THREE.MeshStandardMaterial({
      color: 0x263746,
      roughness: 0.5
    })
  );

  roof.position.y = height + 0.12;
  roof.castShadow = true;
  group.add(roof);

  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x4fd7e8,
    metalness: 0.2,
    roughness: 0.25
  });

  const floors = Math.max(2, Math.floor(height / 2));
  const columns = Math.max(3, Math.floor(width / 1.4));

  for (let floor = 0; floor < floors; floor++) {
    for (let column = 0; column < columns; column++) {
      const windowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.65, 0.08),
        windowMaterial
      );

      const spacing = width / columns;

      windowMesh.position.set(
        -width / 2 + spacing / 2 + column * spacing,
        1 + floor * 1.65,
        depth / 2 + 0.05
      );

      group.add(windowMesh);
    }
  }

  group.position.set(x, 0, z);
  scene.add(group);

  return group;
}

createBuilding("AB1", -9, -4, 6, 5, 5);
createBuilding("AB2", 0, -5, 6, 7, 5);
createBuilding("LAB", 9, -4, 6, 4, 5);
createBuilding("Architecture", 0, 6, 5.5, 6, 5);
// Campus pathways and open spaces

function createSurface(width, depth, x, z, color, y = 0.06) {
  const surface = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.08, depth),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85
    })
  );

  surface.position.set(x, y, z);
  surface.receiveShadow = true;
  scene.add(surface);

  return surface;
}

// Main internal road
createSurface(30, 3.2, 0, 0, 0x303944, 0.05);

// Cross-campus road
createSurface(3.2, 20, 0, 1, 0x303944, 0.05);

// Pedestrian paths
createSurface(1.6, 14, -9, 1, 0x8c9298, 0.11);
createSurface(1.6, 14, 9, 1, 0x8c9298, 0.11);
createSurface(18, 1.5, 0, -5, 0x8c9298, 0.11);
createSurface(18, 1.5, 0, 6, 0x8c9298, 0.11);

// Central campus plaza
createSurface(7, 5, 0, 1.2, 0x66717c, 0.13);

// Small parking area
createSurface(8, 4, 13, 5, 0x252c34, 0.08);

// Parking lines
for (let i = 0; i < 4; i++) {
  createSurface(
    0.08,
    3.2,
    10.5 + i * 2,
    5,
    0xd7d7d7,
    0.14
  );
// Simple trees
  for (let x = -14; x <= 14; x += 4) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x654321 })
    );

    trunk.position.set(x, 0.7, 7);
    scene.add(trunk);

    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0x3f8f62 })
    );

    crown.position.set(x, 1.8, 7);
    scene.add(crown);
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
  }

  window.addEventListener("resize", resize);
  resize();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const info = document.createElement("div");

info.style.position = "absolute";
info.style.left = "20px";
info.style.top = "20px";
info.style.padding = "10px 16px";
info.style.borderRadius = "10px";
info.style.background = "rgba(8, 17, 31, 0.92)";
info.style.color = "#ffffff";
info.style.fontFamily = "system-ui, sans-serif";
info.style.fontSize = "14px";
info.style.fontWeight = "600";
info.style.pointerEvents = "none";
info.style.display = "none";
info.style.zIndex = "20";

canvas.parentElement.style.position = "relative";
canvas.parentElement.appendChild(info);

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(scene.children, true);

  const building = hits
    .map(hit => {
      let object = hit.object;

      while (object && !object.userData.buildingName) {
        object = object.parent;
      }

      return object;
    })
    .find(object => object && object.userData.buildingName);

  if (building) {
    const buildingDetails = {
      AB1: {
        title: "AB1",
        subtitle: "Academic Block 1",
        floors: "3 Floors",
        use: "Classrooms & Lecture Halls"
      },
      AB2: {
        title: "AB2",
        subtitle: "Academic Block 2",
        floors: "4 Floors",
        use: "Classrooms & Academic Spaces"
      },
      LAB: {
        title: "LAB",
        subtitle: "Laboratory Complex",
        floors: "2 Floors",
        use: "Engineering & Computer Labs"
      },
      Architecture: {
        title: "Architecture",
        subtitle: "Architecture Building",
        floors: "3 Floors",
        use: "Design Studios & Academic Spaces"
      }
    };

    const details = buildingDetails[building.userData.buildingName];

    info.innerHTML = `
      <div style="font-size:20px;font-weight:700;margin-bottom:4px;">
        ${details ? details.title : building.userData.buildingName}
      </div>
      <div style="font-size:13px;opacity:.75;margin-bottom:12px;">
        ${details ? details.subtitle : "Campus Building"}
      </div>
      <div style="font-size:13px;margin-bottom:6px;">
        <strong>Floors:</strong> ${details ? details.floors : "N/A"}
      </div>
      <div style="font-size:13px;margin-bottom:6px;">
        <strong>Use:</strong> ${details ? details.use : "Academic"}
      </div>
      <div style="font-size:13px;">
        <strong>Status:</strong> Available
      </div>
    `;

    info.style.display = "block";
  } else {
    info.style.display = "none";
  }
});
  function animate() {
    requestAnimationFrame(animate);

    camera.position.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      0.001
    );

    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  animate();

  window.CampusTwin = {
    focusRoom() {},
    setFloor() {},
    drawRoute() {}
  };

  console.log("Campus Twin 3D renderer initialized.");
}

}