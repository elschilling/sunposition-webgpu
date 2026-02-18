# WebGPU Renderer Refresh & Fixes

This plan handles the latest deprecation warnings and runtime errors discovered after the Three.js r183 update.

## User Review Required

> [!IMPORTANT]
> `PostProcessing` has been renamed to `RenderPipeline` in Three.js v0.183.0. This is a breaking change for the API naming, although the functionality remains the same.

## Proposed Changes

### Core Systems

#### [MODIFY] [PostProcessing.js](file:///home/indo/github/sunposition-webgpu/src/World/systems/PostProcessing.js)
- Import `RenderPipeline` instead of `PostProcessing` from `three/webgpu`.
- Update the class instantiation.

#### [MODIFY] [World.js](file:///home/indo/github/sunposition-webgpu/src/World/World.js)
- Fix `cameraControl` ReferenceError by defining the control object before passing it to `createGUI`.
- The `cameraControl` object should handle switching between `birdCamera` and `firstPersonCamera`.

#### [MODIFY] [gui.js](file:///home/indo/github/sunposition-webgpu/src/World/systems/gui.js)
- Update parameter naming if necessary to match the new `RenderPipeline` structure.

#### [MODIFY] [DynamicSky.js](file:///home/indo/github/sunposition-webgpu/src/World/systems/DynamicSky.js)
- Import `SkyMesh` instead of `Sky` from `three/addons/objects/SkyMesh.js`.
- Update initialization to use `new SkyMesh()`.
- Update uniform access in `tick()` to use the new `UniformNode` API (e.g., `sky.turbidity.value` instead of `sky.material.uniforms.turbidity.value`).

#### [MODIFY] [SunPath.js](file:///home/indo/github/sunposition-webgpu/src/World/systems/SunPath.js)
- Import `Line` instead of `LineLoop` from `three`.
- Update `drawAnalemmas` and `drawSunDayPath` to use `Line`.
- Manually close the loops by appending the first vertex to the end of the vertex array.

#### [MODIFY] [Loop.js](file:///home/indo/github/sunposition-webgpu/src/World/systems/Loop.js) & [Resizer.js](file:///home/indo/github/sunposition-webgpu/src/World/systems/Resizer.js)
- Update variable names from `postProcessing` to `renderPipeline` for consistency (optional but recommended for clarity).

## Verification Plan

### Automated Tests
- `npm run dev` to check for console warnings and errors.

### Manual Verification
- Verify camera switching works in the GUI.
- Verify SSGI controls still work.
