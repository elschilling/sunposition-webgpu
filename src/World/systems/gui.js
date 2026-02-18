import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'

function createGUI(params, ambientLight, sunLight, sunHelper, shadowCameraHelper, sunPath, controls, skyControl, cameraControl, renderPipeline = null) {
  const gui = new GUI()
  gui.close()

  const skyFolder = gui.addFolder('Sky')
  skyFolder.add(skyControl, 'turbidity', 0.0, 20.0, 0.1)
  skyFolder.add(skyControl, 'rayleigh', 0.0, 4, 0.001)
  skyFolder.add(skyControl, 'mieCoefficient', 0.0, 0.1, 0.001)
  skyFolder.add(skyControl, 'mieDirectionalG', 0.0, 1, 0.001)
  skyFolder.add(skyControl, 'exposure', 0, 10, 0.001)
  skyFolder.close()

  const lightFolder = gui.addFolder('Light')
  lightFolder.add(sunLight, 'intensity').min(0).max(10).name('Sun Intensity')
  lightFolder.add(sunLight, 'castShadow').name('Sun shadows')
  lightFolder.add(sunLight.shadow, 'bias', -0.01, 0, 0.00001).name('Shadow bias')
  lightFolder.add(sunHelper, 'visible').name('Sun Helper')
  lightFolder.add(shadowCameraHelper, 'visible').name('Shadow Helper')
  lightFolder.add(ambientLight, 'intensity').min(0).max(10).name('Ambient Intensity')
  lightFolder.close()

  const locationFolder = gui.addFolder('Location')
  locationFolder.add(params, 'latitude').onChange(() => sunPath.updateLocation())
  locationFolder.add(params, 'longitude').onChange(() => sunPath.updateLocation())
  locationFolder.add(params, 'northOffset').onChange(() => sunPath.updateNorth())
  locationFolder.close()


  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(controls, 'autoRotate')
  cameraFolder.add(cameraControl, 'firstPerson')
  cameraFolder.add(cameraControl, 'birdView')
  cameraFolder.close()

  const timeFolder = gui.addFolder('Time')
  timeFolder.add(params, 'minute', 0, 60, 1).onChange(() => sunPath.updateHour()).listen()
  timeFolder.add(params, 'hour', 0, 24, 1).onChange(() => sunPath.updateHour()).listen()
  timeFolder.add(params, 'day', 1, 30, 1).onChange(() => sunPath.updateMonth()).listen()
  timeFolder.add(params, 'month', 1, 12, 1).onChange(() => sunPath.updateMonth()).listen()
  timeFolder.add(params, 'animateTime')
  timeFolder.add(params, 'timeSpeed').min(0).max(10000).step(.1)
  timeFolder.close()

  const sunsurfaceFolder = gui.addFolder('Sun Surface')
  sunsurfaceFolder.add(params, 'showSunSurface').onChange(() => sunPath.updateLocation())
  sunsurfaceFolder.add(params, 'showAnalemmas').onChange(() => sunPath.updateLocation())
  sunsurfaceFolder.add(params, 'showSunDayPath').onChange(() => sunPath.updateLocation())
  sunsurfaceFolder.add(sunPath.sunPathLight.children[0].children[0], 'visible',).name('Sun Sphere')
  sunsurfaceFolder.add(sunPath.sunPathLight.children[1], 'visible',).name('Orientation')
  sunsurfaceFolder.close()

  // SSGI Controls for WebGPU SSGINode (r183)
  if (renderPipeline && renderPipeline.ssgiNode) {
    const ssgiFolder = gui.addFolder('SSGI (Screen Space Global Illumination)')
    const ssgiNode = renderPipeline.ssgiNode

    // Create a proxy object for SSGI parameters
    const ssgiParams = {
      enabled: true,
      radius: ssgiNode.radius.value,
      sliceCount: ssgiNode.sliceCount.value,
      stepCount: ssgiNode.stepCount.value,
      aoIntensity: ssgiNode.aoIntensity.value,
      giIntensity: ssgiNode.giIntensity.value,
      thickness: ssgiNode.thickness.value,
      useScreenSpaceSampling: ssgiNode.useScreenSpaceSampling.value
    }

    ssgiFolder.add(ssgiParams, 'enabled').name('Enabled').onChange((value) => {
      if (ssgiNode) {
        if (value) {
          ssgiNode.radius.value = ssgiParams.radius
        } else {
          ssgiNode.radius.value = 0
        }
      }
    })

    ssgiFolder.add(ssgiParams, 'radius').min(0).max(50).step(0.5).name('Radius').onChange((value) => {
      if (ssgiNode) ssgiNode.radius.value = value
    })

    ssgiFolder.add(ssgiParams, 'sliceCount').min(1).max(4).step(1).name('Slice Count').onChange((value) => {
      if (ssgiNode) ssgiNode.sliceCount.value = value
    })

    ssgiFolder.add(ssgiParams, 'stepCount').min(1).max(32).step(1).name('Step Count').onChange((value) => {
      if (ssgiNode) ssgiNode.stepCount.value = value
    })

    ssgiFolder.add(ssgiParams, 'aoIntensity').min(0).max(4).step(0.1).name('AO Intensity').onChange((value) => {
      if (ssgiNode) ssgiNode.aoIntensity.value = value
    })

    ssgiFolder.add(ssgiParams, 'giIntensity').min(0).max(100).step(1).name('GI Intensity').onChange((value) => {
      if (ssgiNode) ssgiNode.giIntensity.value = value
    })

    ssgiFolder.add(ssgiParams, 'thickness').min(0.01).max(10).step(0.01).name('Thickness').onChange((value) => {
      if (ssgiNode) ssgiNode.thickness.value = value
    })

    ssgiFolder.add(ssgiParams, 'useScreenSpaceSampling').name('Screen Space Sampling').onChange((value) => {
      if (ssgiNode) ssgiNode.useScreenSpaceSampling.value = value
    })

    ssgiFolder.close()
  }

  // skyFolder.hide()
  // lightFolder.hide()
  // locationFolder.hide()

  return gui
}

export { createGUI }
