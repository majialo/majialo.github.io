# Peter | MyIndex

个人主页 / 浏览器起始页，当前同步版本 **1.5.0**。

在线访问：[majialo.github.io](https://majialo.github.io/)。
基于 [imsyy/home 的 old 分支](https://github.com/imsyy/home/tree/old)修改，保留原作者 MIT 许可与署名。

## 当前功能

- Bing 搜索、常用网站导航、时间与天气、一言和音乐播放器。
- 统一的本地 / 在线壁纸设置，刷新后恢复选择；加载失败或超过 8 秒使用本地默认图。
- 低 / 中 / 高三档卡片模糊，按钮显示当前档位，保存到 localStorage。
- 移动端布局、加载动画和 PWA。
- 已删除三个未使用的个人社交入口，壁纸入口已接回设置面板。

## 运行与发布

这是可直接维护的 HTML、CSS、JavaScript 静态源码，没有 Hugo 或 npm 构建步骤。
**本站在本仓库根目录发布**，`index.html`、`css/`、`js/`、`img/` 均位于根目录。
`main` 分支提交后由已有 GitHub Actions 工作流自动发布到域名根地址，无须添加仓库名。

本地预览：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Start-Preview.ps1
```

或在本仓库根目录运行：

```powershell
python -B -m http.server 8000 --bind 127.0.0.1 --directory .
```

打开 http://127.0.0.1:8000 ，按 Ctrl+C 停止。页面的第三方功能需要相应服务可用。

## 主要文件

| 内容 | 文件 |
| --- | --- |
| 页面信息、导航和搜索 | `index.html` |
| 主样式与手机布局 | `css/style.css`、`css/mobile.css` |
| 背景、模糊强度、保存与失败回退 | `js/set.js` |
| 天气、时间、加载动画和一般面板交互 | `js/main.js` |
| 音乐与歌单 | `js/music.js` |
| 时间进度与问候 | `js/time.js` |
| PWA | `manifest.json`、`sw.js` |
| 发布流程 | `.github/workflows/static.yml` |

## 维护记录

- [本次同步记录](docs/GitHub同步记录.md)
- [修复原因与模糊对照图](docs/修复记录.md)
- [历史版本对照](docs/版本记录.md)
- [项目检查与待处理问题](docs/项目检查.md)
- [维护说明](docs/维护说明.md)
- [原始 README](docs/archive/README.original.md)
- [MIT 许可](LICENSE)

历史文档保留本地工作目录 `D:\1.5.0` 和 `chinese/` 的上下文。
本次同步将该目录下的站点内容映射到 GitHub 仓库根目录，沿用已有发布结构；
本地旧版本目录、远程既有提交与素材均保留。
