---
title: "为OpenClaw配置网盘空间的最佳实践"
source_url: https://mp.weixin.qq.com/s/PGpkC04XfF7ilMDb9vOcNQ
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
source_type: wechat
provenance_state: extracted
sha256: ba9c4237eef0da7c1e18f023097375a5fd901ba985ff9f6517881e62ac69f472
---
---
<section powered-by="werss" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;text-align: center;line-height: 1.8;visibility: visible;'>
 <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;text-align: center;font-size: 17px;font-weight: 400;color: rgba(0, 0, 0, 0.9);line-height: 1.8;visibility: visible;">
  <img src="https://mmbiz.qpic.cn/sz_mmbiz_jpg/kN3t5R6pdz5ZsDlAVaPicicF9Kibo0ymiaUQTjvZD5v5h98bjYop94nvlNNQIqlvPRk9neDmia2vdaB9eCOuYia1zGib3ojnldaO5zl7KQLUVpOib7o/640?wx_fmt=jpeg&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=0" style="-webkit-tap-highlight-color: rgb(234, 120, 0); margin: 0px; padding: 0px; outline: 0px; max-width: 100%; vertical-align: bottom; width: 680px !important; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible !important; height: auto !important;"/>
 </section>
</section>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;text-align: center;line-height: 1.8;visibility: visible;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;visibility: visible;">
  <span style="color: rgb(234, 120, 0); font-weight: bold; visibility: visible;">
   这是2026年的第
  </span>
  <span style="font-size: 20px; color: rgb(0, 0, 0); font-weight: bold; visibility: visible;">
   12
  </span>
  <span style="color: rgb(234, 120, 0); font-weight: bold; visibility: visible;">
   篇文章
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 48px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;text-align: center;line-height: 1.8;visibility: visible;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;visibility: visible;">
  <span style="font-size: 14px; color: rgb(234, 120, 0); visibility: visible;">
   （ 本文阅读时间：20分钟 ）
  </span>
 </span>
</p>
<h1 data-layout-id="3" data-pm-slice="0 0 []" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 12px;padding: 0px;outline: 0px;font-weight: 500;font-size: 20px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;color: rgb(234, 120, 0);text-align: center;line-height: 1.8;visibility: visible;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;visibility: visible;">
  前言
 </span>
</h1>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px; visibility: visible;">
   网盘与相册服务（PDS）为 OpenClaw 提供云端文件存储能力。配置后，OpenClaw 可直接访问网盘文件作为任务素材，也可将生成的文档、图片、视频等保存到网盘供您下载使用。网盘支持多空间隔离和文件级权限管控，确保不同用户间的数据安全。
  </span>
 </span>
</p>
<h2 style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 8px;padding: 0px;outline: 0px;font-weight: 400;font-size: 16px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px; font-weight: bold; visibility: visible;">
   网盘在 OpenClaw 中的使用场景
  </span>
 </span>
</h2>
<ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;list-style-type: disc;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-bottom: 0px;padding: 0px;outline: 0px;max-width: 100%;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-bottom: 8px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="font-size: 15px; visibility: visible;">
     网盘为 OpenClaw 提供一个可挂载的工作空间，用户和 OpenClaw 能够像访问本地文件一样便捷地访问云端文件；
    </span>
   </span>
  </p>
 </li>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-bottom: 0px;padding: 0px;outline: 0px;max-width: 100%;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-bottom: 8px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="font-size: 15px; visibility: visible;">
     Web、PC、手机多端文件上传：支持本地文件快速上传至网盘，支持上百种主流格式的音视频、图片、文件预览和在线解压缩；
    </span>
   </span>
  </p>
 </li>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-bottom: 0px;padding: 0px;outline: 0px;max-width: 100%;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-bottom: 8px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="font-size: 15px; visibility: visible;">
     多空间隔离：不侵扰本地系统和操作权限，用户文件授权上传，不同空间实现权限管控；
    </span>
   </span>
  </p>
 </li>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-bottom: 0px;padding: 0px;outline: 0px;max-width: 100%;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-bottom: 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="font-size: 14px; visibility: visible;">
     禁止越权访问：支持文件级别的权限管理，不用担心 OpenClaw 越权访问和数据泄露。
    </span>
   </span>
  </p>
 </li>
</ul>
<h2 style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 8px;padding: 0px;outline: 0px;font-weight: 400;font-size: 16px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px; font-weight: bold; visibility: visible;">
   前提条件
  </span>
 </span>
</h2>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 48px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px; visibility: visible;">
   在开始配置前，请确认您已部署 OpenClaw 服务并可登录其所在服务器。
  </span>
 </span>
</p>
<h1 data-layout-id="5" data-pm-slice="0 0 []" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px; padding: 0px; outline: 0px; font-weight: 500; font-size: 20px; max-width: 100%; font-family: "PingFang SC", system-ui, -apple-system, system-ui, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: 0.544px; orphans: 2; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; color: rgb(234, 120, 0); text-align: center; line-height: 1.8; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px; padding: 0px; outline: 0px; max-width: 100%; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;">
  01
 </span>
</h1>
<h1 data-layout-id="6" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px 0px 24px; padding: 0px; outline: 0px; font-weight: 500; font-size: 20px; max-width: 100%; font-family: "PingFang SC", system-ui, -apple-system, system-ui, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: 0.544px; orphans: 2; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; color: rgb(234, 120, 0); text-align: center; line-height: 1.8; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px; padding: 0px; outline: 0px; max-width: 100%; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;">
  步骤一：开通并购买网盘
 </span>
</h1>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px; visibility: visible;">
   如果您已拥有网盘实例，可跳过此步骤。
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px; font-weight: bold; visibility: visible;">
   1.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px; font-weight: bold; visibility: visible;">
   开通网盘。
  </span>
  <span style="font-size: 15px; visibility: visible;">
   新用户可
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <a class="weapp_text_link js_weapp_entry wx_tap_link js_wx_tap_highlight" data-miniprogram-appid="wxe81de4a47ea1ab33" data-miniprogram-applink="" data-miniprogram-nickname="小外链" data-miniprogram-path="go?to=https%3A%2F%2Ffree.aliyun.com%2F%3FsearchKey%3Dpds" data-miniprogram-servicetype="0" data-miniprogram-type="text" data-unique-id="mn8bzwpg-nsto8z" href="" link-id="7855" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style="font-size: 15px; visibility: visible;">
    免费申领 PDS 试用
   </span>
  </a>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px; visibility: visible;">
   ，正式购买请参见
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <a class="weapp_text_link js_weapp_entry wx_tap_link js_wx_tap_highlight" data-miniprogram-appid="wxe81de4a47ea1ab33" data-miniprogram-applink="" data-miniprogram-nickname="小外链" data-miniprogram-path="go?to=https%3A%2F%2Fhelp.aliyun.com%2Fzh%2Fpds%2Fdrive-and-photo-service-ent%2Fgetting-started%2Factivate-drive-and-photo-service-enterprise-edition-and-purchase-instances" data-miniprogram-servicetype="0" data-miniprogram-type="text" data-unique-id="mn8c1aog-myx5gv" href="" link-id="18f1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style="font-size: 15px; visibility: visible;">
    开通与购买
   </span>
  </a>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px; visibility: visible;">
   。了解购买规格说明：
  </span>
 </span>
</p>
<ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;list-style-type: circle;visibility: visible;'>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;visibility: visible;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;visibility: visible;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="font-size: 15px; visibility: visible;">
     用户数：网盘支持 5~1000 用户数购买规格。例如购买 5 人 200 GB 规格的网盘，则该网盘最多支持 5 人共享使用 200 GB 空间。
    </span>
   </span>
  </p>
 </li>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px; padding: 0px; outline: 0px; max-width: 100%; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px 0px 24px; padding: 0px; outline: 0px; max-width: 100%; clear: both; min-height: 1em; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; color: rgba(0, 0, 0, 0.9); font-size: 17px; font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; line-height: 1.6; letter-spacing: 0.034em; font-style: normal; font-weight: normal; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
    <span style="font-size: 15px; visibility: visible;">
     付费方式：按包年包月计费。网盘到期后请及时在控制台续费，详情请参见
    </span>
   </span>
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; color: rgba(0, 0, 0, 0.9); font-size: 17px; font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; line-height: 1.6; letter-spacing: 0.034em; font-style: normal; font-weight: normal; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
    <a class="weapp_text_link js_weapp_entry wx_tap_link js_wx_tap_highlight" data-miniprogram-appid="wxe81de4a47ea1ab33" data-miniprogram-applink="" data-miniprogram-nickname="小外链" data-miniprogram-path="go?to=https%3A%2F%2Fhelp.aliyun.com%2Fzh%2Fpds%2Fdrive-and-photo-service-ent%2Foverdue-payment-renewal-resource-plan-upgrade-and-unsubscription" data-miniprogram-servicetype="0" data-miniprogram-type="text" data-unique-id="mn8c2iyc-8s2f8r" href="" link-id="2ade" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px; padding: 0px; outline: 0px; color: rgb(87, 107, 149); text-decoration: none; -webkit-user-drag: none; cursor: default; max-width: 100%; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;">
     <span style="font-size: 15px; visibility: visible;">
      续费、升级、退订、欠费、到期、降配
     </span>
    </a>
   </span>
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; color: rgba(0, 0, 0, 0.9); font-size: 17px; font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; line-height: 1.6; letter-spacing: 0.034em; font-style: normal; font-weight: normal; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
    <span style="font-size: 15px; visibility: visible;">
     。
    </span>
   </span>
  </p>
 </li>
</ul>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px 0px 24px; padding: 0px; outline: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgba(0, 0, 0, 0.9); font-family: "PingFang SC", system-ui, -apple-system, system-ui, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 17px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: 0.544px; orphans: 2; text-align: justify; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; color: rgba(0, 0, 0, 0.9); font-size: 17px; font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; line-height: 1.6; letter-spacing: 0.034em; font-style: normal; font-weight: normal; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
  <span style="font-size: 15px; font-weight: bold; visibility: visible;">
   2.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; color: rgba(0, 0, 0, 0.9); font-size: 17px; font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; line-height: 1.6; letter-spacing: 0.034em; font-style: normal; font-weight: normal; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
  <span style="font-size: 15px; font-weight: bold; visibility: visible;">
   购买完成后，在控制台将自己绑定为超级管理员。
  </span>
 </span>
</p>
<ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px; padding: 0px 0px 0px 1.6em; outline: 0px; max-width: 100%; color: rgba(0, 0, 0, 0.9); font-family: "PingFang SC", system-ui, -apple-system, system-ui, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 17px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: 0.544px; orphans: 2; text-align: justify; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; list-style-type: circle; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px; padding: 0px; outline: 0px; max-width: 100%; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px 0px 24px; padding: 0px; outline: 0px; max-width: 100%; clear: both; min-height: 1em; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; color: rgba(0, 0, 0, 0.9); font-size: 17px; font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; line-height: 1.6; letter-spacing: 0.034em; font-style: normal; font-weight: normal; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
    <span style="font-size: 15px; visibility: visible;">
     使用超级管理员进行后续的登录授权，授权后您的 OpenClaw 会拥有和登录身份一致的相关权限，超级管理员具备最高权限。
    </span>
   </span>
  </p>
 </li>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px; padding: 0px; outline: 0px; max-width: 100%; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px 0px 24px; padding: 0px; outline: 0px; max-width: 100%; clear: both; min-height: 1em; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; color: rgba(0, 0, 0, 0.9); font-size: 17px; font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; line-height: 1.6; letter-spacing: 0.034em; font-style: normal; font-weight: normal; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
    <span style="font-size: 15px; visibility: visible;">
     如果不希望 OpenClaw 拥有最高权限，可创建一个新的网盘用户，将该用户的权限配置为基础的预览/上传/下载权限，使用新用户登录授权后，即可与此用户权限保持一致。
    </span>
   </span>
  </p>
 </li>
</ul>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px 0px 48px; padding: 0px; outline: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgba(0, 0, 0, 0.9); font-family: "PingFang SC", system-ui, -apple-system, system-ui, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 17px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: 0.544px; orphans: 2; text-align: justify; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; font-family: "Times New Roman"; font-variant-ligatures: normal; font-variant-caps: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; font-variant-emoji: normal; text-transform: none; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
  <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;">
   <img src="https://mmbiz.qpic.cn/sz_mmbiz_png/PrTAevAztZlfoXkrUXCjHtghicmp40dlZwos82xp9gMk00hLnxPueRvuDMfVXexCcPCpFusia0aMbZncms56kZvn2HxaQCy0VKBauXZLFHNhs/640?wx_fmt=png&amp;wxfrom=5&amp;wx_lazy=1&amp;tp=webp#imgIndex=2" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; vertical-align: bottom; width: 680px !important; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible !important; height: auto !important;"/>
  </span>
 </span>
</p>
<h1 data-layout-id="5" data-pm-slice="2 2 []" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px; padding: 0px; outline: 0px; font-weight: 500; font-size: 20px; max-width: 100%; font-family: "PingFang SC", system-ui, -apple-system, system-ui, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: 0.544px; orphans: 2; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; color: rgb(234, 120, 0); text-align: center; line-height: 1.8; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;">
  02
 </span>
</h1>
<h1 data-layout-id="6" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;font-weight: 500;font-size: 20px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;color: rgb(234, 120, 0);text-align: center;line-height: 1.8;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  步骤二：在 OpenClaw 中配置网盘
 </span>
</h1>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   1.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   配置方式：
  </span>
 </span>
</p>
<ol class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;list-style-type: lower-alpha;'>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="font-size: 15px;">
     方式一：登录 OpenClaw 部署所在的服务器，通过命令行方式进行以下操作安装
    </span>
   </span>
  </p>
 </li>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="font-size: 15px;">
     方式二：通过对话 OpenClaw ，让 OpenClaw 帮助你完成命令执行
    </span>
   </span>
  </p>
 </li>
</ol>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   2.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   执行以下命令下载并安装网盘插件：
  </span>
 </span>
</p>
<section powered-by="werss">
 <ul class="code-snippet__line-index code-snippet__js">
  <li>
  </li>
 </ul>
 <pre class="code-snippet__js" data-lang="nginx"><code><span><span>curl</span> -fsSL <span>"https://statics.aliyunpds.com/download/openclaw-pds/install_openclaw_pds.sh"</span> | bash</span></code></pre>
</section>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;'>
  <br/>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   3.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   执行以下命令登录网盘。将
  </span>
  <span style="font-size: 15px;">
  </span>
 </span>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;font-size: 12pt;font-family: 微软雅黑;font-variant: normal;text-transform: none;color: rgb(119, 119, 119);background: rgb(245, 245, 245);box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   &lt;domain_id&gt;
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
  </span>
  <span style="font-size: 15px;font-weight: bold;">
   替换为您网盘的唯一 ID。
  </span>
 </span>
</p>
<section powered-by="werss">
 <ul class="code-snippet__line-index code-snippet__js">
  <li>
  </li>
 </ul>
 <pre class="code-snippet__js" data-lang="xml"><code><span>openclaw pds login <span>&lt;</span><span><span>domain_id</span></span><span>&gt;</span></span></code></pre>
</section>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "Times New Roman";font-variant: normal;text-transform: none;'>
  <domain_id style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  </domain_id>
 </span>
</p>
<blockquote style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 1em 0px;padding: 4px 0px 0px 10px;outline: 0px;border-left: 3px solid rgb(219, 219, 219);color: rgba(0, 0, 0, 0.55);font-size: 15px;text-indent: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;'>
 <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   说明：domain_id 可在 PDS 控制台获取，如下图所示。例如您的 domain_id 为 bj1506，则执行 openclaw pds login bj1506。
  </span>
 </p>
</blockquote>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;font-family: "Times New Roman";font-variant: normal;text-transform: none;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <img src="https://mmbiz.qpic.cn/mmbiz_png/PrTAevAztZnjRZMlT6KaH2om3mKOSGeewjaZtk4lInzbHScibh4TxskcYHUlIpYrrIy6kac4IxdsQhNNH1fCoT7R1BkW6b3SvS9siaVTCuSuI/640?wx_fmt=png&amp;wxfrom=5&amp;wx_lazy=1&amp;tp=webp#imgIndex=4" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; vertical-align: bottom; width: 680px !important; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible !important; height: auto !important;"/>
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   4.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   在浏览器中打开返回的链接进行认证，或使用浏览器扫码登录授权。
  </span>
  <span style="font-size: 15px;">
   输入绑定的超级管理员手机号完成验证。
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;font-family: "Times New Roman";font-variant: normal;text-transform: none;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <img src="https://mmbiz.qpic.cn/sz_mmbiz_png/PrTAevAztZnQBy8Scv4Xe1oUaMXfQc0TBBJdLsNIdEXJREzuia3R1WBv1ryZ7sEb9IicLO0MxYwzyLWBgZcAoM4c06nxnbDw3js7QD7Z71Ggk/640?wx_fmt=png&amp;wxfrom=5&amp;wx_lazy=1&amp;tp=webp#imgIndex=5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; vertical-align: bottom; width: 680px !important; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible !important; height: auto !important;"/>
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 48px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   5.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   登录成功后返回 OpenClaw，即可正常使用网盘 Skills。
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;'>
  <br/>
 </span>
</p>
<h1 data-layout-id="5" data-pm-slice="2 2 []" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;font-weight: 500;font-size: 20px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;color: rgb(234, 120, 0);text-align: center;line-height: 1.8;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  03
 </span>
</h1>
<h1 data-layout-id="6" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;font-weight: 500;font-size: 20px;max-width: 100%;font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;color: rgb(234, 120, 0);text-align: center;line-height: 1.8;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  步骤三：使用网盘 Skills
 </span>
</h1>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   配置完成后，您可以在 OpenClaw 中通过自然语言指令使用以下网盘能力。
  </span>
 </span>
</p>
<h3 style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;font-weight: 400;font-size: 16px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 16px;font-weight: bold;">
   文件查询与分析
  </span>
 </span>
</h3>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   在对话中描述您的需求，OpenClaw 会自动检索网盘文件并进行分析，也可以将分析和处理后的文件上传到网盘指定目录。
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   示例——
  </span>
 </span>
</p>
<ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;list-style-type: disc;'>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px 21pt;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;text-indent: -21pt;text-align: justify;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="font-size: 15px;">
     我的网盘里有个视频，你总结一下视频里的内容。
    </span>
   </span>
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;font-family: "Times New Roman";font-variant: normal;text-transform: none;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     <br/>
    </span>
   </span>
  </p>
 </li>
</ul>
<section powered-by="werss" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;text-align: center;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <img src="https://mmbiz.qpic.cn/mmbiz_png/PrTAevAztZlhYXKYzlFH475CZ8HB1RleTBSPr7wPGniblNVNe8uJ9anrTIUy5eibBjIP2GAHu2gOP2g1DNsH9gjSNHT8oMddTpSuGsMcxY0KQ/640?wx_fmt=png&amp;from=appmsg&amp;wxfrom=5&amp;wx_lazy=1&amp;tp=webp#imgIndex=7" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; vertical-align: bottom; width: 680px !important; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible !important; height: auto !important;"/>
</section>
<section powered-by="werss" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;'>
 <ul class="list-paddingleft-1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;list-style-type: disc;">
  <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <code data-type="inlineCode" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
      <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
       <span style="font-size: 15px;">
        帮我调研下主流 Agent 工具，将功能、特点、安装方式等信息汇总为一个文档，放到网盘的"技术调研"目录中。
       </span>
      </span>
     </span>
    </code>
   </p>
  </li>
 </ul>
</section>
<section powered-by="werss" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;text-align: center;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <img src="https://mmbiz.qpic.cn/sz_mmbiz_png/PrTAevAztZnUbyBP8fxvxicKY0gZYbEkXwdUIfSibSkvYib107XT1vfOpSTCP9nGSlGkjWgwmcdLuwoq3B5Ixkao3Y1sibcxO5IlJolxsj3icDkU/640?wx_fmt=png&amp;from=appmsg&amp;wxfrom=5&amp;wx_lazy=1&amp;tp=webp#imgIndex=8" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; vertical-align: bottom; width: 680px !important; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible !important; height: auto !important;"/>
</section>
<h3 style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;font-weight: 400;font-size: 16px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 16px;font-weight: bold;">
   多模态检索
  </span>
 </span>
</h3>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   支持通过自然语言进行文档和图片的检索。
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   示例——
  </span>
 </span>
</p>
<ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;list-style-type: disc;'>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px 21pt;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;text-indent: -21pt;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;text-indent: -21pt;text-align: left;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
     <span style="font-size: 15px;">
      帮我在网盘中找一下滑雪相关的图片。
     </span>
    </span>
   </span>
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;font-family: "Times New Roman";font-variant: normal;text-transform: none;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     <br/>
    </span>
   </span>
  </p>
 </li>
</ul>
<section powered-by="werss" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 48px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;text-align: center;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <img src="https://mmbiz.qpic.cn/mmbiz_png/PrTAevAztZnRr0wVBicUECJpp5Al3VREkyJbuj5aVJjaicmRFY2gyqr0D7QqNbb0JuokmLkSf7UzdmzTadu1IT6Bib8aiaRO4BqalTJj4dPl2SY/640?wx_fmt=png&amp;from=appmsg&amp;wxfrom=5&amp;wx_lazy=1&amp;tp=webp#imgIndex=9" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; vertical-align: bottom; width: 680px !important; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible !important; height: auto !important;"/>
</section>
<h1 data-layout-id="5" data-pm-slice="2 2 []" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;font-weight: 500;font-size: 20px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;color: rgb(234, 120, 0);text-align: center;line-height: 1.8;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  04
 </span>
</h1>
<h1 data-layout-id="6" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;font-weight: 500;font-size: 20px;max-width: 100%;font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;color: rgb(234, 120, 0);text-align: center;line-height: 1.8;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  步骤四（可选）：安装网盘客户端
 </span>
</h1>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   安装网盘客户端后，可以通过图形化界面管理云端文件，无需使用命令行。通过客户端上传的文件同样可被 OpenClaw 访问和分析。
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   1.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   在网盘控制台配置页面，单击
  </span>
  <span style="font-size: 15px;font-weight: bold;">
   STEP 2
  </span>
  <span style="font-size: 15px;">
   下载网盘客户端，根据您的操作系统下载对应安装包。
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;font-family: "Times New Roman";font-variant: normal;text-transform: none;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <img src="https://mmbiz.qpic.cn/mmbiz_png/PrTAevAztZkKTOzgsMgw8B3nYJg2zN4KlficoGwUVwJ828p2rPV6PKvmE4n99t3LLmN1p7rzKkCdA7WPzJSAIzicvDT3ON1hOXopH07R3BX7E/640?wx_fmt=png&amp;wxfrom=5&amp;wx_lazy=1&amp;tp=webp#imgIndex=11" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin-top: 0px; margin-right: 0px; margin-left: 0px; padding: 0px; outline: 0px; max-width: 100%; vertical-align: bottom; width: 680px !important; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible !important; height: auto !important;"/>
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   2.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   双击安装包，根据界面提示完成安装。
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   3.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   打开网盘客户端，完成登录验证。
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   4.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   上传本地文件至网盘。在文件列表页面，单击左上方的
  </span>
  <span style="font-size: 15px;font-weight: bold;">
   上传文件
  </span>
  <span style="font-size: 15px;">
   按钮。
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "Times New Roman";font-variant: normal;text-transform: none;'>
  <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <img src="https://mmbiz.qpic.cn/mmbiz_png/PrTAevAztZkH2HzvCYOr7jMbCBEM7f9PWjAHy39GzyWia7GruKKlUpmg4tEuljzvs6ZpKgzkPqMwbc2SvAU65XgicQzJZY1tv5MfqLhaqeDAo/640?wx_fmt=png&amp;wxfrom=5&amp;wx_lazy=1&amp;tp=webp#imgIndex=12" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px; padding: 0px; outline: 0px; max-width: 100%; vertical-align: bottom; width: 680px !important; box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible !important; height: auto !important;"/>
  </span>
 </span>
</p>
<table style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 10px;padding: 0px;outline: 0px;border-collapse: collapse;display: table;width: 677px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;'>
</table>
<table style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 10px;padding: 0px;outline: 0px;border-collapse: collapse;display: table;width: 677px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;'>
</table>
<section powered-by="werss" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;'>
 <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="font-size: 15px;">
     网盘客户端支持以下上传特性：
    </span>
   </span>
  </span>
 </p>
 <table style="-webkit-tap-highlight-color:rgba(0, 0, 0, 0);margin:0px 0px 10px;padding:0px;outline:0px;border-collapse:collapse;display:table;max-width:100%;box-sizing:border-box !important;overflow-wrap:break-word !important;table-layout:fixed;min-width:50px;">
  <tbody>
   <tr style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <td style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 4px 7px;outline: 0px;overflow-wrap: break-word;word-break: break-all;hyphens: auto;border: 1px solid rgb(216, 216, 216);max-width: 100%;box-sizing: border-box !important;overflow: hidden;background-color: rgb(229, 229, 229);vertical-align: top;">
     <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;text-align: left;text-indent: 0px;">
      <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;background-color: rgb(229, 229, 229);font-size: 10.5pt;color: rgb(24, 24, 24);letter-spacing: 0.15pt;">
       <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
        <span style="font-weight: bold;">
         特性
        </span>
       </span>
      </span>
     </p>
    </td>
    <td style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 4px 7px;outline: 0px;overflow-wrap: break-word;word-break: break-all;hyphens: auto;border: 1px solid rgb(216, 216, 216);max-width: 100%;box-sizing: border-box !important;overflow: hidden;background-color: rgb(229, 229, 229);vertical-align: top;">
     <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;text-align: left;text-indent: 0px;">
      <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;background-color: rgb(229, 229, 229);font-size: 10.5pt;color: rgb(24, 24, 24);letter-spacing: 0.15pt;">
       <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
        <span style="font-size: 15px;font-weight: bold;">
         说明
        </span>
       </span>
      </span>
     </p>
    </td>
   </tr>
   <tr style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <td style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 4px 7px;outline: 0px;overflow-wrap: break-word;word-break: break-all;hyphens: auto;border: 1px solid rgb(216, 216, 216);max-width: 100%;box-sizing: border-box !important;overflow: hidden;vertical-align: top;">
     <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;text-align: left;text-indent: 0px;">
      <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 10.5pt;color: rgb(24, 24, 24);letter-spacing: 0.15pt;">
       <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
        <span style="font-size: 15px;">
         文件秒传
        </span>
       </span>
      </span>
     </p>
    </td>
    <td style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 4px 7px;outline: 0px;overflow-wrap: break-word;word-break: break-all;hyphens: auto;border: 1px solid rgb(216, 216, 216);max-width: 100%;box-sizing: border-box !important;overflow: hidden;vertical-align: top;">
     <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;text-align: left;text-indent: 0px;">
      <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 10.5pt;color: rgb(24, 24, 24);letter-spacing: 0.15pt;">
       <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
        <span style="font-size: 15px;">
         同一网盘中已存在相同内容的文件时，再次上传将直接秒传，无需等待完整上传。
        </span>
       </span>
      </span>
     </p>
    </td>
   </tr>
   <tr style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <td style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 4px 7px;outline: 0px;overflow-wrap: break-word;word-break: break-all;hyphens: auto;border: 1px solid rgb(216, 216, 216);max-width: 100%;box-sizing: border-box !important;overflow: hidden;vertical-align: top;">
     <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;text-align: left;text-indent: 0px;">
      <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 10.5pt;color: rgb(24, 24, 24);letter-spacing: 0.15pt;">
       <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
        <span style="font-size: 15px;">
         多文件并发上传
        </span>
       </span>
      </span>
     </p>
    </td>
    <td style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 4px 7px;outline: 0px;overflow-wrap: break-word;word-break: break-all;hyphens: auto;border: 1px solid rgb(216, 216, 216);max-width: 100%;box-sizing: border-box !important;overflow: hidden;vertical-align: top;">
     <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;text-align: left;text-indent: 0px;">
      <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 10.5pt;color: rgb(24, 24, 24);letter-spacing: 0.15pt;">
       <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
        <span style="font-size: 15px;">
         支持同时进行最多 10 个上传任务。
        </span>
       </span>
      </span>
     </p>
    </td>
   </tr>
   <tr style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <td style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 4px 7px;outline: 0px;overflow-wrap: break-word;word-break: break-all;hyphens: auto;border: 1px solid rgb(216, 216, 216);max-width: 100%;box-sizing: border-box !important;overflow: hidden;vertical-align: top;">
     <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;text-align: left;text-indent: 0px;">
      <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 10.5pt;color: rgb(24, 24, 24);letter-spacing: 0.15pt;">
       <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
        <span style="font-size: 15px;">
         自定义上传速度
        </span>
       </span>
      </span>
     </p>
    </td>
    <td style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 4px 7px;outline: 0px;overflow-wrap: break-word;word-break: break-all;hyphens: auto;border: 1px solid rgb(216, 216, 216);max-width: 100%;box-sizing: border-box !important;overflow: hidden;vertical-align: top;">
     <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;text-align: left;text-indent: 0px;">
      <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 10.5pt;color: rgb(24, 24, 24);letter-spacing: 0.15pt;">
       <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
        <span style="font-size: 15px;">
         可设置最大网络带宽，减少对网络带宽的影响。
        </span>
       </span>
      </span>
     </p>
    </td>
   </tr>
   <tr style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <td style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 4px 7px;outline: 0px;overflow-wrap: break-word;word-break: break-all;hyphens: auto;border: 1px solid rgb(216, 216, 216);max-width: 100%;box-sizing: border-box !important;overflow: hidden;vertical-align: top;">
     <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;text-align: left;text-indent: 0px;">
      <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 10.5pt;color: rgb(24, 24, 24);letter-spacing: 0.15pt;">
       <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
        <span style="font-size: 15px;">
         分享链接匿名上传
        </span>
       </span>
      </span>
     </p>
    </td>
    <td style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 4px 7px;outline: 0px;overflow-wrap: break-word;word-break: break-all;hyphens: auto;border: 1px solid rgb(216, 216, 216);max-width: 100%;box-sizing: border-box !important;overflow: hidden;vertical-align: top;">
     <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;text-align: left;text-indent: 0px;">
      <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 10.5pt;color: rgb(24, 24, 24);letter-spacing: 0.15pt;">
       <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
        <span style="font-size: 15px;">
         外部用户可通过网盘分享链接进行匿名上传。
        </span>
       </span>
      </span>
     </p>
    </td>
   </tr>
  </tbody>
 </table>
</section>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 24px 0px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   5.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   配置
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <a class="weapp_text_link js_weapp_entry wx_tap_link js_wx_tap_highlight" data-miniprogram-appid="wxe81de4a47ea1ab33" data-miniprogram-applink="" data-miniprogram-nickname="小外链" data-miniprogram-path="go?to=https%3A%2F%2Fhelp.aliyun.com%2Fzh%2Fpds%2Fdrive-and-photo-service-ent%2Fuser-guide%2Fsynchronous-backup" data-miniprogram-servicetype="0" data-miniprogram-type="text" data-unique-id="mn8bwvlf-m5qe7g" href="" link-id="a6cd" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style="font-size: 15px;">
    同步备份
   </span>
  </a>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   ，将本地和云端的文件进行自动同步。
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 48px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   6.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   配置
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <a class="weapp_text_link js_weapp_entry wx_tap_link js_wx_tap_highlight" data-miniprogram-appid="wxe81de4a47ea1ab33" data-miniprogram-applink="" data-miniprogram-nickname="小外链" data-miniprogram-path="go?to=https%3A%2F%2Fhelp.aliyun.com%2Fzh%2Fpds%2Fdrive-and-photo-service-ent%2Fuser-guide%2Fmount-drives" data-miniprogram-servicetype="0" data-miniprogram-type="text" data-unique-id="mn8by3vg-5obyca" href="" link-id="1898" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style="font-size: 15px;">
    挂载盘
   </span>
  </a>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;">
   ，将云端存储空间映射为本地驱动器，像访问本地文件一样访问云端文件。
  </span>
 </span>
</p>
<h1 data-layout-id="5" data-pm-slice="2 2 []" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;font-weight: 500;font-size: 20px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;color: rgb(234, 120, 0);text-align: center;line-height: 1.8;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  05
 </span>
</h1>
<h1 data-layout-id="6" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;font-weight: 500;font-size: 20px;max-width: 100%;font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;color: rgb(234, 120, 0);text-align: center;line-height: 1.8;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  步骤五（可选）：在 OpenClaw 中升级和卸载网盘
 </span>
</h1>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   1.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   配置方式：
  </span>
 </span>
</p>
<ol class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;list-style-type: lower-alpha;'>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="font-size: 15px;">
     方式一：登录 OpenClaw 部署所在的服务器，通过命令行方式进行以下操作安装
    </span>
   </span>
  </p>
 </li>
 <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
    <span style="font-size: 15px;">
     方式二：通过对话 OpenClaw ，让 OpenClaw 帮助你完成命令执行
    </span>
   </span>
  </p>
 </li>
</ol>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   2.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-top: 0px;margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   执行以下命令升级网盘插件：
  </span>
 </span>
</p>
<section powered-by="werss">
 <ul class="code-snippet__line-index code-snippet__js">
  <li>
  </li>
  <li>
  </li>
 </ul>
 <pre class="code-snippet__js" data-lang="nginx"><code><span><span>openclaw</span> plugins uninstall pds --force</span></code><code><span>curl -fsSL <span>"https://statics.aliyunpds.com/download/openclaw-pds/install_openclaw_pds.sh"</span> | bash</span></code></pre>
</section>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 24px 0px;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   3.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   执行以下命令卸载网盘插件：
  </span>
 </span>
</p>
<section powered-by="werss">
 <ul class="code-snippet__line-index code-snippet__js">
  <li>
  </li>
 </ul>
 <pre class="code-snippet__js" data-lang="css"><code><span>openclaw plugins uninstall pds <span>--force</span></span></code></pre>
</section>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 24px 0px 0px 21pt;padding: 0px;outline: 0px;max-width: 100%;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 17px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;background-color: rgb(255, 255, 255);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;text-indent: -21pt;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   4.
  </span>
 </span>
 <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin-right: 0px;margin-left: 0px;padding: 0px;outline: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);font-size: 17px;font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;line-height: 1.6;letter-spacing: 0.034em;font-style: normal;font-weight: normal;box-sizing: border-box !important;overflow-wrap: break-word !important;'>
  <span style="font-size: 15px;font-weight: bold;">
   成功后返回 OpenClaw，再次登录授权后即可正常使用网盘 Skills。
  </span>
 </span>
</p>
<p style="display: none;">
 <mp-style-type data-value="10000">
 </mp-style-type>
</p>