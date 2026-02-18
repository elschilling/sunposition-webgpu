const setSize = (container, camera, renderer, renderPipeline = null) => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  if (renderPipeline) {
    renderPipeline.updateSize(container.clientWidth, container.clientHeight);
  }
};

class Resizer {
  constructor(container, camera, renderer, renderPipeline = null) {
    this.container = container
    this.camera = camera
    this.renderer = renderer
    this.renderPipeline = renderPipeline
    // set initial size on load
    setSize(container, camera, renderer, renderPipeline);

    window.addEventListener('resize', () => {
      // set the size again if a resize occurs
      // setSize(container, this.camera, renderer);
      // perform any custom actions
      this.onResize();
    });
  }

  onResize() {
    setSize(this.container, this.camera, this.renderer, this.renderPipeline);
  }
}

export { Resizer };
