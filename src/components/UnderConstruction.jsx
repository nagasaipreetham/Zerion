import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '../context/ThemeContext'

// ─── Ground with tire tracks (adapts to day/night) ────────────────────────────
function Ground({ isDay }) {
  const groundColor = isDay ? '#3a3a2e' : '#12122a'
  const gridColor1 = isDay ? '#5a5a4a' : '#3a3aff'
  const gridColor2 = isDay ? '#4a4a3a' : '#22224a'
  
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color={groundColor} roughness={1} />
      </mesh>
      <gridHelper args={[30, 15, gridColor1, gridColor2]} position={[0, 0.01, 0]} />
      
      {/* Tire tracks from heavy machinery */}
      {[
        { start: [-4.2, -1.2], end: [2, 3], width: 0.25 },
        { start: [3.8, 0.5], end: [3.8, 3.5], width: 0.22 },
      ].map((track, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, Math.atan2(track.end[1] - track.start[1], track.end[0] - track.start[0])]}
          position={[(track.start[0] + track.end[0]) / 2, 0.02, (track.start[1] + track.end[1]) / 2]}>
          <planeGeometry args={[
            Math.hypot(track.end[0] - track.start[0], track.end[1] - track.start[1]),
            track.width
          ]} />
          <meshStandardMaterial color={isDay ? '#2a2a1e' : '#0a0a18'} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Blinking Warning Light ───────────────────────────────────────────────────
function WarningLight({ position, color = '#ff3300' }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.material.emissiveIntensity = Math.sin(clock.getElapsedTime() * 5) > 0 ? 3 : 0.2
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
    </mesh>
  )
}

// ─── Building Under Construction (Skeleton Frame) ─────────────────────────────
function Building({ position = [0, 0, 0] }) {
  const FLOORS = 6
  const FLOOR_H = 0.7
  const floorRefs = useRef([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const CONSTRUCTION_TIME_PER_FLOOR = 2.5 // seconds to build each floor
    const CYCLE_TIME = FLOORS * CONSTRUCTION_TIME_PER_FLOOR + 1 // +1 for pause before restart
    
    floorRefs.current.forEach((floorGroup, floorIdx) => {
      if (!floorGroup) return
      
      // Calculate when this floor should START building (only after previous floor completes)
      const floorStartTime = floorIdx * CONSTRUCTION_TIME_PER_FLOOR
      const floorEndTime = floorStartTime + CONSTRUCTION_TIME_PER_FLOOR
      
      // Current time in the cycle
      const cycleTime = t % CYCLE_TIME
      
      // Progress for this specific floor (0 = not started, 1 = complete)
      let progress = 0
      if (cycleTime >= floorStartTime && cycleTime < floorEndTime) {
        // This floor is currently being built
        progress = (cycleTime - floorStartTime) / CONSTRUCTION_TIME_PER_FLOOR
      } else if (cycleTime >= floorEndTime) {
        // This floor is already complete
        progress = 1
      }
      // else: floor hasn't started yet, progress stays 0
      
      // Apply smooth easing
      const easedProgress = Math.min(1, Math.max(0, progress))
      
      // Make floor visible/invisible and scale it
      floorGroup.visible = easedProgress > 0.01
      floorGroup.scale.y = Math.max(0.01, easedProgress)
      floorGroup.position.y = position[1] + floorIdx * FLOOR_H
    })
  })

  return (
    <group position={position}>
      {Array.from({ length: FLOORS }).map((_, floorIdx) => {
        const isTopFloor = floorIdx === FLOORS - 1
        const isBottomFloors = floorIdx < 2
        return (
          <group key={floorIdx} ref={(el) => (floorRefs.current[floorIdx] = el)}>
            {/* 4 corner columns (concrete pillars) */}
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], idx) => (
              <mesh key={`col-${idx}`} castShadow position={[x, FLOOR_H / 2, z]}>
                <boxGeometry args={[0.18, FLOOR_H, 0.18]} />
                <meshStandardMaterial color="#8b8a89" roughness={0.9} />
              </mesh>
            ))}

            {/* Horizontal beams connecting columns */}
            {/* Front & back beams */}
            {[1, -1].map((z, idx) => (
              <mesh key={`beam-fb-${idx}`} castShadow position={[0, FLOOR_H - 0.1, z]}>
                <boxGeometry args={[2.18, 0.15, 0.18]} />
                <meshStandardMaterial color="#7a7978" roughness={0.85} />
              </mesh>
            ))}
            {/* Left & right beams */}
            {[1, -1].map((x, idx) => (
              <mesh key={`beam-lr-${idx}`} castShadow position={[x, FLOOR_H - 0.1, 0]}>
                <boxGeometry args={[0.18, 0.15, 2.18]} />
                <meshStandardMaterial color="#7a7978" roughness={0.85} />
              </mesh>
            ))}

            {/* Floor slab - partially complete on lower floors, missing on top */}
            {!isTopFloor && (
              <>
                {isBottomFloors ? (
                  // Complete slab
                  <mesh receiveShadow position={[0, FLOOR_H - 0.05, 0]}>
                    <boxGeometry args={[2.0, 0.08, 2.0]} />
                    <meshStandardMaterial color="#a8a7a5" roughness={0.95} />
                  </mesh>
                ) : (
                  // Partial slabs showing construction progress
                  <>
                    <mesh receiveShadow position={[-0.5, FLOOR_H - 0.05, 0]}>
                      <boxGeometry args={[1.0, 0.08, 2.0]} />
                      <meshStandardMaterial color="#a8a7a5" roughness={0.95} />
                    </mesh>
                    <mesh receiveShadow position={[0.7, FLOOR_H - 0.05, 0.6]}>
                      <boxGeometry args={[0.6, 0.08, 0.8]} />
                      <meshStandardMaterial color="#a8a7a5" roughness={0.95} />
                    </mesh>
                  </>
                )}
              </>
            )}

            {/* Rebar sticking out from top columns */}
            {isTopFloor &&
              [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], idx) => (
                <group key={`rebar-${idx}`} position={[x, FLOOR_H, z]}>
                  {[0.04, -0.04, 0, 0].map((offset, i) => (
                    <mesh key={i} position={[offset, 0.15, i < 2 ? 0 : offset]}>
                      <cylinderGeometry args={[0.008, 0.008, 0.3, 6]} />
                      <meshStandardMaterial color="#a85a32" roughness={0.8} metalness={0.3} />
                    </mesh>
                  ))}
                </group>
              ))}

            {/* Construction materials on upper floors */}
            {floorIdx >= 2 && !isTopFloor && (
              <>
                {/* Stack of bricks/blocks */}
                <mesh castShadow position={[0.6, FLOOR_H + 0.08, -0.5]}>
                  <boxGeometry args={[0.3, 0.16, 0.35]} />
                  <meshStandardMaterial color="#b45309" roughness={0.95} />
                </mesh>
                {/* Wooden planks */}
                {[0, 0.12].map((yOff, i) => (
                  <mesh key={i} castShadow position={[-0.5, FLOOR_H + 0.04 + yOff, 0.5]} rotation={[0, 0.3, 0]}>
                    <boxGeometry args={[0.6, 0.04, 0.12]} />
                    <meshStandardMaterial color="#92400e" roughness={0.9} />
                  </mesh>
                ))}
              </>
            )}
          </group>
        )
      })}
    </group>
  )
}

// ─── Tower Crane ──────────────────────────────────────────────────────────────
function TowerCrane({ position = [0, 0, 0] }) {
  const armRef = useRef()
  const hookRef = useRef()
  const wireRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (armRef.current) armRef.current.rotation.y = t * 0.35
    const bob = Math.sin(t * 1.4) * 0.5
    if (hookRef.current) hookRef.current.position.y = -1.2 + bob
    if (wireRef.current) {
      const wireLen = 1.2 - bob
      wireRef.current.scale.y = wireLen / 1.2
    }
  })

  return (
    <group position={position}>
      {/* Mast */}
      <mesh castShadow position={[0, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 0.2]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.7} emissive="#b45309" emissiveIntensity={0.2} />
      </mesh>
      {/* Mast cross braces */}
      {[1, 2, 3, 4].map((y) => (
        <mesh key={y} castShadow position={[0, y, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.06, 0.28, 0.06]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
      ))}

      {/* Rotating arm */}
      <group ref={armRef} position={[0, 5.2, 0]}>
        {/* Main jib */}
        <mesh castShadow position={[2, 0, 0]}>
          <boxGeometry args={[4, 0.14, 0.14]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Counter jib */}
        <mesh castShadow position={[-1.1, 0, 0]}>
          <boxGeometry args={[2.2, 0.14, 0.14]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* A-frame top */}
        <mesh castShadow position={[0, 0.5, 0]}>
          <coneGeometry args={[0.15, 0.7, 4]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        {/* Counterweight */}
        <mesh castShadow position={[-2, -0.25, 0]}>
          <boxGeometry args={[0.7, 0.4, 0.4]} />
          <meshStandardMaterial color="#6b7280" roughness={0.5} />
        </mesh>
        {/* Trolley on jib */}
        <mesh castShadow position={[3.2, -0.15, 0]}>
          <boxGeometry args={[0.2, 0.15, 0.2]} />
          <meshStandardMaterial color="#374151" metalness={0.8} />
        </mesh>
        {/* Wire */}
        <mesh ref={wireRef} position={[3.2, -0.65, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 4]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
        {/* Hook + load */}
        <group ref={hookRef} position={[3.2, -1.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <meshStandardMaterial color="#4b5563" metalness={0.9} />
          </mesh>
          {/* Carried steel beam */}
          <mesh castShadow position={[0, -0.3, 0]} rotation={[0, 0.4, 0]}>
            <boxGeometry args={[0.8, 0.12, 0.12]} />
            <meshStandardMaterial color="#78716c" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
        {/* Tip warning light */}
        <WarningLight position={[4.1, 0.15, 0]} />
      </group>
    </group>
  )
}

// ─── Excavator ────────────────────────────────────────────────────────────────
function Excavator({ position = [0, 0, 0] }) {
  const armRef = useRef()
  const bucketRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (armRef.current) armRef.current.rotation.z = Math.sin(t * 0.8) * 0.4 - 0.2
    if (bucketRef.current) bucketRef.current.rotation.z = Math.sin(t * 0.8 + 1) * 0.5
  })

  return (
    <group position={position} rotation={[0, 0.5, 0]}>
      {/* Tracks */}
      {[-0.45, 0.45].map((z, i) => (
        <mesh key={i} castShadow position={[0, 0.18, z]}>
          <boxGeometry args={[1.4, 0.22, 0.28]} />
          <meshStandardMaterial color="#292524" roughness={0.9} />
        </mesh>
      ))}
      {/* Body */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[1.0, 0.5, 0.8]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.5} metalness={0.3} emissive="#78350f" emissiveIntensity={0.15} />
      </mesh>
      {/* Cab */}
      <mesh castShadow position={[-0.1, 0.9, 0]}>
        <boxGeometry args={[0.6, 0.45, 0.65]} />
        <meshStandardMaterial color="#eab308" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Cab window */}
      <mesh position={[-0.41, 0.95, 0]}>
        <planeGeometry args={[0.25, 0.3]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.7} emissive="#38bdf8" emissiveIntensity={0.5} />
      </mesh>
      {/* Arm */}
      <group ref={armRef} position={[0.35, 0.75, 0]}>
        <mesh castShadow position={[0.4, 0.1, 0]}>
          <boxGeometry args={[0.85, 0.14, 0.12]} />
          <meshStandardMaterial color="#a16207" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Bucket */}
        <group ref={bucketRef} position={[0.85, -0.05, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.22, 0.3]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// ─── Concrete Mixer ───────────────────────────────────────────────────────────
function ConcreteMixer({ position = [0, 0, 0] }) {
  const drumRef = useRef()
  useFrame(({ clock }) => {
    if (drumRef.current) {
      // Rotate around the drum's own tilted axis (Y-axis of the drum group after tilt)
      drumRef.current.rotation.y = clock.getElapsedTime() * 2.2
    }
  })

  return (
    <group position={position} scale={0.75} rotation={[0, -0.3, 0]}>
      {/* Chassis */}
      <mesh castShadow position={[0, 0.42, 0]}>
        <boxGeometry args={[2.2, 0.8, 1.0]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} metalness={0.3} emissive="#7f1d1d" emissiveIntensity={0.2} />
      </mesh>
      {/* Cab */}
      <mesh castShadow position={[-0.7, 0.9, 0]}>
        <boxGeometry args={[0.8, 0.7, 1.0]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Windshield */}
      <mesh position={[-1.11, 0.96, 0]}>
        <planeGeometry args={[0.35, 0.42]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.7} emissive="#38bdf8" emissiveIntensity={0.5} />
      </mesh>
      {/* Wheels */}
      {[[-0.65, 0, 0.55], [-0.65, 0, -0.55], [0.6, 0, 0.55], [0.6, 0, -0.55]].map(([x, y, z], i) => (
        <mesh key={i} castShadow position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.18, 16]} />
          <meshStandardMaterial color="#1c1917" roughness={0.9} />
        </mesh>
      ))}
      {/* Drum mounting frame - tilted back at angle */}
      <mesh castShadow position={[0.55, 0.75, 0]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[0.14, 0.65, 0.14]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </mesh>
      <mesh castShadow position={[0.55, 0.75, 0]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[0.14, 0.65, 0.14]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </mesh>
      
      {/* Rotating drum - tilted at realistic angle, rotates around its own Y-axis */}
      <group position={[0.55, 0.98, 0]} rotation={[0, 0, -0.25]}>
        <group ref={drumRef}>
          {/* Main drum cylinder */}
          <mesh castShadow>
            <cylinderGeometry args={[0.42, 0.32, 1.3, 16]} />
            <meshStandardMaterial color="#6b7280" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Spiral mixing fins inside - these should rotate with drum */}
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <mesh key={k} position={[0, -0.55 + k * 0.22, 0]} rotation={[0, (k * Math.PI) / 3, 0]}>
              <torusGeometry args={[0.32, 0.03, 6, 16, Math.PI * 0.8]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.8} />
            </mesh>
          ))}
          {/* Drum opening/mouth at back */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.22, 0.18, 0.35, 12]} />
            <meshStandardMaterial color="#374151" metalness={0.6} />
          </mesh>
          {/* Chute extension */}
          <mesh position={[0, 0.58, 0.08]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.14, 0.25, 8]} />
            <meshStandardMaterial color="#52525b" metalness={0.5} />
          </mesh>
        </group>
      </group>
      
      {/* Headlights */}
      {[0.38, -0.38].map((z, i) => (
        <mesh key={i} position={[-1.12, 0.55, z]}>
          <circleGeometry args={[0.09, 12]} />
          <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Scaffolding ──────────────────────────────────────────────────────────────
function Scaffolding({ position = [0, 0, 0], height = 4 }) {
  const levels = Math.floor(height)
  return (
    <group position={position}>
      {/* 4 vertical poles */}
      {[[0, 0], [1.0, 0], [0, 1.0], [1.0, 1.0]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, height / 2, z]}>
          <cylinderGeometry args={[0.035, 0.035, height, 6]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Horizontal ledgers at each level */}
      {Array.from({ length: levels + 1 }).map((_, lvl) =>
        [[0.5, 0], [0.5, 1.0], [0, 0.5], [1.0, 0.5]].map(([x, z], i) => (
          <mesh key={`l-${lvl}-${i}`} castShadow
            position={[x, lvl, z]}
            rotation={i < 2 ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, i < 2 ? 1.0 : 1.0, 6]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.7} />
          </mesh>
        ))
      )}
      {/* Diagonal cross-bracing */}
      {Array.from({ length: levels }).map((_, lvl) => (
        <group key={`brace-${lvl}`}>
          <mesh castShadow position={[0.5, lvl + 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.02, 0.02, 1.42, 6]} />
            <meshStandardMaterial color="#6b7280" metalness={0.6} />
          </mesh>
          <mesh castShadow position={[0.5, lvl + 0.5, 1.0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.02, 0.02, 1.42, 6]} />
            <meshStandardMaterial color="#6b7280" metalness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Wooden planks */}
      {Array.from({ length: levels }).map((_, lvl) => (
        <mesh key={`p-${lvl}`} castShadow position={[0.5, lvl + 0.06, 0.5]}>
          <boxGeometry args={[0.95, 0.06, 0.95]} />
          <meshStandardMaterial color="#92400e" roughness={0.9} />
        </mesh>
      ))}
      {/* Safety netting on outer face */}
      <mesh position={[0.5, height / 2, -0.05]}>
        <planeGeometry args={[1.1, height]} />
        <meshStandardMaterial color="#16a34a" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <WarningLight position={[0, height + 0.15, 0]} />
      <WarningLight position={[1.0, height + 0.15, 1.0]} color="#ffaa00" />
    </group>
  )
}

// ─── Worker with Walking Animation ───────────────────────────────────────────
function Worker({ position = [0, 0, 0], vestColor = '#f97316', walkPath = null }) {
  const ref = useRef()
  const initialPos = useMemo(() => position, [])
  
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    
    if (walkPath) {
      // Worker walks along a path
      const { points, speed = 0.3, offset = 0 } = walkPath
      const progress = ((t * speed + offset) % 1)
      const segmentCount = points.length - 1
      const currentSegment = Math.floor(progress * segmentCount)
      const segmentProgress = (progress * segmentCount) % 1
      
      const start = points[currentSegment]
      const end = points[(currentSegment + 1) % points.length]
      
      ref.current.position.x = start[0] + (end[0] - start[0]) * segmentProgress
      ref.current.position.z = start[1] + (end[1] - start[1]) * segmentProgress
      
      // Face movement direction
      const angle = Math.atan2(end[1] - start[1], end[0] - start[0])
      ref.current.rotation.y = angle - Math.PI / 2
      
      // Walking bob animation
      ref.current.position.y = Math.abs(Math.sin(t * 8)) * 0.03
    } else {
      // Stationary worker with idle animation
      ref.current.rotation.y = Math.sin(t * 0.5 + initialPos[0]) * 0.3
    }
  })
  
  return (
    <group ref={ref} position={position}>
      {/* Legs */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} castShadow position={[x, 0.2, 0]}>
          <capsuleGeometry args={[0.07, 0.25, 4, 6]} />
          <meshStandardMaterial color="#1e3a5f" />
        </mesh>
      ))}
      {/* Torso / hi-vis vest */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.11, 0.28, 4, 8]} />
        <meshStandardMaterial color={vestColor} roughness={0.6} emissive={vestColor} emissiveIntensity={0.3} />
      </mesh>
      {/* Arms */}
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={i} castShadow position={[x, 0.5, 0]}>
          <capsuleGeometry args={[0.05, 0.22, 4, 6]} />
          <meshStandardMaterial color={vestColor} />
        </mesh>
      ))}
      {/* Head */}
      <mesh castShadow position={[0, 0.88, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#fcd5b0" />
      </mesh>
      {/* Hard hat */}
      <mesh castShadow position={[0, 0.98, 0]}>
        <sphereGeometry args={[0.115, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#facc15" roughness={0.4} emissive="#ca8a04" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 0.91, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.11, 0.17, 14]} />
        <meshStandardMaterial color="#facc15" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ─── Welding Sparks ───────────────────────────────────────────────────────────
function WeldingSparks({ origin = [0, 0, 0] }) {
  const COUNT = 80
  const ref = useRef()
  const { posArr, velArr, colArr } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const col = new Float32Array(COUNT * 3)
    const vel = []
    for (let i = 0; i < COUNT; i++) {
      pos.set([origin[0], origin[1], origin[2]], i * 3)
      vel.push({
        x: (Math.random() - 0.5) * 0.06,
        y: Math.random() * 0.08 + 0.01,
        z: (Math.random() - 0.5) * 0.06,
        life: Math.random(),
        maxLife: 0.3 + Math.random() * 0.5,
      })
      col.set([1, 0.5 + Math.random() * 0.4, 0], i * 3)
    }
    return { posArr: pos, velArr: vel, colArr: col }
  }, [])

  const posRef = useRef(posArr)

  useFrame((_, dt) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < COUNT; i++) {
      const v = velArr[i]
      v.life += dt
      if (v.life > v.maxLife) {
        pos.set([origin[0], origin[1], origin[2]], i * 3)
        v.life = 0
        v.x = (Math.random() - 0.5) * 0.06
        v.y = Math.random() * 0.08 + 0.01
        v.z = (Math.random() - 0.5) * 0.06
      } else {
        pos[i * 3] += v.x
        pos[i * 3 + 1] += v.y
        pos[i * 3 + 2] += v.z
        v.y -= dt * 0.12
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={posRef.current} count={COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colArr} count={COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.09} vertexColors sizeAttenuation transparent opacity={0.9} />
    </points>
  )
}

// ─── Forklift ─────────────────────────────────────────────────────────────────
function Forklift({ position = [0, 0, 0] }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    // Move forklift back and forth
    ref.current.position.x = position[0] + Math.sin(t * 0.4) * 1.5
  })
  
  return (
    <group ref={ref} position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* Body */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[1.0, 0.7, 0.8]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Overhead guard */}
      {[[-0.35, 0.35], [0.35, 0.35], [-0.35, -0.35], [0.35, -0.35]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.15, z]}>
          <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
          <meshStandardMaterial color="#374151" metalness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.8]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      {/* Seat */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[0.3, 0.12, 0.3]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Wheels */}
      {[[-0.35, 0, 0.45], [-0.35, 0, -0.45], [0.4, 0, 0.3], [0.4, 0, -0.3]].map(([x, y, z], i) => (
        <mesh key={i} castShadow position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.15, 12]} />
          <meshStandardMaterial color="#1c1917" roughness={0.9} />
        </mesh>
      ))}
      {/* Mast */}
      <mesh castShadow position={[0.45, 1.2, 0]}>
        <boxGeometry args={[0.08, 2.4, 0.08]} />
        <meshStandardMaterial color="#52525b" metalness={0.8} />
      </mesh>
      {/* Forks */}
      {[-0.15, 0.15].map((z, i) => (
        <mesh key={i} castShadow position={[0.75, 0.5, z]}>
          <boxGeometry args={[0.6, 0.04, 0.08]} />
          <meshStandardMaterial color="#71717a" metalness={0.9} />
        </mesh>
      ))}
      {/* Pallet on forks */}
      <group position={[0.95, 0.6, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.08, 0.5]} />
          <meshStandardMaterial color="#92400e" roughness={0.9} />
        </mesh>
        {/* Cement bags stack */}
        {[0, 0.1, 0.2].map((y, i) => (
          <mesh key={i} castShadow position={[0, 0.08 + y, 0]}>
            <boxGeometry args={[0.35, 0.12, 0.3]} />
            <meshStandardMaterial color="#a8a29e" roughness={0.95} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ─── Material Storage Zone ────────────────────────────────────────────────────
function MaterialZone({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Cement bag pallets */}
      {[[0, 0], [0.8, 0], [1.6, 0]].map(([x, z], i) => (
        <group key={`cement-${i}`} position={[x, 0, z]}>
          <mesh castShadow position={[0, 0.04, 0]}>
            <boxGeometry args={[0.6, 0.08, 0.6]} />
            <meshStandardMaterial color="#92400e" roughness={0.9} />
          </mesh>
          {[0, 0.12, 0.24, 0.36].map((y, j) => (
            <mesh key={j} castShadow position={[0, 0.1 + y, 0]}>
              <boxGeometry args={[0.45, 0.12, 0.4]} />
              <meshStandardMaterial color="#d6d3d1" roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Steel beam rack */}
      <group position={[3, 0, 0]}>
        {/* Support frame */}
        {[[0, 0], [1.5, 0]].map(([x, z], i) => (
          <mesh key={i} castShadow position={[x, 0.3, z]}>
            <boxGeometry args={[0.1, 0.6, 0.1]} />
            <meshStandardMaterial color="#52525b" metalness={0.8} />
          </mesh>
        ))}
        {/* Beams stacked */}
        {[0, 0.15, 0.3].map((y, i) => (
          <mesh key={i} castShadow position={[0.75, 0.15 + y, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[1.5, 0.12, 0.12]} />
            <meshStandardMaterial color="#78716c" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
      
      {/* Brick pile */}
      <group position={[0, 0, 1.2]}>
        {Array.from({ length: 12 }).map((_, i) => {
          const layer = Math.floor(i / 4)
          const posInLayer = i % 4
          return (
            <mesh key={i} castShadow
              position={[posInLayer * 0.25 - 0.3, layer * 0.09 + 0.045, 0]}
              rotation={[0, layer % 2 === 0 ? 0 : Math.PI / 2, 0]}>
              <boxGeometry args={[0.22, 0.08, 0.12]} />
              <meshStandardMaterial color="#b45309" roughness={0.95} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

// ─── Portable Site Office ─────────────────────────────────────────────────────
function SiteOffice({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Container body */}
      <mesh castShadow position={[0, 0.65, 0]}>
        <boxGeometry args={[2.5, 1.3, 1.2]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Roof */}
      <mesh castShadow position={[0, 1.32, 0]}>
        <boxGeometry args={[2.52, 0.05, 1.22]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Door */}
      <mesh position={[-0.8, 0.65, 0.61]}>
        <boxGeometry args={[0.5, 1.1, 0.05]} />
        <meshStandardMaterial color="#374151" roughness={0.6} />
      </mesh>
      <mesh position={[-0.85, 0.7, 0.63]}>
        <boxGeometry args={[0.05, 0.08, 0.04]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} />
      </mesh>
      {/* Windows */}
      {[0.4, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 0.85, 0.61]}>
          <planeGeometry args={[0.4, 0.35]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.7} emissive="#38bdf8" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* AC unit on side - moved to avoid collision */}
      <mesh castShadow position={[1.3, 1.05, 0]}>
        <boxGeometry args={[0.2, 0.25, 0.35]} />
        <meshStandardMaterial color="#52525b" roughness={0.5} />
      </mesh>
      {/* Sign board */}
      <mesh position={[0, 0.3, 0.62]}>
        <planeGeometry args={[0.8, 0.25]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fde047" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// ─── Floodlight Tower (Simplified) ────────────────────────────────────────────
function FloodlightTower({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Single pole */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 3.6, 8]} />
        <meshStandardMaterial color="#52525b" metalness={0.7} />
      </mesh>
      {/* Base plate */}
      <mesh castShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 8]} />
        <meshStandardMaterial color="#1f2937" roughness={0.6} />
      </mesh>
      {/* Light fixture at top */}
      <group position={[0, 3.5, 0]}>
        <mesh castShadow rotation={[Math.PI / 6, 0, 0]}>
          <boxGeometry args={[0.4, 0.15, 0.25]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
        {/* Light bulbs */}
        <mesh position={[0, -0.05, 0.15]}>
          <boxGeometry args={[0.35, 0.08, 0.08]} />
          <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={2.5} />
        </mesh>
      </group>
      <pointLight position={[0, 3.4, 0.3]} intensity={2.2} distance={10} color="#fffbeb" castShadow />
    </group>
  )
}

// ─── Wheelbarrow with Worker ──────────────────────────────────────────────────
function Wheelbarrow({ position = [0, 0, 0] }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    // Move along path
    ref.current.position.z = position[2] + Math.sin(t * 0.5) * 1.8
    ref.current.rotation.y = Math.sin(t * 0.5) > 0 ? 0 : Math.PI
  })
  
  return (
    <group ref={ref} position={position}>
      {/* Wheelbarrow */}
      <mesh castShadow position={[0, 0.25, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.7]} />
        <meshStandardMaterial color="#059669" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Wheel */}
      <mesh castShadow position={[0, 0.12, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>
      {/* Handles */}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0.4, -0.4]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#78716c" metalness={0.7} />
        </mesh>
      ))}
      {/* Gravel/sand load */}
      <mesh castShadow position={[0, 0.38, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.5]} />
        <meshStandardMaterial color="#78716c" roughness={1} />
      </mesh>
    </group>
  )
}

// ─── Safety Sign ──────────────────────────────────────────────────────────────
function SafetySign({ position = [0, 0, 0], type = 'hardhat' }) {
  return (
    <group position={position}>
      {/* Post */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.6, 8]} />
        <meshStandardMaterial color="#71717a" metalness={0.7} />
      </mesh>
      {/* Sign board */}
      <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.04]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>
      {/* Icon representation (simplified) */}
      <mesh position={[0, 1.2, 0.03]} rotation={[0, Math.PI / 4, 0]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  )
}

// ─── Water Cooler Station ─────────────────────────────────────────────────────
function WaterCooler({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[0.35, 0.6, 0.35]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.5} />
      </mesh>
      {/* Water bottle */}
      <mesh castShadow position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} />
      </mesh>
      {/* Dispenser spout */}
      <mesh position={[0.15, 0.4, 0]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#52525b" metalness={0.8} />
      </mesh>
      {/* Cups stacked */}
      <mesh castShadow position={[0.25, 0.25, 0]}>
        <cylinderGeometry args={[0.05, 0.04, 0.15, 8]} />
        <meshStandardMaterial color="#f0f9ff" roughness={0.3} />
      </mesh>
    </group>
  )
}

// ─── Tool Storage Box ─────────────────────────────────────────────────────────
function ToolBox({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.4]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Lock */}
      <mesh position={[0.41, 0.15, 0]}>
        <boxGeometry args={[0.05, 0.08, 0.06]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} />
      </mesh>
    </group>
  )
}

// ─── Ladder Leaning on Scaffolding ───────────────────────────────────────────
function Ladder({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Side rails */}
      {[-0.15, 0.15].map((x, i) => (
        <mesh key={i} castShadow position={[x, 1.2, 0]}>
          <boxGeometry args={[0.05, 2.4, 0.05]} />
          <meshStandardMaterial color="#d97706" roughness={0.7} />
        </mesh>
      ))}
      {/* Rungs */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0.3 + i * 0.3, 0]}>
          <boxGeometry args={[0.35, 0.04, 0.04]} />
          <meshStandardMaterial color="#d97706" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Fire Extinguisher ────────────────────────────────────────────────────────
function FireExtinguisher({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Cylinder */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Top cap */}
      <mesh castShadow position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.06, 12]} />
        <meshStandardMaterial color="#1f2937" metalness={0.8} />
      </mesh>
      {/* Hose */}
      <mesh position={[0.05, 0.35, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.015, 0.015, 0.15, 6]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
    </group>
  )
}

// ─── Traffic Cone ─────────────────────────────────────────────────────────────
function TrafficCone({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.25, 0.04, 0.25]} />
        <meshStandardMaterial color="#1c1917" roughness={0.8} />
      </mesh>
      {/* Cone body */}
      <mesh castShadow position={[0, 0.22, 0]}>
        <coneGeometry args={[0.11, 0.4, 8]} />
        <meshStandardMaterial color="#f97316" roughness={0.6} emissive="#ea580c" emissiveIntensity={0.2} />
      </mesh>
      {/* Reflective stripes */}
      {[0.12, 0.24].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.08 - i * 0.03, 0.1 - i * 0.03, 0.05, 8]} />
          <meshStandardMaterial color="#fef9c3" emissive="#fde047" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Construction Barrier Fence ───────────────────────────────────────────────
function ConstructionBarrier({ position = [0, 0, 0], rotation = 0, length = 2 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Horizontal top and bottom rails */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[length, 0.05, 0.05]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[length, 0.05, 0.05]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.6} />
      </mesh>
      {/* Vertical posts */}
      {Array.from({ length: Math.floor(length / 0.5) + 1 }).map((_, i) => {
        const x = -length / 2 + i * 0.5
        return (
          <mesh key={i} position={[x, 0.35, 0]}>
            <boxGeometry args={[0.04, 0.7, 0.04]} />
            <meshStandardMaterial color="#d97706" roughness={0.7} />
          </mesh>
        )
      })}
      {/* Diagonal stripes for visibility */}
      {Array.from({ length: Math.floor(length / 0.4) }).map((_, i) => {
        const x = -length / 2 + 0.2 + i * 0.4
        return (
          <mesh key={`stripe-${i}`} position={[x, 0.35, 0.03]} rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[0.08, 0.5]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.3} />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── Floating dust ────────────────────────────────────────────────────────────
function DustParticles() {
  const COUNT = 100
  const ref = useRef()
  const { posArr, spd } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const s = []
    for (let i = 0; i < COUNT; i++) {
      pos.set([(Math.random() - 0.5) * 18, Math.random() * 6, (Math.random() - 0.5) * 18], i * 3)
      s.push({ x: (Math.random() - 0.5) * 0.004, y: (Math.random() - 0.5) * 0.002, z: (Math.random() - 0.5) * 0.004 })
    }
    return { posArr: pos, spd: s }
  }, [])

  const posRef = useRef(posArr)

  useFrame(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] += spd[i].x
      pos[i * 3 + 1] += spd[i].y
      pos[i * 3 + 2] += spd[i].z
      if (pos[i * 3] > 9) pos[i * 3] = -9
      if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = 0
      if (pos[i * 3 + 2] > 9) pos[i * 3 + 2] = -9
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={posRef.current} count={COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#d97706" transparent opacity={0.35} sizeAttenuation />
    </points>
  )
}

// ─── Full Scene ───────────────────────────────────────────────────────────────
function Scene({ isDay }) {
  // Environment colors based on mode
  const bgColor = isDay ? '#FFFFFF' : '#050514'
  const fogColor = isDay ? '#E8E8E8' : '#050514'
  const fogNear = isDay ? 25 : 18
  const fogFar = isDay ? 60 : 40
  
  // Lighting intensity based on mode
  const ambientIntensity = isDay ? 1.5 : 0.6
  const ambientColor = isDay ? '#F5F5F5' : '#c7d2fe'
  
  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

      {/* Adaptive lighting based on time of day */}
      <ambientLight intensity={ambientIntensity} color={ambientColor} />
      
      {isDay ? (
        <>
          {/* Daytime lighting - bright directional sunlight */}
          <directionalLight 
            position={[10, 15, 10]} 
            intensity={3.2} 
            color="#FFFEF7" 
            castShadow
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024} 
          />
          <pointLight position={[-5, 4, 4]} intensity={1.8} color="#FFF8E1" distance={14} />
          <pointLight position={[6, 3, -3]} intensity={1.5} color="#F0F0F0" distance={12} />
        </>
      ) : (
        <>
          {/* Nighttime lighting - colored artificial lights */}
          <directionalLight 
            position={[6, 10, 6]} 
            intensity={1.5} 
            color="#C0D4E8" 
            castShadow
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024} 
          />
          <pointLight position={[-5, 4, 4]} intensity={3} color="#f97316" distance={14} />
          <pointLight position={[6, 3, -3]} intensity={2.5} color="#3b82f6" distance={12} />
          <pointLight position={[0, 1, 5]} intensity={2} color="#22c55e" distance={10} />
          <pointLight position={[-3, 6, 0]} intensity={1.5} color="#a855f7" distance={12} />
        </>
      )}

      {isDay ? null : <Stars radius={50} depth={25} count={800} factor={3} fade saturation={1} />}

      <Ground isDay={isDay} />

      {/* Central building under construction */}
      <Building position={[0, 0, 0]} />

      {/* Background finished building #1 - left */}
      <group position={[-4.5, 0, -4]}>
        <mesh castShadow position={[0, 1.8, 0]}>
          <boxGeometry args={[1.6, 4.6, 1.6]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.4} metalness={0.4} emissive="#1e3a8a" emissiveIntensity={0.1} />
        </mesh>
        {/* Windows on front face (z = +0.81) */}
        {[
          [0.4, 1.2], [-0.4, 1.2],
          [0.4, 2.0], [-0.4, 2.0],
          [0.4, 2.8], [-0.4, 2.8],
          [0.4, 3.4], [-0.4, 3.4],
        ].map(([wx, wy], i) => (
          <mesh key={i} position={[wx, wy, 0.81]}>
            <planeGeometry args={[0.25, 0.28]} />
            <meshStandardMaterial color="#fef9c3" emissive="#fde047" emissiveIntensity={i % 3 === 0 ? 0.3 : 1.8} />
          </mesh>
        ))}
      </group>

      {/* Background finished building #2 - right */}
      <group position={[5, 0, -3.5]}>
        <mesh castShadow position={[0, 1.2, 0]}>
          <boxGeometry args={[1.4, 2.4, 1.4]} />
          <meshStandardMaterial color="#065f46" roughness={0.4} metalness={0.4} emissive="#065f46" emissiveIntensity={0.1} />
        </mesh>
        {/* Windows on front face (z = +0.71) */}
        {[
          [0.35, 0.7], [-0.35, 0.7],
          [0.35, 1.3], [-0.35, 1.3],
          [0.35, 1.9], [-0.35, 1.9],
        ].map(([wx, wy], i) => (
          <mesh key={i} position={[wx, wy, 0.71]}>
            <planeGeometry args={[0.22, 0.24]} />
            <meshStandardMaterial color="#fef9c3" emissive="#fde047" emissiveIntensity={i % 2 === 0 ? 1.5 : 0.2} />
          </mesh>
        ))}
      </group>

      {/* Tower crane - clear of all objects */}
      <TowerCrane position={[4.2, 0, 0.8]} />

      {/* Excavator digging - away from paths */}
      <Excavator position={[-3.8, 0, 3.2]} />

      {/* Concrete mixer - at perimeter */}
      <ConcreteMixer position={[-5.2, 0, -0.8]} />

      {/* Forklift moving materials - in material zone */}
      <Forklift position={[-6.5, 0, -2]} />

      {/* Material storage zone - far left corner, clear spacing */}
      <MaterialZone position={[-7, 0, -3.5]} />

      {/* Portable site office - back corner with clearance */}
      <SiteOffice position={[-7.5, 0, 3.5]} />

      {/* Floodlight towers - OUTSIDE fence perimeter */}
      <FloodlightTower position={[6.5, 0, 3.5]} />
      <FloodlightTower position={[-6.5, 0, -5.5]} />

      {/* Wheelbarrow being moved - clear path along side */}
      <Wheelbarrow position={[3.5, 0, 1.8]} />

      {/* Scaffolding wrapping around building */}
      <Scaffolding position={[-1.9, 0, -1.4]} height={4.2} />
      <Scaffolding position={[1.3, 0, -1.4]} height={3.8} />
      <Scaffolding position={[-1.9, 0, 1.0]} height={3.5} />

      {/* Ladder leaning on scaffolding - positioned safely */}
      <Ladder position={[-1.6, 0, -1.0]} rotation={[0, 0.3, -0.3]} />
      <Ladder position={[1.6, 0, 1.3]} rotation={[0, -0.5, -0.35]} />

      {/* Workers with walking paths - COLLISION-FREE paths */}
      <Worker 
        position={[-3, 0, 1]} 
        vestColor="#f97316"
        walkPath={{
          points: [[-3, 1], [-4.5, 0.5], [-5.5, -1], [-4, -0.5], [-3, 1]],
          speed: 0.12,
          offset: 0
        }}
      />
      <Worker 
        position={[2.8, 0, 2.5]} 
        vestColor="#22c55e"
        walkPath={{
          points: [[2.8, 2.5], [2, 1.5], [1, 0.8], [2.2, 2], [2.8, 2.5]],
          speed: 0.15,
          offset: 0.3
        }}
      />
      <Worker 
        position={[3.5, 0, -1.5]} 
        vestColor="#f97316"
        walkPath={{
          points: [[3.5, -1.5], [4, -0.5], [3.2, 0.5], [3.5, -1.5]],
          speed: 0.18,
          offset: 0.5
        }}
      />
      {/* Stationary workers - positioned with clearance */}
      <Worker position={[-7, 0, 4.3]} vestColor="#eab308" /> {/* At office entrance */}
      <Worker position={[-4.5, 0, 1.5]} vestColor="#22c55e" /> {/* Supervisor in open area */}

      {/* Welding sparks at active work areas on scaffolding */}
      <WeldingSparks origin={[1.3, 2.2, -1.35]} />
      <WeldingSparks origin={[-1.9, 1.8, 1.1]} />

      {/* Floating dust */}
      <DustParticles />

      {/* Construction barriers/fencing around site perimeter */}
      <ConstructionBarrier position={[-5.5, 0, 5]} rotation={0} length={8} />
      <ConstructionBarrier position={[6, 0, 0]} rotation={Math.PI / 2} length={10} />
      <ConstructionBarrier position={[0, 0, -6.5]} rotation={0} length={12} />

      {/* Traffic cones marking hazard areas - spaced properly */}
      <TrafficCone position={[-2.8, 0, 2.5]} />
      <TrafficCone position={[2.5, 0, 2.8]} />
      <TrafficCone position={[-5.5, 0, 0.8]} />
      <TrafficCone position={[4.5, 0, 2]} />
      <TrafficCone position={[-1.8, 0, -2.5]} />
      <TrafficCone position={[3.2, 0, -2.8]} />
      <TrafficCone position={[-6.8, 0, 2.2]} />

      {/* Safety signs - positioned at clear viewpoints */}
      <SafetySign position={[-5, 0, 4.5]} type="hardhat" />
      <SafetySign position={[5.2, 0, 3]} type="caution" />
      <SafetySign position={[-2.5, 0, -3.5]} type="warning" />

      {/* Water cooler and tool storage - positioned with spacing */}
      <WaterCooler position={[-6.8, 0, 4.5]} />
      <ToolBox position={[-7.5, 0, -2.5]} />
      <ToolBox position={[5.2, 0, -3]} />

      {/* Fire extinguishers at key locations - clear placement */}
      <FireExtinguisher position={[-7.2, 0, 2.8]} />
      <FireExtinguisher position={[-2.2, 0, -2]} />
      <FireExtinguisher position={[4.8, 0, 2.5]} />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.7}
        enablePan={false}
        minDistance={7}
        maxDistance={22}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 2.5, 0]}
      />
    </>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function ConstructionScene() {
  const { theme } = useTheme();
  const isDay = theme === 'light';
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cameraPosition = isMobile ? [13.26, 8.3, 16.57] : [8.74, 6.32, 10.92];

  return (
    <div className="preui-3d-scene" style={{
      width: '100%',
      borderRadius: '0px',
      overflow: 'hidden',
      position: 'relative',
      background: isDay ? '#FFFFFF' : '#050514',
      transition: 'background 2s ease',
    }}>
      {/* Bottom hint */}
      <div style={{
        position: 'absolute', bottom: 12, right: 14, zIndex: 10,
        color: isDay ? 'rgba(100,100,100,0.7)' : 'rgba(148,163,184,0.7)',
        fontSize: 11,
        letterSpacing: '0.05em',
        transition: 'color 2s ease',
      }}>
        Drag to explore · Scroll to zoom
      </div>

      <Canvas
        key={isMobile ? 'mobile' : 'desktop'}
        shadows
        camera={{ position: cameraPosition, fov: 55, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene isDay={isDay} />
      </Canvas>

      <style>{`
        @keyframes progressShift {
          0% { background-position: 0% 0% }
          100% { background-position: 200% 0% }
        }
      `}</style>
    </div>
  )
}
