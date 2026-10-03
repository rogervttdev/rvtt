"use client";

/**
 * Tabuleiro em 3D de verdade (React Three Fiber / Three.js) — a mesma tecnologia
 * já usada no dado físico da mesa. Mantém exatamente o mesmo sistema de grade
 * (x, y) e as mesmas funções de mover/selecionar da versão 2D: só a parte visual
 * muda. Por isso dá pra alternar entre 2D e 3D a qualquer momento sem perder
 * nada (sincronização em tempo real, seleção, arrastar).
 */
import { Suspense, useMemo, useRef } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Billboard } from "@react-three/drei";
import * as THREE from "three";

/**
 * Textura com o texto já desenhado (canvas 2D comum) — usada como rótulo do
 * token. Evita o componente <Text> do drei, que baixa uma fonte de uma CDN
 * externa por padrão: aqui fica 100% local, sem depender de rede nenhuma.
 */
function useLabelTexture(text: string, color: string) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.font = "700 56px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#2a1c12";
    ctx.strokeText(text, 64, 68);
    ctx.fillStyle = color;
    ctx.fillText(text, 64, 68);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, color]);
}
import { SIZE_CELLS } from "@/lib/monstros";
import { findScenery } from "@/lib/cenario";
import { initials } from "@/lib/dnd";
import type { Token } from "@/lib/types";

type Props = {
  cols: number;
  rows: number;
  tokens: Token[];
  selected: string | null;
  activeTurnId?: string;
  canControl: (t: Token) => boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onMoveEnd: (id: string, x: number, y: number) => void;
};

export function Board3D({ cols, rows, tokens, selected, activeTurnId, canControl, onSelect, onMove, onMoveEnd }: Props) {
  const dragId = useRef<string | null>(null);
  const maxSide = Math.max(cols, rows);

  function toGrid(point: THREE.Vector3, span: number) {
    const gx = Math.floor(point.x + cols / 2);
    const gy = Math.floor(point.z + rows / 2);
    return { x: Math.max(0, Math.min(cols - span, gx)), y: Math.max(0, Math.min(rows - span, gy)) };
  }

  function handleGroundMove(e: ThreeEvent<PointerEvent>) {
    if (!dragId.current) return;
    const t = tokens.find((x) => x.id === dragId.current);
    if (!t) return;
    const span = SIZE_CELLS[t.stats.size] ?? 1;
    const { x, y } = toGrid(e.point, span);
    if (x !== t.x || y !== t.y) onMove(t.id, x, y);
  }

  function handleGroundUp() {
    if (!dragId.current) return;
    const t = tokens.find((x) => x.id === dragId.current);
    dragId.current = null;
    if (t) onMoveEnd(t.id, t.x, t.y);
  }

  return (
    <div className="board3d-canvas">
      <Canvas shadows camera={{ position: [0, maxSide * 0.95, maxSide * 0.82], fov: 42 }} onPointerMissed={() => onSelect("")}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.65} />
          <directionalLight position={[cols * 0.4, maxSide * 1.2, rows * 0.3]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
          <hemisphereLight args={["#fff0d6", "#2a1c12", 0.4]} />

          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={handleGroundMove}
            onPointerUp={handleGroundUp}
            onPointerLeave={handleGroundUp}
          >
            <planeGeometry args={[cols, rows]} />
            <meshStandardMaterial color="#e8d4a0" roughness={0.9} />
          </mesh>
          <GridLines cols={cols} rows={rows} />
          <mesh position={[0, -0.09, 0]} receiveShadow>
            <boxGeometry args={[cols + 0.6, 0.16, rows + 0.6]} />
            <meshStandardMaterial color="#5a3a24" roughness={0.85} />
          </mesh>

          {tokens.map((t) => {
            const span = SIZE_CELLS[t.stats.size] ?? 1;
            const px = t.x - cols / 2 + span / 2;
            const pz = t.y - rows / 2 + span / 2;
            const isScenery = t.stats.kind === "cenario";
            const handlers = {
              onPointerDown: (e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                onSelect(t.id);
                if (canControl(t)) dragId.current = t.id;
              },
            };
            return isScenery ? (
              <SceneryMesh3D key={t.id} position={[px, 0, pz]} span={span} sceneryId={t.stats.sceneryId} color={t.color} {...handlers} />
            ) : (
              <TokenMesh3D
                key={t.id}
                position={[px, 0, pz]}
                token={t}
                span={span}
                selected={t.id === selected}
                activeTurn={t.id === activeTurnId}
                {...handlers}
              />
            );
          })}

          <OrbitControls
            makeDefault
            enablePan={false}
            minPolarAngle={0.35}
            maxPolarAngle={1.2}
            minDistance={maxSide * 0.45}
            maxDistance={maxSide * 1.9}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function GridLines({ cols, rows }: { cols: number; rows: number }) {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    for (let x = 0; x <= cols; x++) pts.push(x - cols / 2, 0, -rows / 2, x - cols / 2, 0, rows / 2);
    for (let y = 0; y <= rows; y++) pts.push(-cols / 2, 0, y - rows / 2, cols / 2, 0, y - rows / 2);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [cols, rows]);
  return (
    <lineSegments geometry={geometry} position={[0, 0.006, 0]}>
      <lineBasicMaterial color="#5a3a24" transparent opacity={0.4} />
    </lineSegments>
  );
}

function LabelSprite({ text, color = "#fbeed3" }: { text: string; color?: string }) {
  const tex = useLabelTexture(text, color);
  return (
    <mesh>
      <planeGeometry args={[0.46, 0.46]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

type MeshHandlers = { onPointerDown: (e: ThreeEvent<PointerEvent>) => void };

function TokenMesh3D({
  position,
  token: t,
  span,
  selected,
  activeTurn,
  onPointerDown,
}: { position: [number, number, number]; token: Token; span: number; selected: boolean; activeTurn: boolean } & MeshHandlers) {
  const radius = span * 0.42;
  const hpPct = t.stats.hp_max > 0 ? Math.max(0, Math.min(1, t.stats.hp_current / t.stats.hp_max)) : 1;
  const barW = radius * 1.7;
  return (
    <group position={position} onPointerDown={onPointerDown}>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[radius * 1.08, radius * 1.3, 32]} />
          <meshBasicMaterial color="#e6c987" />
        </mesh>
      )}
      {activeTurn && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <ringGeometry args={[radius * 1.35, radius * 1.5, 32]} />
          <meshBasicMaterial color="#ffce8a" />
        </mesh>
      )}
      <mesh castShadow position={[0, 0.13, 0]}>
        <cylinderGeometry args={[radius, radius * 1.08, 0.26, 28]} />
        <meshStandardMaterial color={t.color} roughness={0.55} />
      </mesh>
      <Billboard position={[0, 0.52, 0]}>
        <LabelSprite text={initials(t.label)} />
      </Billboard>
      {t.stats.hp_max > 0 && (
        <Billboard position={[0, 0.78, 0]}>
          <mesh>
            <planeGeometry args={[barW, 0.09]} />
            <meshBasicMaterial color="#1a1008" />
          </mesh>
          <mesh position={[-barW / 2 + (barW * hpPct) / 2, 0, 0.001]}>
            <planeGeometry args={[Math.max(0.001, barW * hpPct), 0.07]} />
            <meshBasicMaterial color={hpPct <= 0.25 ? "#c0432a" : hpPct <= 0.6 ? "#c99a2a" : "#4c7a36"} />
          </mesh>
        </Billboard>
      )}
    </group>
  );
}

function SceneryMesh3D({
  position,
  span,
  sceneryId,
  color,
  onPointerDown,
}: { position: [number, number, number]; span: number; sceneryId?: string; color: string } & MeshHandlers) {
  const def = findScenery(sceneryId);
  const cat = def?.category ?? "estruturas";
  const [x, , z] = position;

  if (cat === "fogo")
    return (
      <group position={[x, 0, z]} onPointerDown={onPointerDown}>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 0.14, 12]} />
          <meshStandardMaterial color="#3a2a1c" />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.14, 0.4, 10]} />
          <meshStandardMaterial color="#e6862a" emissive="#e6862a" emissiveIntensity={1.1} />
        </mesh>
        <pointLight position={[0, 0.4, 0]} color="#ffae52" intensity={1.1} distance={3} />
      </group>
    );

  if (sceneryId === "arvore" || sceneryId === "arbusto") {
    const s = sceneryId === "arbusto" ? 0.6 : 1;
    return (
      <group position={[x, 0, z]} onPointerDown={onPointerDown}>
        <mesh castShadow position={[0, 0.22 * s, 0]}>
          <cylinderGeometry args={[0.07 * s, 0.09 * s, 0.44 * s, 8]} />
          <meshStandardMaterial color="#5a3a24" />
        </mesh>
        <mesh castShadow position={[0, 0.65 * s, 0]}>
          <coneGeometry args={[0.42 * s, 0.75 * s, 10]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      </group>
    );
  }
  if (sceneryId === "rocha" || sceneryId === "montanha") {
    const s = sceneryId === "montanha" ? 1.7 : 0.75;
    return (
      <mesh castShadow position={[x, 0.3 * s, z]} onPointerDown={onPointerDown} rotation={[0.3, 0.4, 0.1]}>
        <dodecahedronGeometry args={[0.38 * s, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={1} />
      </mesh>
    );
  }
  if (cat === "perigos" || sceneryId === "desfiladeiro") {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.015, z]} onPointerDown={onPointerDown}>
        <circleGeometry args={[0.46 * span, 20]} />
        <meshStandardMaterial color={sceneryId === "desfiladeiro" ? "#120b06" : color} />
      </mesh>
    );
  }
  if (cat === "mobilia") {
    return (
      <mesh castShadow position={[x, 0.27, z]} onPointerDown={onPointerDown}>
        <boxGeometry args={[0.78 * span, 0.5, 0.78 * span]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    );
  }
  // estruturas (paredes, portas, estantes, cercas)
  return (
    <mesh castShadow receiveShadow position={[x, 0.5, z]} onPointerDown={onPointerDown}>
      <boxGeometry args={[0.92 * span, 1, 0.92 * span]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}
