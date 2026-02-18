import { Timer } from 'three';

const timer = new Timer();

class Loop {
  constructor(camera, scene, renderer, renderPipeline = null) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.renderPipeline = renderPipeline;
    this.updatables = [];
  }

  start() {
    this.renderer.setAnimationLoop((timestamp) => {
      // update the timer before performing any queries
      timer.update(timestamp);

      // tell every animated object to tick forward one frame
      this.tick();

      // render a frame using WebGPU render pipeline
      if (this.renderPipeline) {
        this.renderPipeline.render();
      } else {
        // Fallback to direct renderer render for WebGPU
        this.renderer.render(this.scene, this.camera);
      }

    });
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  tick() {
    // get the time delta from the timer
    const delta = timer.getDelta();

    // console.log(
    //   `The last frame rendered in ${delta * 1000} milliseconds`,
    // );

    for (const object of this.updatables) {
      object.tick(delta);
    }
  }
}

export { Loop }
