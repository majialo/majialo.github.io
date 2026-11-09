/*
作者: imsyy
主页：https://www.imsyy.top/
GitHub：https://github.com/imsyy/home
版权所有，请勿删除
*/

// 背景与模糊设置由此文件统一管理，不依赖 jQuery 或提示库。
(function () {
  const DEFAULT_BACKGROUND = "./img/background.webp";
  const LOCAL_BACKGROUNDS = [
    DEFAULT_BACKGROUND,
    "./img/background1.webp",
    "./img/background2.webp",
    "./img/background3.webp",
  ];
  const ONLINE_BACKGROUNDS = {
    "2": "https://api.dujin.org/bing/1920.php",
    "3": "https://api.btstu.cn/sjbz/api.php?lx=fengjing&format=images",
    "4": "https://www.dmoe.cc/random.php",
  };
  const WALLPAPER_TYPES = ["1", "2", "3", "4"];
  const BLUR_LEVELS = [
    { base: "4px", soft: "2px", strong: "8px" },
    { base: "10px", soft: "5px", strong: "20px" },
    { base: "16px", soft: "8px", strong: "28px" },
  ];
  const BLUR_LABELS = ["低", "中", "高"];
  let wallpaper;
  let blurLevel;
  let wallpaperRequest = 0;

  function normalizeWallpaper(value) {
    const saved = value && typeof value === "object" ? value : {};
    const legacyIndex = LOCAL_BACKGROUNDS.indexOf(saved[1]);
    return {
      type: WALLPAPER_TYPES.includes(String(saved.type)) ? String(saved.type) : "1",
      localIndex: Number.isInteger(saved.localIndex) && saved.localIndex >= 0 &&
        saved.localIndex < LOCAL_BACKGROUNDS.length ? saved.localIndex : Math.max(0, legacyIndex),
    };
  }

  function readWallpaper() {
    try {
      const saved = JSON.parse(localStorage.getItem("wallpaperSettings"));
      if (saved && typeof saved === "object") {
        return normalizeWallpaper(saved);
      }
    } catch (error) {}
    // 兼容以前通过 js.cookie 保存的设置；坏 Cookie 不会中断初始化。
    try {
      const cookie = document.cookie.split(";").map((part) => part.trim())
        .find((part) => part.startsWith("bg_img="));
      if (cookie) {
        return normalizeWallpaper(JSON.parse(decodeURIComponent(cookie.slice(7))));
      }
    } catch (error) {}
    return normalizeWallpaper(null);
  }

  function saveWallpaper() {
    try {
      localStorage.setItem("wallpaperSettings", JSON.stringify(wallpaper));
    } catch (error) {}
    // 存储被限制时尽量用 Cookie 保存，同时同步旧版 Cookie。
    try {
      const legacy = { type: wallpaper.type, 1: LOCAL_BACKGROUNDS[wallpaper.localIndex] };
      document.cookie = `bg_img=${encodeURIComponent(JSON.stringify(legacy))}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch (error) {}
  }

  function toast(message, icon) {
    if (window.iziToast && typeof window.iziToast.show === "function") {
      window.iziToast.show({ timeout: 2000, icon, message });
    }
  }

  function loadImage(url) {
    return new Promise((resolve) => {
      const image = new Image();
      const timer = setTimeout(() => finish(false), 8000);
      function finish(success) {
        clearTimeout(timer);
        image.onload = null;
        image.onerror = null;
        resolve(success);
      }
      image.onload = () => finish(image.naturalWidth > 0);
      image.onerror = () => finish(false);
      image.referrerPolicy = "no-referrer";
      image.src = url;
    });
  }

  function applyWallpaper(notify) {
    const request = ++wallpaperRequest;
    const selection = { ...wallpaper };
    const url = selection.type === "1" ? LOCAL_BACKGROUNDS[selection.localIndex] :
      ONLINE_BACKGROUNDS[selection.type];
    const status = document.getElementById("wallpaper-status");
    document.querySelectorAll("input[name='wallpaper-type']").forEach((input) => {
      input.checked = input.value === selection.type;
    });
    if (status) {
      status.textContent = "正在加载壁纸…";
    }
    return loadImage(url).then((loaded) => {
      // 快速切换时，较早的请求不能覆盖最新选择。
      if (request !== wallpaperRequest) {
        return;
      }
      document.body.style.backgroundImage = `url("${loaded ? url : DEFAULT_BACKGROUND}")`;
      document.body.dataset.wallpaperMode = loaded ? selection.type : "fallback";
      const message = loaded ? (selection.type === "1" ?
        "已使用本地壁纸，可通过图片按钮切换；设置已保存。" : "在线壁纸已加载，设置已保存。") :
        "壁纸加载失败，已使用本地默认壁纸。";
      if (status) {
        status.textContent = message;
      }
      if (notify) {
        toast(message, "fa-solid fa-image");
      }
    });
  }

  function selectWallpaper(type) {
    if (!WALLPAPER_TYPES.includes(type)) {
      return;
    }
    wallpaper.type = type;
    saveWallpaper();
    applyWallpaper(true);
  }

  function readBlurLevel() {
    try {
      const saved = localStorage.getItem("blurLevel");
      const index = saved === null || saved.trim() === "" ? 1 : Number(saved);
      return Number.isInteger(index) && index >= 0 && index < BLUR_LEVELS.length ? index : 1;
    } catch (error) {
      return 1;
    }
  }

  function applyBlurLevel(notify) {
    const root = document.documentElement;
    const level = BLUR_LEVELS[blurLevel];
    root.style.setProperty("--glass-blur", level.base);
    root.style.setProperty("--glass-blur-soft", level.soft);
    root.style.setProperty("--glass-blur-strong", level.strong);
    root.dataset.blurLevel = String(blurLevel);
    const label = BLUR_LABELS[blurLevel];
    const value = document.getElementById("blur-level");
    const button = document.getElementById("blur-toggle");
    if (value) {
      value.textContent = label;
    }
    if (button) {
      button.title = `卡片模糊强度：${label}，点击切换`;
      button.setAttribute("aria-label", button.title);
    }
    try {
      localStorage.setItem("blurLevel", String(blurLevel));
    } catch (error) {}
    if (notify) {
      toast(`卡片模糊强度：${label}`, "fa-solid fa-droplet");
    }
  }

  function openWallpaperPanel(event) {
    event.preventDefault();
    document.getElementById("box").style.display = "block";
    document.getElementById("row").style.display = "none";
    document.getElementById("more").style.setProperty("display", "none", "important");
    document.querySelectorAll("#accordion .accordion-collapse").forEach((panel) => {
      panel.classList.toggle("show", panel.id === "collapseOne");
    });
    document.querySelectorAll("#accordion .accordion-button").forEach((button) => {
      const expanded = button.getAttribute("aria-controls") === "collapseOne";
      button.classList.toggle("collapsed", !expanded);
      button.setAttribute("aria-expanded", String(expanded));
    });
  }

  function init() {
    wallpaper = readWallpaper();
    blurLevel = readBlurLevel();
    saveWallpaper();
    applyWallpaper(false);
    applyBlurLevel(false);
    document.getElementById("bg-toggle").addEventListener("click", () => {
      wallpaper.type = "1";
      wallpaper.localIndex = (wallpaper.localIndex + 1) % LOCAL_BACKGROUNDS.length;
      saveWallpaper();
      applyWallpaper(true);
    });
    document.getElementById("blur-toggle").addEventListener("click", () => {
      // 用内存状态循环，localStorage 不可写时也能连续切换。
      blurLevel = (blurLevel + 1) % BLUR_LEVELS.length;
      applyBlurLevel(true);
    });
    document.querySelectorAll("input[name='wallpaper-type']").forEach((input) => {
      input.addEventListener("change", () => selectWallpaper(input.value));
    });
    document.getElementById("wallpaper-settings").addEventListener("click", openWallpaperPanel);
    document.getElementById("closemore").addEventListener("click", () => {
      document.getElementById("box").style.display = "none";
      document.getElementById("row").style.display = "flex";
      document.getElementById("more").style.display = "flex";
    });
    const hint = document.getElementById("link-text");
    document.querySelectorAll("#social .link").forEach((control) => {
      const showHint = () => {
        hint.textContent = control.id === "blur-toggle" ?
          `卡片模糊：${BLUR_LABELS[blurLevel]}` : control.id === "bg-toggle" ? "切换本地背景" : "选择语言";
      };
      control.addEventListener("mouseenter", showHint);
      control.addEventListener("focus", showHint);
      control.addEventListener("mouseleave", () => { hint.textContent = "一些简单的设置 : )"; });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
