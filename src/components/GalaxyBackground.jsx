import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GalaxyBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 30, 60);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const N = 8000;
    const arms = 3;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      const arm = i % arms;
      const tVal = Math.random();
      const r = tVal * 40 + 2;
      const spin = r * 0.3;
      const offset = arm * ((Math.PI * 2) / arms);
      const a = offset + spin + Math.random() * 0.5;
      const spread = Math.random() * 0.5 + Math.random() * 0.5;

      pos[i * 3] = Math.cos(a) * r + (Math.random() - 0.5) * spread * 3;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = Math.sin(a) * r + (Math.random() - 0.5) * spread * 3;

      col[i * 3] = 0.9 + tVal * 0.1;
      col[i * 3 + 1] = 0.9 + tVal * 0.05;
      col[i * 3 + 2] = 1;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let animationId;
    let t = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      t += 0.003;
      camera.position.x = Math.sin(t) * 70;
      camera.position.z = Math.cos(t) * 70;
      camera.lookAt(0, 0, 0);
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
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} />;
}
