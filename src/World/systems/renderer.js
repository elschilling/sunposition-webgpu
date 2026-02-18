import { WebGPURenderer } from 'three/webgpu'

async function createRenderer() {
  const renderer = new WebGPURenderer({
    antialias: true,
    forceWebGPU: true
  })

  // WebGPU renderer requires async initialization
  await renderer.init()

  // Enable shadow maps
  renderer.shadowMap.enabled = true

  // Set pixel ratio for better quality
  renderer.setPixelRatio(window.devicePixelRatio)

  return renderer
}

export { createRenderer }
