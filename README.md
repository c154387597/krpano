## 基于 krpano 封装的 react 组件

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/c154387597/krpano/blob/main/LICENSE)
[![NPM version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/@kris7chan/krpano?style=flat-square
[npm-url]: https://www.npmjs.com/package/@kris7chan/krpano

[Demo](https://c154387597.github.io/krpano-demo)

## ✨ 特性

- 动态渲染场景和热点，无需生成 xml
- 支持 vtourskin 基本功能
- 使用 Typescript 开发，提供完整的类型定义文件

## 🖥 依赖

目前仅在 `v1.19pr13` 开发测试，`v1.20` 支持情况未知。
`v1.20` 新增了一些 api，例如可以动态添加 `include`，无需使用队列实现，后续迭代将会适配。

- krpano.js = 1.19pr13
- React >= 17

## 📦 安装

- 安装 npm 包

```bash
pnpm add @kris7chan/krpano
```

- 从[Krpano 官网](https://krpano.com/download/)下载 `Krpano@1.19pr13` 并解压得到 `krpano.js`，然后通过 `script` 标签引入，使`window.embedpano`函数可用

```html
<script src="krpano.js"></script>
```

## 🔨 使用方法

### 加载 xml

最基础的用法是通过 `Krpano` 组件的 `xml` 参数直接加载 krpano xml 文件。Krpano 组件会忠实的按照 xml 的配置来进行渲染。

**krpano.xml**

```xml
<krpano version="1.19" onstart="loadscene(scene2);">
  <scene name="scene2" title="scene2" onstart="" thumburl="/krpano/panos/scene2.tiles/thumb.jpg" lat="" lng="" heading="">
    <view hlookat="0.0" vlookat="0.0" fovtype="MFOV" fov="120" maxpixelzoom="2.0" fovmin="70" fovmax="140" limitview="auto" />

    <preview url="/krpano/panos/scene2.tiles/preview.jpg" />

    <image type="CUBE" multires="true" tilesize="512">
      <level tiledimagewidth="1024" tiledimageheight="1024">
        <cube url="/krpano/panos/scene2.tiles/%s/l1/%v/l1_%s_%v_%h.jpg" />
      </level>
    </image>
  </scene>
</krpano>
```

**App.tsx**

```tsx
ReactDOM.render(
  <Krpano className="App" xml="/krpano.xml" />,
  document.getElementById("app")
);
```

### 场景的展示及切换

> 为了简化实现和使用，krpano 的 image 标签的功能被合并到了 Scene 组件中。通过 Scene 组件的 images 属性可以指定场景展示的图片。

想要添加一个场景，需要使用 Scene 组件。
每个 Scene 组件代表一个场景，可以通过 Krpano 组件的 `currentScene` 来显示与切换当前展示的场景。

```tsx
const App = () => {
  return (
    <Krpano currentScene="scene1">
      <Scene
        name="scene1"
        previewUrl="/krpano/panos/scene1.tiles/preview.jpg"
        imageTagAttributes={{
          type: "cube",
          tileSize: 512,
          multires: true,
        }}
        images={[
          {
            tiledImageWidth: 1600,
            tiledImageHeight: 1600,
            url: "/krpano/panos/scene1.tiles/%s/l2/%v/l2_%s_%v_%h.jpg",
          },
          {
            tiledImageWidth: 768,
            tiledImageHeight: 768,
            url: "/krpano/panos/scene1.tiles/%s/l1/%v/l1_%s_%v_%h.jpg",
          },
        ]}
      >
        <View
          hlookat={0}
          vlookat={0}
          fovType="MFOV"
          fov={120}
          maxPixelZoom={2}
          fovMin={70}
          fovMax={140}
          limitView="auto"
        />
      </Scene>
    </Krpano>
  );
};
```

### 热点的使用

> 目前只支持图片热点

使用 `Hotspot` 组件可以轻松的渲染热点。同时 `Hotspot` 组件还支持一系列的回调设置。

```tsx
const App = () => {
  return (
    <Krpano currentScene="scene1">
      <Scene
        name="scene1"
        previewUrl="/krpano/panos/scene1.tiles/preview.jpg"
        imageTagAttributes={{
          type: "cube",
          tileSize: 512,
          multires: true,
        }}
        images={[
          {
            tiledImageWidth: 1600,
            tiledImageHeight: 1600,
            url: "/krpano/panos/scene1.tiles/%s/l2/%v/l2_%s_%v_%h.jpg",
          },
          {
            tiledImageWidth: 768,
            tiledImageHeight: 768,
            url: "/krpano/panos/scene1.tiles/%s/l1/%v/l1_%s_%v_%h.jpg",
          },
        ]}
      >
        <View
          hlookat={0}
          vlookat={0}
          fovType="MFOV"
          fov={120}
          maxPixelZoom={2}
          fovMin={70}
          fovMax={140}
          limitView="auto"
        />
        <HotSpot
          name="hotspot1"
          url="/images/guide.png"
          atv={3}
          ath={-27}
          scale={0.3}
          edge="top"
          distorted={true}
          onClick={() => {
            console.log("click hotsopt1");
          }}
        />
      </Scene>
    </Krpano>
  );
};
```

### webvr 的使用

在 `Krpano` 中添加 `webvrUrl` 属性，它会将你的 `webvr.xml` 地址通过 `Include` 标签引入。

```tsx
<Krpano currentScene="scene1" webvrUrl="/plugins/webvr.xml" />
```

### 使用暂未支持的功能

由于本项目刚开始开发，很多组件和功能都还没完善，如果有需要优先支持的功能可以提 issue。倘若急于使用，则可以在获取到 `KrpanoActionProxy` 后自行调用 krpano 功能。

## ❗️ 限制

- 一个页面同一时间仅展示一个 krpano 全景图。如果需要同时展示多个全景图，更轻量的方案会比较合适。
- React 组件暂时只实现了部分功能。
- `Include` 和 `Plugin` 不支持放在判断中，这些元素将作为 xml 加载期间的第一步进行解析。

## 🔗 链接

- [参考 @0xLLLLH/react-krpano](https://github.com/0xLLLLH/react-krpano)
- [Krpano 官方文档](https://krpano.com/docu/xml/)
- [示例项目仓库地址](https://github.com/c154387597/krpano-demo)
- [krpano 仓库地址](https://github.com/c154387597/krpano)
- [CHANGELOG](https://github.com/c154387597/krpano/CHANGELOG.md)
