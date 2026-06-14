import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function SphereBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const geo = new THREE.IcosahedronGeometry(18, 5);
    const origPos = Float32Array.from(geo.attributes.position.array);

    // Make the lines dark and thicker (increased opacity to 0.35, wireframeLinewidth to 2)
    const mat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      wireframeLinewidth: 2,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Second backing mesh for inner depth, also slightly darker
    const mat2 = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    });
    const mesh2 = new THREE.Mesh(geo, mat2);
    scene.add(mesh2);

    let animationId;
    let t = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = origPos[i * 3];
        const y = origPos[i * 3 + 1];
        const z = origPos[i * 3 + 2];
        const noise = Math.sin(x * 0.2 + t) * Math.cos(y * 0.2 + t * 0.7) * Math.sin(z * 0.2 + t * 0.5) * 3;
        const len = Math.sqrt(x * x + y * y + z * z);
        const nl = len + noise;
        pos.setXYZ(i, (x / len) * nl, (y / len) * nl, (z / len) * nl);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();

      mesh.rotation.y = t * 0.2;
      mesh.rotation.x = t * 0.1;
      mesh2.rotation.y = t * 0.2;
      mesh2.rotation.x = t * 0.1;

      t += 0.015;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      mat2.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} />;
}
