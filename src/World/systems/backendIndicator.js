import { Color } from 'three'

function createBackendIndicator(renderer) {
    const indicator = document.createElement('div')
    indicator.id = 'backend-indicator'

    // Styling for a premium, subtle look
    Object.assign(indicator.style, {
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        padding: '8px 16px',
        borderRadius: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        pointerEvents: 'none',
        zIndex: '1000',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease'
    })

    const isWebGPU = renderer.backendType === 'webgpu'

    if (isWebGPU) {
        indicator.textContent = '🚀 WebGPU'
        indicator.style.background = 'rgba(0, 255, 128, 0.15)'
        indicator.style.color = '#00ff80'
        indicator.style.boxShadow = '0 0 10px rgba(0, 255, 128, 0.2)'
    } else {
        indicator.textContent = '⚠️ WebGL2 Fallback'
        indicator.style.background = 'rgba(255, 128, 0, 0.15)'
        indicator.style.color = '#ff8000'
        indicator.style.cursor = 'help'
        indicator.style.pointerEvents = 'auto'
        indicator.title = 'Brave/Linux users: If Vulkan glitches, try enabling "Ignore GPU blocklist" in chrome://flags.'
    }

    document.body.appendChild(indicator)

    return indicator
}

export { createBackendIndicator }
