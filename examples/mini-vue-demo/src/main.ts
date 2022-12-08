import "./style.css";
import { createApp, createRenderer, h } from "mini-vue";
import App from "./components/App";

const rootContainer = document.querySelector("#app");
createApp(App).mount(rootContainer);

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
    // addChild 是 PIXI 提供的 API
    container.addChild(el);
  },
});

initCanvas();
