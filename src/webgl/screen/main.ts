import * as THREE from "three";
import DeltaTime from "../../DeltaTime";

import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

import { screenRenderEngine } from "./renderEngine";

const textColor = "#f99021";

export const initScreen = (
  renderer: THREE.WebGLRenderer
): [(deltaTime: number) => void, THREE.Material] => {
  const sceneRTT = new THREE.Scene();

  // Geometry
  const backGround = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 1, 1),
    new THREE.MeshBasicMaterial({ color: "red" })
  );
  backGround.position.set(0.5, -0.5, -0.01);

  /**
   * Fonts
   */

  type FontInfo = {
    font: undefined | Font;
    size: number;
    height: number;
    width: number;
    leading: number;
    tracking: number;
  };

  const publicPixelFont: FontInfo = (function () {
    let size = 0.04;
    let height = size;
    let width = size;
    let leading = height * 2;
    let tracking = width * 0.4;
    return { font: undefined, size, height, width, leading, tracking };
  })();

  const basisFont: FontInfo = (function () {
    const size = 0.05;
    const height = size;
    const width = size / 2;
    const leading = height * 1.5;
    const tracking = width * 0.2;
    return { font: undefined, size, height, width, leading, tracking };
  })();

  const fontLoader = new FontLoader();

  fontLoader.load("/fonts/public-pixel.json", (font) => {
    publicPixelFont.font = font;
    // fontLoader.load("/fonts/charybdis.json", (font) => {
    fontLoader.load("/fonts/basis33.json", (font) => {
      console.log("loaded");
      basisFont.font = font;
      // font = _font;
      console.log(font);
      let n: [number, number, any] | [number, number] = [0, 0];

      const ws = `root:~$ curl edwardh.io  Hi there,                I'm Edward                                        root:~$ cd /uni/2019     root:~/uni/2019$ `;

      // placeHTML(
      //   `
      //   root:~$ curl edwardh.io
      //   <br>
      //   Hi there,
      //   <br>
      //   I'm Edward
      //   <br>
      //   -Computer Scientist
      //   <br>
      //   -Designer
      //   <br>
      //   <br>
      //   root:~$ cd /uni/2019
      //   `
      // );
      placeStr("root:~$ curl edwardh.io", basisFont);
      placeLinebreak(basisFont);
      placeLinebreak(basisFont);
      // setSize(0.04);
      placeStr("Hi there,", publicPixelFont);
      placeLinebreak(publicPixelFont);
      placeStr("I'm Edward", publicPixelFont, true);
      placeLinebreak(publicPixelFont);
      placeStr("-Computer Scientist", publicPixelFont); // •
      placeLinebreak(publicPixelFont);
      placeStr("-Designer", publicPixelFont);
      placeLinebreak(basisFont);
      placeLinebreak(basisFont);
      placeStr("root:~$ cd /uni/2019", basisFont);
      placeLinebreak(basisFont);
      placeHTML(
        `My name is Edward Hinrichsen and I have recently completed a Bachelor of Science, majoring in Computing and Software Systems at the University of Melbourne. I have a passion for all things technology and design, from software engineering & machine learning to UI/UX & 3D graphics.`,
        basisFont
      );
      // placeStr("root:~/uni/2019$ ");

      window.addEventListener("keydown", (ev) => {
        // ev.key
        console.log(ev.key);
        if (ev.key == "Backspace") {
          delChar();
        } else if (ev.key == "Enter") {
          placeLinebreak(basisFont);
          placeStr("command not found", basisFont);
          placeLinebreak(basisFont);
          placeLinebreak(basisFont);
          placeStr("root:~/uni/2019$ ", basisFont);
        } else {
          caret.visible = true;
          // caret.position.x += 0.04;
          placeChar(ev.key, basisFont);
          // caret.position.set(n[0] + 0.02, -n[1] - 0.015, 0);
        }
      });
    });
  });


  const caret = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(basisFont.size, basisFont.size * 1.5),
    new THREE.MeshBasicMaterial({ color: textColor })
  );
  sceneRTT.add(caret);

  let caretTimeSinceUpdate = 1;
  function updateCaret() {
    let x = charNextLoc.x + basisFont.size / 2;
    let y = -charNextLoc.y - basisFont.size / 2.66666;
    if (x > 1.396) {
      y -= basisFont.leading;
      x = basisFont.size / 2;
    }
    caret.position.set(x, y, 0);
    caretTimeSinceUpdate = 0;
  }

  const chars: { char: THREE.Group; fixed: boolean }[] = [];
  const charNextLoc = {
    x: 0,
    y: 0,
  };

  function placeChar(
    char: string,
    font: FontInfo,
    fixed: boolean = false,
    highlight: boolean = false
  ) {
    let x = charNextLoc.x;
    let y = charNextLoc.y;

    if (font.width + x > 1.396) {
      y += font.leading;
      x = 0;
    }

    const charObj = new THREE.Group();
    // m.scale.y = height;hh
    charObj.position.x = x;
    charObj.position.y = -y;

    const textGeometry = new TextGeometry(char, {
      font: font.font as any,
      size: font.size,
      height: 0.0001,
      curveSegments: 12,
      bevelEnabled: false,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: textColor });
    const text = new THREE.Mesh(textGeometry, textMaterial);
    text.position.set(0, -font.height, -0.01);
    charObj.add(text);

    if (highlight) {
      const background = new THREE.Mesh(
        new THREE.PlaneGeometry(
          font.width + font.tracking * 2,
          font.height + font.leading / 2,
          1,
          1
        ),
        new THREE.MeshBasicMaterial({ color: textColor })
      );

      textMaterial.color.set("black");
      // background.position.x = 0.5;
      background.position.set(
        font.width / 2 + font.tracking / 2,
        -font.height / 2,
        -0.01
      );
      // background.scale.x = 0.05;
      charObj.add(background);
    }

    chars.push({ char: charObj, fixed: fixed });

    sceneRTT.add(charObj);

    charNextLoc.x = font.width + font.tracking + x;
    charNextLoc.y = y;

    updateCaret();

    // return [width + tracking + x, y, charObj];
  }

  function placeLinebreak(font: FontInfo) {
    charNextLoc.x = 0;
    charNextLoc.y += font.leading;
    updateCaret();
  }

  function placeStr(str: string, font: FontInfo, highlight: boolean = false) {
    for (let char of str) {
      placeChar(char, font, true, highlight);
    }
  }

  function placeHTML(html: string, font: FontInfo) {
    html = html.replace(/\n/g, "");
    html = html.replace(/\s+/g, " ");
    const text = html.split("<br>");
    console.log(text);
    for (let i = 0; i < text.length; i++) {
      text[i] = text[i].replace(/^\s+|\s+$/g, "");
      console.log(text[i]);
      placeStr(text[i], font);
      if (i < text.length - 1) {
        console.log("<br>");
        placeLinebreak(font);
      }
    }
  }

  function delChar() {
    const char = chars.pop();
    if (char) {
      if (!char.fixed) {
        sceneRTT.remove(char.char);
        charNextLoc.x = char.char.position.x;
        charNextLoc.y = -char.char.position.y;
      } else chars.push(char);
    }
    updateCaret();
  }

  const mouse = { x: 0, y: 0 };
  document.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  const clock = new THREE.Clock();
  let time = 0;
  let uProgress = 1.2;

  let newDeltaTime = 0;

  const [screenRender, noiseMat] = screenRenderEngine(renderer, sceneRTT);

  const tick = (deltaTime: number) => {
    // Update controls

    // console.log(time)
    const elapsedTime = clock.getElapsedTime();

    if (caretTimeSinceUpdate > 1 && Math.floor(elapsedTime * 2) % 2 == 0) {
      caret.visible = false;
    } else {
      caret.visible = true;
    }

    caretTimeSinceUpdate += deltaTime;
    // if (caretLastVisible != caret.visible) {
    //   lag.needUpdate = true;
    //   caret.position.y += -0.03
    // }
    // caretLastVisible = caret.visible

    // caret.position.y += -0.5 * deltaTime;

    // newDeltaTime += deltaTime;

    // if (wordsToAnm.length > 0) {
    //   if (wordsToAnm[0].word.scale.x < wordsToAnm[0].width)
    //     wordsToAnm[0].word.scale.x = 0.05 * Math.floor(time);
    //   else {
    // wordsToAnm.shift();
    //     time = 0;
    //   }
    // }

    screenRender(deltaTime);
  };

  // composer.readBuffer.texture.magFilter = THREE.NearestFilter;

  return [tick, noiseMat];
};
