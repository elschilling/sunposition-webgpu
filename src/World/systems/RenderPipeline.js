import { RenderPipeline, TSL } from 'three/webgpu'
import { ssgi } from 'three/addons/tsl/display/SSGINode.js'
import { denoise } from 'three/addons/tsl/display/DenoiseNode.js'

// Quality-focused default SSGI parameters for r183
const defaultSSGIParams = {
    radius: 4, // Reduced radius for better localized detail
    sliceCount: 2,
    stepCount: 8,
    aoIntensity: 1.0,
    giIntensity: 2.0, // Reduced from 10 to avoid over-brightening
    thickness: 1.0,
    useScreenSpaceSampling: true
}

function createRenderPipeline(scene, camera, renderer) {
    // Create the render pipeline handler
    const renderPipeline = new RenderPipeline(renderer)

    // Create scene pass with MRT for SSGI
    const scenePass = TSL.pass(scene, camera)
    scenePass.setMRT(TSL.mrt({
        output: TSL.output,
        normal: TSL.normalView
    }))

    const sceneColor = scenePass.getTextureNode('output')
    const sceneDepth = scenePass.getTextureNode('depth')
    const sceneNormal = scenePass.getTextureNode('normal')

    // Initialize SSGI node
    const ssgiNode = ssgi(
        scenePass,
        sceneDepth,
        sceneNormal,
        camera
    )

    // Disable temporal filtering as we aren't using TRAANode yet
    ssgiNode.useTemporalFiltering = false

    // Apply quality defaults to SSGI
    ssgiNode.radius.value = defaultSSGIParams.radius
    ssgiNode.sliceCount.value = defaultSSGIParams.sliceCount
    ssgiNode.stepCount.value = defaultSSGIParams.stepCount
    ssgiNode.aoIntensity.value = defaultSSGIParams.aoIntensity
    ssgiNode.giIntensity.value = defaultSSGIParams.giIntensity
    ssgiNode.thickness.value = defaultSSGIParams.thickness
    ssgiNode.useScreenSpaceSampling.value = defaultSSGIParams.useScreenSpaceSampling

    // Denoise the SSGI output (GI in rgb, AO in a)
    const denoisedSSGI = denoise(ssgiNode, sceneDepth, sceneNormal, camera)
    denoisedSSGI.lumaPhi.value = 5
    denoisedSSGI.depthPhi.value = 5
    denoisedSSGI.normalPhi.value = 5
    denoisedSSGI.radius.value = 4

    // Composite the result: Beauty * AO + GI
    // We also handle the background (sky) by checking depth
    const finalPass = TSL.Fn(() => {
        const beauty = sceneColor.toVar()
        const ssgiData = denoisedSSGI.toVar()
        const depth = sceneDepth.toVar()

        const color = TSL.property('vec3')

        TSL.If(depth.greaterThanEqual(1.0), () => {
            color.assign(beauty.rgb)
        }).Else(() => {
            // Apply SSGI: (Scene * AO) + GI
            color.assign(beauty.rgb.mul(ssgiData.a).add(ssgiData.rgb))
        })

        return TSL.vec4(color, 1.0)
    })()

    // Set the composed output
    renderPipeline.outputNode = finalPass

    return {
        renderPipeline,
        ssgiNode,
        scenePass,
        composer: null, // For compatibility with existing code

        updateSize(width, height) {
            renderer.setSize(width, height)
        },

        setCamera(newCamera) {
            // Update camera for both the pass and the SSGI node
            scenePass.camera = newCamera
            if (ssgiNode._camera) ssgiNode._camera = newCamera
        },

        render() {
            renderPipeline.render()
        },

        // Expose SSGI parameters for GUI
        params: { ...defaultSSGIParams }
    }
}

export { createRenderPipeline, defaultSSGIParams }
