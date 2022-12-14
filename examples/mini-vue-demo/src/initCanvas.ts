import { createRenderer, h } from "mini-vue";
const WIDTH = 500,
  HEIGHT = 500;
const initCanvas = () => {
  console.log(PIXI.Application, "PIXI");
  const app = new PIXI.Application({
    width: WIDTH,
    height: HEIGHT,
  });
  document.body.append(app.view);

  renderer
    .createApp({
      setup() {},
      render() {
        return h("rect", {});
      },
    })
    .mount(app.stage);
};

const renderer = createRenderer({
  createElement(type) {
    const drawRect = () => {
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0x92b4ec);
      graphics.drawRect(WIDTH / 2 - 50, HEIGHT / 2 - 50, 100, 100);
      graphics.endFill();

      return graphics;
    };

    switch (type) {
      case "rect":
        return drawRect();
      default:
        break;
    }
  },
  patchProp(el, key, value) {
    el[key] = value;
  },
  insert(el, container) {
    // addChild ζ― PIXI ζδΎη API
    container.addChild(el);
  },
});

initCanvas();
