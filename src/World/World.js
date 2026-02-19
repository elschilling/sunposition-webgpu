import { loadHouse } from './components/house/house.js'
import { loadBirds } from './components/birds/birds.js'
import { createBirdCamera } from './components/birdCamera.js'
import { createFirstPersonCamera } from './components/firstPersonCamera.js'
import { createBase } from './components/base.js'
import { createLights } from './components/lights.js'
import { createScene } from './components/scene.js'
import { createDirectionalLightHelper, createShadowCameraHelper, createAxesHelper } from './components/helpers.js'
import { createSunSphere } from './components/sunSphere.js'

import { createGUI } from './systems/gui.js'
import { createControls } from './systems/controls.js'
import { createRenderer } from './systems/renderer.js'
import { createRenderPipeline } from './systems/RenderPipeline.js'
import { Resizer } from './systems/Resizer.js'
import { Loop } from './systems/Loop.js'
import { SunPath } from './systems/SunPath.js'
import { DynamicSky } from './systems/DynamicSky.js'
import { createPlayer } from './systems/player.js'

import gsap from 'gsap'

const params = {
  animateTime: true,
  showSunSurface: true,
  showAnalemmas: true,
  showSunDayPath: true,
  minute: new Date().getMinutes(),
  hour: new Date().getHours(),
  day: new Date().getDate(),
  month: new Date().getMonth() + 1,
  latitude: -23.029396,
  longitude: -46.974293,
  northOffset: 303,
  radius: 18,
  baseY: 0,
  timeSpeed: 100,
  shadowBias: -0.00037
}

const skyControl = {
  turbidity: 10,
  rayleigh: 0.425,
  mieCoefficient: 0.012,
  mieDirectionalG: 1,
  exposure: 2.3
}

let tl = gsap.timeline({ repeat: -1 })

let activeCamera, birdCamera, firstPersonCamera
let renderer, renderPipeline
let scene
let loop
let controls
let resizer

class World {
  constructor(container) {
    this.container = container
    this.initialized = false
  }

  async init() {
    // Initialize cameras
    birdCamera = createBirdCamera()
    firstPersonCamera = createFirstPersonCamera()
    activeCamera = birdCamera

    // Create scene
    scene = createScene()

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    // Initialize WebGPU renderer (async)
    renderer = await createRenderer()

    // Create render pipeline with SSGI
    renderPipeline = createRenderPipeline(scene, activeCamera, renderer, isMobile)

    // Setup render loop
    loop = new Loop(activeCamera, scene, renderer, renderPipeline)
    this.container.append(renderer.domElement)

    // Setup controls
    controls = createControls(activeCamera, renderer.domElement)

    // Setup lights
    const { ambientLight, sunLight } = createLights()
    sunLight.shadow.camera.top = params.radius
    sunLight.shadow.camera.bottom = - params.radius
    sunLight.shadow.camera.left = - params.radius
    sunLight.shadow.camera.right = params.radius
    sunLight.shadow.bias = params.shadowBias

    const sunSphere = createSunSphere()

    const base = createBase(params)
    const sunPath = new SunPath(params, sunSphere, sunLight, base)

    const sky = new DynamicSky(skyControl, sunPath.sphereLight, renderer)

    const sunHelper = createDirectionalLightHelper(sunLight)
    sunHelper.visible = true

    const sunShadowHelper = createShadowCameraHelper(sunLight)
    // const axesHelper = createAxesHelper(30)
    sunShadowHelper.visible = false

    loop.updatables.push(base, controls, sunPath, sky)

    scene.add(sky.sky)
    scene.add(ambientLight)
    scene.add(sunHelper)
    scene.add(sunShadowHelper)
    scene.add(sunPath.sunPathLight)

    // Setup camera controls for GUI
    const cameraControl = {
      firstPerson: () => {
        activeCamera = firstPersonCamera
        loop.camera = activeCamera
        resizer.camera = activeCamera
        controls.object = activeCamera
        renderPipeline.setCamera(activeCamera)
      },
      birdView: () => {
        activeCamera = birdCamera
        loop.camera = activeCamera
        resizer.camera = activeCamera
        controls.object = activeCamera
        renderPipeline.setCamera(activeCamera)
      }
    }

    this.gui = createGUI(params, ambientLight, sunLight, sunHelper, sunShadowHelper, sunPath, controls, skyControl, cameraControl, renderPipeline)
    resizer = new Resizer(this.container, activeCamera, renderer, renderPipeline)

    // Load models
    const { house } = await loadHouse()
    const birds = await loadBirds()
    for (var b = 0; b < birds.children.length; b++) {
      loop.updatables.push(birds.children[b])
    }
    scene.add(house, birds)
    tl.to(birds.position, { duration: 60, delay: 1, x: 100, z: 120 })
    const player = createPlayer(firstPersonCamera, house)
    loop.updatables.push(player)

    this.initialized = true
  }

  start() {
    if (!this.initialized) {
      console.warn('World not initialized. Call init() first.')
      return
    }
    loop.start()
  }

  stop() {
    loop.stop()
  }
}

export { World }
