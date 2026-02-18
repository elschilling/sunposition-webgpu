import { Vector3 } from 'three'
import { SkyMesh } from 'three/addons/objects/SkyMesh.js'

class DynamicSky {
  constructor(skyControl, sphereLight, renderer) {
    this.skyControl = skyControl
    this.sky = new SkyMesh()
    this.renderer = renderer
    this.sphereLight = sphereLight
    this.sky.scale.setScalar(450000)
  }

  tick() {
    let sunPosition = new Vector3().setFromMatrixPosition(this.sphereLight.matrixWorld)
    if (sunPosition.y < 0) {
      this.sphereLight.children[1].visible = false
    } else {
      this.sphereLight.children[1].visible = true
    }

    // SkyMesh uniforms are accessible as properties directly on the mesh (UniformNodes)
    this.sky.turbidity.value = this.skyControl.turbidity
    this.sky.rayleigh.value = this.skyControl.rayleigh
    this.sky.mieCoefficient.value = this.skyControl.mieCoefficient
    this.sky.mieDirectionalG.value = this.skyControl.mieDirectionalG
    this.sky.sunPosition.value.copy(sunPosition)

    this.renderer.toneMappingExposure = this.skyControl.exposure
  }
}

export { DynamicSky }