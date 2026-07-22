---
title: "开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南"
source_url: https://mp.weixin.qq.com/s/57U6XeKCGtVkQXnNqg9DJQ
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
source_type: wechat
provenance_state: extracted
sha256: 4f7ad8b95e2477fe014d41f66c1259ebdde47e241ed2c6985ca40d2bf189a3ff
---
---
<p style="font-size: 0px; line-height: 0; margin: 0px; visibility: visible;">
 <span style="visibility: visible;">
 </span>
</p>
<section powered-by="werss" style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; visibility: visible;'>
 <p style="font-size: 0px; line-height: 0; margin: 0px; visibility: visible;">
  <span style="visibility: visible;">
  </span>
 </p>
 <section powered-by="werss" style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; visibility: visible;'>
  <p style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; margin: 0px 8px 1.5em; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;'>
   <span style="visibility: visible;">
    大家平时在使用
   </span>
   <strong style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: inherit; color: rgb(0, 152, 116); font-weight: bold; visibility: visible;'>
    <span style="visibility: visible;">
     Claude Code
    </span>
   </strong>
   <span style="visibility: visible;">
    的过程中，会有大量的跟知识相关的文件需要去管理，也相信大家找到的答案肯定是
   </span>
   <strong style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: inherit; color: rgb(0, 152, 116); font-weight: bold; visibility: visible;'>
    <span style="visibility: visible;">
     Obsidian
    </span>
   </strong>
   <span style="visibility: visible;">
    。这两个工具本身都很好用，Claude Code 主要负责生成 Markdown （比如计划、记忆、
   </span>
   <code style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;'>
    <span style="visibility: visible;">
     CLAUDE.md
    </span>
   </code>
   <span style="visibility: visible;">
    ），而 Obsidian 更擅长管理这些内容。
   </span>
  </p>
  <p style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;'>
   <span style="visibility: visible;">
    但真把它们放在一起去使用，整体体验往往没有想象中那么好。最常见的一个问题是：当你直接用 Obsidian 打开整个代码仓库时，大量非 Markdown 文件（图片、脚本、依赖）会让 Vault 结构变得混乱。
   </span>
  </p>
  <p style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;'>
   <span style="visibility: visible;">
    本文整理了社区里常见的五种解决思路，从简单的过滤方法，到更完整的集成方式。你可以根据自己的使用习惯，选一个适合自己的方案。
   </span>
  </p>
  <h2 data-heading="true" style='text-align: center; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 19.2px; display: table; padding: 0px 0.2em; margin: 4em auto 2em; color: rgb(255, 255, 255); background: rgb(0, 152, 116); font-weight: bold; visibility: visible;'>
   <span style="visibility: visible;">
    核心痛点：文件分散与混乱
   </span>
  </h2>
  <p style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;'>
   <span style="visibility: visible;">
    Claude Code 的配置分散在多个位置：
   </span>
  </p>
  <section powered-by="werss" style="max-width: 100%; overflow: auto; visibility: visible;">
   <table style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; color: rgb(63, 63, 63); visibility: visible;'>
    <thead style="visibility: visible;">
     <tr style="visibility: visible;">
      <th style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; border: 1px solid rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: keep-all; background: rgba(0, 0, 0, 0.05); visibility: visible;'>
       <section powered-by="werss" style="visibility: visible;">
        <span style="visibility: visible;">
         位置
        </span>
       </section>
      </th>
      <th style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; border: 1px solid rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: keep-all; background: rgba(0, 0, 0, 0.05); visibility: visible;'>
       <section powered-by="werss" style="visibility: visible;">
        <span style="visibility: visible;">
         用途
        </span>
       </section>
      </th>
     </tr>
    </thead>
    <tbody style="visibility: visible;">
     <tr style="visibility: visible;">
      <td style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; border: 1px solid rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: keep-all; visibility: visible;'>
       <code style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;'>
        <span style="visibility: visible;">
         ~/.claude/CLAUDE.md
        </span>
       </code>
      </td>
      <td style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; border: 1px solid rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: keep-all; visibility: visible;'>
       <section powered-by="werss" style="visibility: visible;">
        <span style="visibility: visible;">
         全局指令
        </span>
       </section>
      </td>
     </tr>
     <tr style="visibility: visible;">
      <td style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; border: 1px solid rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: keep-all; visibility: visible;'>
       <code style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;'>
        <span style="visibility: visible;">
         ~/.claude/plans/
        </span>
       </code>
      </td>
      <td style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; border: 1px solid rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: keep-all; visibility: visible;'>
       <section powered-by="werss" style="visibility: visible;">
        <span style="visibility: visible;">
         计划文件
        </span>
       </section>
      </td>
     </tr>
     <tr style="visibility: visible;">
      <td style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; border: 1px solid rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: keep-all; visibility: visible;'>
       <code style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;'>
        <span style="visibility: visible;">
         ~/.claude/projects/
        </span>
       </code>
      </td>
      <td style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; border: 1px solid rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: keep-all; visibility: visible;'>
       <section powered-by="werss" style="visibility: visible;">
        <span style="visibility: visible;">
         每个项目的记忆
        </span>
       </section>
      </td>
     </tr>
     <tr style="visibility: visible;">
      <td style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; border: 1px solid rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: keep-all; visibility: visible;'>
       <code style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;'>
        <span style="visibility: visible;">
         ~/.claude/skills/
        </span>
       </code>
      </td>
      <td style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; border: 1px solid rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: keep-all; visibility: visible;'>
       <section powered-by="werss" style="visibility: visible;">
        <span style="visibility: visible;">
         可复用技能
        </span>
       </section>
      </td>
     </tr>
     <tr style="visibility: visible;">
      <td style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; border: 1px solid rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: keep-all; visibility: visible;'>
       <code style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;'>
        <span style="visibility: visible;">
         {repo}/CLAUDE.md
        </span>
       </code>
      </td>
      <td style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; border: 1px solid rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: keep-all; visibility: visible;'>
       <section powered-by="werss" style="visibility: visible;">
        <span style="visibility: visible;">
         项目内指令（随仓库提交）
        </span>
       </section>
      </td>
     </tr>
    </tbody>
   </table>
  </section>
  <p style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;'>
   <span style="visibility: visible;">
    一旦你同时维护多个仓库，这些文件就会变得很分散，很难统一管理。
   </span>
  </p>
  <p style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;'>
   <span style="visibility: visible;">
    如果直接把代码仓库当成 Obsidian Vault 打开，虽然能看到这些 Markdown 文件，但问题也很明显：各种 PNG、JS 文件、lock 文件，甚至
   </span>
   <code style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;'>
    <span style="visibility: visible;">
     node_modules
    </span>
   </code>
   <span style="visibility: visible;">
    也会一股脑出现在文件列表里，整个视图很快就乱掉了。
   </span>
  </p>
  <p style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;'>
   <span style="visibility: visible;">
    Obsidian 虽然提供了「排除文件」的设置（设置 &gt; 文件与链接），但它只是
   </span>
   <strong style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: inherit; color: rgb(0, 152, 116); font-weight: bold; visibility: visible;'>
    <span style="visibility: visible;">
     软隐藏
    </span>
   </strong>
   <span style="visibility: visible;">
    ——文件看起来不见了，其实还是被索引着。对这个问题来说，帮助有限。
   </span>
  </p>
  <mpcpc class="js_cpc_area res_iframe cpc_iframe" data-category_id_list="1|16|21|36|42|43|48|59|60|61|62|64|65|66|67|68" data-id="1776045299334" js_editor_cpcad="" src="/cgi-bin/readtemplate?t=tmpl/cpc_tmpl#1776045299334" style="visibility: visible; display: none;">
  </mpcpc>
  <h2 data-heading="true" style='text-align: center; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 19.2px; display: table; padding: 0px 0.2em; margin: 4em auto 2em; color: rgb(255, 255, 255); background: rgb(0, 152, 116); font-weight: bold; visibility: visible;'>
   <span style="visibility: visible;">
    五大集成策略
   </span>
  </h2>
  <h3 data-heading="true" style='text-align: left; line-height: 1.2; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 17.6px; padding-left: 8px; border-left-width: 3px; border-left-style: solid; border-left-color: rgb(0, 152, 116); margin: 2em 8px 0.75em 0px; color: rgb(63, 63, 63); font-weight: bold; visibility: visible;'>
   <span style="visibility: visible;">
    策略 1：独立开发者 Vault + 符号链接
   </span>
  </h3>
  <p style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;'>
   <strong style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: inherit; color: rgb(0, 152, 116); font-weight: bold; visibility: visible;'>
    <span style="visibility: visible;">
     适合场景
    </span>
   </strong>
   <span style="visibility: visible;">
    ：同时维护多个项目，希望统一搜索和管理信息。
   </span>
  </p>
  <p style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;'>
   <span style="visibility: visible;">
    思路很简单：建一个独立的 Obsidian Vault，不放在任何代码仓库里，然后用符号链接把你关心的内容「拉」进来。
   </span>
  </p>
  <pre style='color: rgb(201, 209, 217); background: rgb(13, 17, 23); text-align: left; line-height: 1.5; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; overflow-x: auto; border-radius: 8px; margin: 10px 8px; padding: 0px !important; visibility: visible;'><span style="display: flex; padding: 10px 14px 0px; visibility: visible;"><svg aria-label="插图" height="13px" role="img" style="visibility: visible;" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" style="visibility: visible;"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" style="visibility: visible;"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" style="visibility: visible;"></ellipse></svg></span><code style='display: -webkit-box; padding: 0.5em 1em 1em; overflow-x: auto; text-indent: 0px; text-align: left; line-height: 1.75; font-family: Menlo, "Operator Mono", Consolas, Monaco, monospace; font-size: 90%; margin: 0px; white-space: nowrap; visibility: visible;'><span style="color: rgb(139, 148, 158); visibility: visible;"><span style="visibility: visible;"># 创建独立仓库（不在任何项目里）</span></span><span style="color: rgb(255, 166, 87); visibility: visible;"><span style="visibility: visible;"><br style="visibility: visible;"/></span><span style="visibility: visible;">mkdir</span></span><span style="visibility: visible;"> ~/Developer-Vault</span><span style="color: rgb(255, 166, 87); visibility: visible;"><span style="visibility: visible;"><br style="visibility: visible;"/></span><span style="visibility: visible;">cd</span></span><span style="visibility: visible;"> ~/Developer-Vault</span><span style="color: rgb(139, 148, 158); visibility: visible;"><span style="visibility: visible;"><br style="visibility: visible;"/></span><span style="visibility: visible;"><br style="visibility: visible;"/></span><span style="visibility: visible;"># 链接 Claude Code 全局配置</span></span><span style="color: rgb(255, 166, 87); visibility: visible;"><span style="visibility: visible;"><br style="visibility: visible;"/></span><span style="visibility: visible;">ln</span></span><span style="visibility: visible;"> -s ~/.claude claude-global</span><span style="color: rgb(139, 148, 158); visibility: visible;"><span style="visibility: visible;"><br style="visibility: visible;"/></span><span style="visibility: visible;"><br style="visibility: visible;"/></span><span style="visibility: visible;"># 链接各个项目</span></span><span style="color: rgb(255, 166, 87); visibility: visible;"><span style="visibility: visible;"><br style="visibility: visible;"/></span><span style="visibility: visible;">ln</span></span><span style="visibility: visible;"> -s ~/projects/my-app my-app</span><span style="color: rgb(255, 166, 87); visibility: visible;"><span style="visibility: visible;"><br style="visibility: visible;"/></span><span style="visibility: visible;">ln</span></span><span style="visibility: visible;"> -s ~/projects/my-api my-api</span></code></pre>
  <p style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;'>
   <span style="visibility: visible;">
    然后在
   </span>
   <code style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;'>
    <span style="visibility: visible;">
     .obsidian/app.json
    </span>
   </code>
   <span style="visibility: visible;">
    里过滤掉代码噪音：
   </span>
  </p>
  <pre style='color: rgb(201, 209, 217); background: rgb(13, 17, 23); text-align: left; line-height: 1.5; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; overflow-x: auto; border-radius: 8px; margin: 10px 8px; padding: 0px !important; visibility: visible;'><span style="display: flex; padding: 10px 14px 0px; visibility: visible;"><svg aria-label="插图" height="13px" role="img" style="visibility: visible;" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" style="visibility: visible;"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" style="visibility: visible;"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" style="visibility: visible;"></ellipse></svg></span><code style='display: -webkit-box; padding: 0.5em 1em 1em; overflow-x: auto; text-indent: 0px; text-align: left; line-height: 1.75; font-family: Menlo, "Operator Mono", Consolas, Monaco, monospace; font-size: 90%; margin: 0px; white-space: nowrap; visibility: visible;'><span style="visibility: visible;">{</span><span style="color: rgb(121, 192, 255); visibility: visible;"><span style="visibility: visible;"><br style="visibility: visible;"/></span><span style="visibility: visible;">  "userIgnoreFilters"</span></span><span style="visibility: visible;">:</span><span style="visibility: visible;"> [</span><span style="color: rgb(165, 214, 255); visibility: visible;"><span style="visibility: visible;">"node_modules/"</span></span><span style="visibility: visible;">,</span><span style="color: rgb(165, 214, 255); visibility: visible;"><span style="visibility: visible;"> ".next/"</span></span><span style="visibility: visible;">,</span><span style="color: rgb(165, 214, 255); visibility: visible;"><span style="visibility: visible;"> "dist/"</span></span><span style="visibility: visible;">,</span><span style="color: rgb(165, 214, 255); visibility: visible;"><span style="visibility: visible;"> ".git/"</span></span><span style="visibility: visible;">,</span><span style="color: rgb(165, 214, 255); visibility: visible;"><span style="visibility: visible;"> ".vercel/"</span></span><span style="visibility: visible;">]</span><span style="visibility: visible;"><br style="visibility: visible;"/></span><span style="visibility: visible;">}</span></code></pre>
  <p style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;'>
   <span style="visibility: visible;">
    再配合
   </span>
   <strong style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: inherit; color: rgb(0, 152, 116); font-weight: bold; visibility: visible;'>
    <span style="visibility: visible;">
     File Explorer++
    </span>
   </strong>
   <span style="visibility: visible;">
    ，按扩展名隐藏
   </span>
   <code style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;'>
    <span style="visibility: visible;">
     *.js
    </span>
   </code>
   <span style="visibility: visible;">
    、
   </span>
   <code style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;'>
    <span style="visibility: visible;">
     *.ts
    </span>
   </code>
   <span style="visibility: visible;">
    、
   </span>
   <code style='text-align: left; line-height: 1.75; font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;'>
    <span style="visibility: visible;">
     *.png
    </span>
   </code>
   <span style="visibility: visible;">
    这些文件，界面会干净很多。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     这样做的效果是
    </span>
   </strong>
   <span>
    ：
   </span>
  </p>
  <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 可以统一搜索所有
     </span>
     <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
      <span>
       CLAUDE.md
      </span>
     </code>
     <span>
      、计划、记忆和技能
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 能跨项目做 Dataview 查询
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 不同项目之间可以互相链接笔记
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 各个代码仓库本身不会被
     </span>
     <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
      <span>
       .obsidian/
      </span>
     </code>
     <span>
      污染
     </span>
    </section>
   </li>
  </ul>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     需要注意的点
    </span>
   </strong>
   <span>
    ：
   </span>
  </p>
  <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • Obsidian 只支持
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <span>
       目录级
      </span>
     </strong>
     <span>
      符号链接，不支持单文件
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 移动端对符号链接支持不太稳定，建议不要同步这些目录
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • Obsidian Git 插件只会跟踪当前仓库，不会跟踪这些链接进来的内容
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 在文件浏览器里跨链接移动文件，基本是行不通的
     </span>
    </section>
   </li>
  </ul>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    策略 2：Vault = Claude Code 工作目录
   </span>
  </h3>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     适合场景
    </span>
   </strong>
   <span>
    ：做个人知识管理 / 「第二大脑」这类工作流。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    这是目前社区里比较流行的一种方式：直接把 Obsidian Vault 当成 Claude Code 的工作目录来用。Vault 根目录的
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     CLAUDE.md
    </span>
   </code>
   <span>
    一身二用——既是给 Claude 的指令，也是你在 Obsidian 里阅读的笔记。
   </span>
  </p>
  <pre style="color: #c9d1d9;background: #0d1117;text-align: left;line-height: 1.5;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;overflow-x: auto;border-radius: 8px;margin: 10px 8px;padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;text-align: left;line-height: 1.75;font-family: Menlo, Operator Mono, Consolas, Monaco, monospace;font-size: 90%;margin: 0;white-space: nowrap;"><span>my-vault/</span><span><br/></span><span>├── CLAUDE.md              # Claude 用它，Obsidian 也能直接读</span><span><br/></span><span>├── .claude/               # 技能、钩子、配置</span><span><br/></span><span>├── daily-notes/</span><span><br/></span><span>├── projects/</span><span><br/></span><span>│   ├── pixelmuse/</span><span><br/></span><span>│   └── my-api/</span><span><br/></span><span>├── research/</span><span><br/></span><span>├── decisions/</span><span><br/></span><span>└── templates/</span></code></pre>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     社区里常见的做法大概是这样
    </span>
   </strong>
   <span>
    ：
   </span>
  </p>
  <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      •
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <span>
       根目录的
      </span>
      <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
       <span>
        CLAUDE.md
       </span>
      </code>
     </strong>
     <span>
      ：当作整个 Vault 的「操作手册」
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      •
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
       <span>
        VAULT-INDEX.md
       </span>
      </code>
     </strong>
     <span>
      ：给 Claude 用的入口，相当于一个实时总览
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      •
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <span>
       每个目录下配一个
      </span>
      <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
       <span>
        index.md
       </span>
      </code>
     </strong>
     <span>
      ：由 Claude 自动维护（新建/删除文件时更新）
     </span>
    </section>
   </li>
  </ul>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    比如
   </span>
   <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
    <span>
     ballred/obsidian-claude-pkm
    </span>
    <sup>
     <span>
      [1]
     </span>
    </sup>
   </span>
   <span>
    这种项目，会再加一层目标管理（年 / 月 / 周）。
   </span>
   <span>
    <br/>
   </span>
   <span>
    还有像
   </span>
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     Noah Vincent
    </span>
   </strong>
   <span>
    的
   </span>
   <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
    <span>
     IPARAG 结构
    </span>
    <sup>
     <span>
      [2]
     </span>
    </sup>
   </span>
   <span>
    ，本质上是把内容分成：收件箱、项目、领域、资源、归档，以及类似 Zettelkasten 的笔记体系。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    这种方式在
   </span>
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     你的 Vault 本身就是工作内容
    </span>
   </strong>
   <span>
    时特别好用，比如写作、研究、个人项目管理。但如果你已经有一套成熟的代码仓库结构，再硬套进来，反而会比较别扭。
   </span>
  </p>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    策略 3：MCP 桥接
   </span>
  </h3>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     适合场景
    </span>
   </strong>
   <span>
    ：既想保持代码仓库干净，又希望 Claude 能随时访问你的知识库。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    这种方式的思路是：代码仓库和 Obsidian 完全分开，但通过 MCP 把两边「连起来」。你还是在项目目录里正常用 Claude Code，但它可以随时去 Obsidian 里查资料。
   </span>
  </p>
  <pre style="color: #c9d1d9;background: #0d1117;text-align: left;line-height: 1.5;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;overflow-x: auto;border-radius: 8px;margin: 10px 8px;padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;text-align: left;line-height: 1.75;font-family: Menlo, Operator Mono, Consolas, Monaco, monospace;font-size: 90%;margin: 0;white-space: nowrap;"><span style="color: #8b949e;"><span># 在项目仓库中正常工作</span></span><span style="color: #ffa657;"><span><br/></span><span>cd</span></span><span> ~/projects/my-app</span><span><br/></span><span>claude</span><span style="color: #8b949e;"><span><br/></span><span><br/></span><span># 同时可以访问 Obsidian 里的内容</span></span><span style="color: #8b949e;"><span><br/></span><span># 不需要符号链接，也不用改仓库结构</span></span></code></pre>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    比如
   </span>
   <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
    <span>
     obsidian-claude-code-mcp
    </span>
    <sup>
     <span>
      [3]
     </span>
    </sup>
   </span>
   <span>
    这样的插件，会通过 WebSocket 自动发现你的仓库（默认端口 22360），支持多个仓库同时使用。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    还有
   </span>
   <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
    <span>
     Claudesidian MCP
    </span>
    <sup>
     <span>
      [4]
     </span>
    </sup>
   </span>
   <span>
    ，在此基础上加了语义搜索（基于
   </span>
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     Ollama embedding
    </span>
   </strong>
   <span>
    ）和更完整的 agent 能力，用起来更像一个「会查资料的助手」。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     这种方案的优点是
    </span>
   </strong>
   <span>
    ：
   </span>
  </p>
  <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 代码仓库完全干净，不需要引入 Obsidian
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 不用符号链接，也不用调整项目结构
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 可以直接访问你的笔记、计划和上下文
     </span>
    </section>
   </li>
  </ul>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     需要权衡的点：
    </span>
   </strong>
   <span>
    ：
   </span>
  </p>
  <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 使用时需要一直开着 Obsidian
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 整体多了一层 MCP，系统稍微复杂一点
     </span>
    </section>
   </li>
  </ul>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    策略 4：每个仓库一个 Vault
   </span>
  </h3>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     适合场景
    </span>
   </strong>
   <span>
    ：只专注单个项目，想要简单直接的配置。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    这种方式最简单：直接把每个代码仓库当成一个 Obsidian Vault 来用。配合
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     userIgnoreFilters
    </span>
   </code>
   <span>
    把非 Markdown 文件隐藏掉（下面会讲怎么处理文件混乱的问题）。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    同时记得把
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     .obsidian/
    </span>
   </code>
   <span>
    加进
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     .gitignore
    </span>
   </code>
   <span>
    ，避免污染代码仓库：
   </span>
  </p>
  <pre style="color: #c9d1d9;background: #0d1117;text-align: left;line-height: 1.5;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;overflow-x: auto;border-radius: 8px;margin: 10px 8px;padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;text-align: left;line-height: 1.75;font-family: Menlo, Operator Mono, Consolas, Monaco, monospace;font-size: 90%;margin: 0;white-space: nowrap;"><span># Obsidian</span><span><br/></span><span>.obsidian/</span><span><br/></span><span>.trash/</span></code></pre>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     这种方式的好处是
    </span>
   </strong>
   <span>
    ：
   </span>
  </p>
  <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 配置简单，没有额外结构
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 每个项目自成一体，干扰少
     </span>
    </section>
   </li>
  </ul>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     但缺点也很明显
    </span>
   </strong>
   <span>
    ：
   </span>
  </p>
  <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 没法跨项目搜索
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 多项目切换比较麻烦
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 看不到全局
     </span>
     <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
      <span>
       ~/.claude/
      </span>
     </code>
     <span>
      的计划、记忆和项目内容
     </span>
    </section>
   </li>
  </ul>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    策略 5：QMD + 会话同步
   </span>
  </h3>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     适合场景
    </span>
   </strong>
   <span>
    ：重度使用 Claude Code，希望把「上下文」真正沉淀下来。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    这是偏进阶的一套玩法，核心思路是：使用
   </span>
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     Shopify CEO Tobi Lutke
    </span>
   </strong>
   <span>
    的
   </span>
   <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
    <span>
     QMD
    </span>
    <sup>
     <span>
      [5]
     </span>
    </sup>
   </span>
   <span>
    把 Claude 的对话也当成知识来管理。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    大致是三样东西组合在一起：
   </span>
  </p>
  <ol class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      1.
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <span>
       QMD
      </span>
     </strong>
     <span>
      ：在 Markdown 仓库上做语义搜索，比简单的 grep 更省 token
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      2.
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <span>
       sync-claude-sessions
      </span>
     </strong>
     <span>
      ：会话结束时自动导出为 Markdown
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      3.
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
       <span>
        /recall
       </span>
      </code>
      <span>
       技能
      </span>
     </strong>
     <span>
      ：新会话开始前，把相关上下文拉回来
     </span>
    </section>
   </li>
  </ol>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    这样一来，Claude Code 的每次对话都会变成可搜索的笔记，慢慢沉淀在你的本地仓库里。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     这套方案的特点
    </span>
   </strong>
   <span>
    ：
   </span>
  </p>
  <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 全部本地运行，不依赖云端
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 会话可以复用，不再是「一次性上下文」
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 查历史信息比单纯关键词搜索更高效
     </span>
    </section>
   </li>
  </ul>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    一些开发者的反馈也比较一致：用 QMD 做语义分块之后，token 使用和处理时间都有明显下降（有的场景能到 60%+）。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     需要权衡的点
    </span>
   </strong>
   <span>
    ：
   </span>
  </p>
  <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 搭建成本更高，需要多工具配合
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      • 需要一定使用习惯（比如定期 recall、维护结构）
     </span>
    </section>
   </li>
  </ul>
  <h2 data-heading="true" style="text-align: center;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 19.2px;display: table;padding: 0 0.2em;margin: 4em auto 2em;color: #fff;background: #009874;font-weight: bold;">
   <span>
    解决文件混乱问题
   </span>
  </h2>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    如果你已经把代码仓库当作 Obsidian vault 使用，结果文件列表里全是 PNG 和各种资源文件，可以这样处理。
   </span>
  </p>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    步骤 1：通过
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     app.json
    </span>
   </code>
   <span>
    排除目录
   </span>
  </h3>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    打开「设置 → 文件与链接 → 排除文件」，或者直接编辑
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     .obsidian/app.json
    </span>
   </code>
   <span>
    ：
   </span>
  </p>
  <pre style="color: #c9d1d9;background: #0d1117;text-align: left;line-height: 1.5;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;overflow-x: auto;border-radius: 8px;margin: 10px 8px;padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;text-align: left;line-height: 1.75;font-family: Menlo, Operator Mono, Consolas, Monaco, monospace;font-size: 90%;margin: 0;white-space: nowrap;"><span>{</span><span style="color: #79c0ff;"><span><br/></span><span>  "userIgnoreFilters"</span></span><span>:</span><span> [</span><span style="color: #a5d6ff;"><span>"node_modules/"</span></span><span>,</span><span style="color: #a5d6ff;"><span> ".next/"</span></span><span>,</span><span style="color: #a5d6ff;"><span> "dist/"</span></span><span>,</span><span style="color: #a5d6ff;"><span> ".git/"</span></span><span>,</span><span style="color: #a5d6ff;"><span> ".vercel/"</span></span><span>,</span><span style="color: #a5d6ff;"><span> "public/"</span></span><span>]</span><span><br/></span><span>}</span></code></pre>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    步骤 2：用正则排除文件类型
   </span>
  </h3>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    在同一个「排除文件」设置里，可以加一些正则规则，把不关心的文件类型隐藏掉：
   </span>
  </p>
  <pre style="color: #c9d1d9;background: #0d1117;text-align: left;line-height: 1.5;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;overflow-x: auto;border-radius: 8px;margin: 10px 8px;padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;text-align: left;line-height: 1.75;font-family: Menlo, Operator Mono, Consolas, Monaco, monospace;font-size: 90%;margin: 0;white-space: nowrap;"><span>/.*\.png/</span><span><br/></span><span>/.*\.jpg/</span><span><br/></span><span>/.*\.jpeg/</span><span><br/></span><span>/.*\.svg/</span><span><br/></span><span>/.*\.gif/</span><span><br/></span><span>/.*\.ico/</span><span><br/></span><span>/.*\.webp/</span><span><br/></span><span>/.*\.js/</span><span><br/></span><span>/.*\.ts/</span><span><br/></span><span>/.*\.tsx/</span><span><br/></span><span>/.*\.jsx/</span><span><br/></span><span>/.*\.css/</span><span><br/></span><span>/.*\.json/</span><span><br/></span><span>/.*\.lock/</span></code></pre>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     注意
    </span>
   </strong>
   <span>
    ：这只是「软隐藏」。这些文件在界面上看不到了，但 Obsidian 还是会在内部索引它们，所以并不是彻底隔离。
   </span>
  </p>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    步骤 3：用 File Explorer++ 做「硬过滤」
   </span>
  </h3>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    可以装一个
   </span>
   <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
    <span>
     File Explorer++
    </span>
    <sup>
     <span>
      [6]
     </span>
    </sup>
   </span>
   <span>
    插件，它支持按文件名或路径做通配符 / 正则过滤，而且可以随时开关，比内置的排除功能更灵活。
   </span>
  </p>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    步骤 4：关闭「检测所有文件扩展名」
   </span>
  </h3>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    在「设置 → 文件与链接」里，把「检测所有文件扩展名」关掉。这样像 JS、TS、JSON 这些 Obsidian 本身不处理的文件，就不会再出现在文件列表里。
   </span>
  </p>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    替代方案：File Ignore 插件
   </span>
  </h3>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    如果你想要更彻底一点，可以用
   </span>
   <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
    <span>
     File Ignore
    </span>
    <sup>
     <span>
      [7]
     </span>
    </sup>
   </span>
   <span>
    插件。它支持
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     .gitignore
    </span>
   </code>
   <span>
    风格的规则，并通过给文件加前缀的方式，让 Obsidian 在索引时直接跳过这些文件。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    不过要注意，这种方式会
   </span>
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     实际修改文件名
    </span>
   </strong>
   <span>
    ，所以更适合你能接受这种改动、或者本身就是个人仓库的场景。
   </span>
  </p>
  <mpcpc class="js_cpc_area res_iframe cpc_iframe" data-category_id_list="1|16|21|36|42|43|48|59|60|61|62|64|65|66|67|68" data-id="1776045310162" js_editor_cpcad="" src="/cgi-bin/readtemplate?t=tmpl/cpc_tmpl#1776045310162" style="display: none;">
  </mpcpc>
  <h2 data-heading="true" style="text-align: center;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 19.2px;display: table;padding: 0 0.2em;margin: 4em auto 2em;color: #fff;background: #009874;font-weight: bold;">
   <span>
    插件推荐
   </span>
  </h2>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    开发者 Vault 必备
   </span>
  </h3>
  <section powered-by="werss" style="max-width: 100%;overflow: auto;">
   <table style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #3f3f3f;">
    <thead>
     <tr>
      <th style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;background: rgba(0, 0, 0, 0.05);">
       <section powered-by="werss">
        <span>
         插件
        </span>
       </section>
      </th>
      <th style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;background: rgba(0, 0, 0, 0.05);">
       <section powered-by="werss">
        <span>
         用来做什么
        </span>
       </section>
      </th>
     </tr>
    </thead>
    <tbody>
     <tr>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
        <span>
         File Explorer++
        </span>
        <sup>
         <span>
          [6]
         </span>
        </sup>
       </span>
      </td>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <section powered-by="werss">
        <span>
         用通配符 / 正则过滤文件，隐藏
        </span>
        <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
         <span>
          *.js
         </span>
        </code>
        <span>
         、
        </span>
        <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
         <span>
          *.png
         </span>
        </code>
        <span>
         等，支持一键开关
        </span>
       </section>
      </td>
     </tr>
     <tr>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
        <span>
         Dataview
        </span>
        <sup>
         <span>
          [8]
         </span>
        </sup>
       </span>
      </td>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <section powered-by="werss">
        <span>
         跨所有
        </span>
        <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
         <span>
          CLAUDE.md
         </span>
        </code>
        <span>
         做查询，比如项目状态、计划汇总
        </span>
       </section>
      </td>
     </tr>
     <tr>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
        <span>
         Templater
        </span>
        <sup>
         <span>
          [9]
         </span>
        </sup>
       </span>
      </td>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <section powered-by="werss">
        <span>
         用模板生成统一结构的
        </span>
        <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
         <span>
          CLAUDE.md
         </span>
        </code>
        <span>
         ，减少重复工作
        </span>
       </section>
      </td>
     </tr>
    </tbody>
   </table>
  </section>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    Obsidian 内直接用 Claude Code（选一个）
   </span>
  </h3>
  <section powered-by="werss" style="max-width: 100%;overflow: auto;">
   <table style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #3f3f3f;">
    <thead>
     <tr>
      <th style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;background: rgba(0, 0, 0, 0.05);">
       <section powered-by="werss">
        <span>
         插件
        </span>
       </section>
      </th>
      <th style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;background: rgba(0, 0, 0, 0.05);">
       <section powered-by="werss">
        <span>
         用法特点
        </span>
       </section>
      </th>
     </tr>
    </thead>
    <tbody>
     <tr>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
        <span>
         Claudian
        </span>
        <sup>
         <span>
          [10]
         </span>
        </sup>
       </span>
      </td>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <section powered-by="werss">
        <span>
         侧边栏聊天形式，支持不同权限模式（YOLO / 安全 / 计划）
        </span>
       </section>
      </td>
     </tr>
     <tr>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
        <span>
         Agent Client
        </span>
        <sup>
         <span>
          [11]
         </span>
        </sup>
       </span>
      </td>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <section powered-by="werss">
        <span>
         集成多个模型（Claude / Codex / Gemini），支持 @ 引用笔记
        </span>
       </section>
      </td>
     </tr>
     <tr>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
        <span>
         Claude Sidebar
        </span>
        <sup>
         <span>
          [12]
         </span>
        </sup>
       </span>
      </td>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <section powered-by="werss">
        <span>
         更接近终端体验，自动启动 Claude Code，支持多标签
        </span>
       </section>
      </td>
     </tr>
    </tbody>
   </table>
  </section>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    MCP 插件（远程访问）
   </span>
  </h3>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    如果你不想把 Obsidian 和代码仓库绑在一起，可以用 MCP 这类插件做远程访问：
   </span>
  </p>
  <section powered-by="werss" style="max-width: 100%;overflow: auto;">
   <table style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #3f3f3f;">
    <thead>
     <tr>
      <th style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;background: rgba(0, 0, 0, 0.05);">
       <section powered-by="werss">
        <span>
         插件
        </span>
       </section>
      </th>
      <th style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;background: rgba(0, 0, 0, 0.05);">
       <section powered-by="werss">
        <span>
         用法特点
        </span>
       </section>
      </th>
     </tr>
    </thead>
    <tbody>
     <tr>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
        <span>
         obsidian-claude-code-mcp
        </span>
        <sup>
         <span>
          [3]
         </span>
        </sup>
       </span>
      </td>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <section powered-by="werss">
        <span>
         自动发现仓库，Claude Code 可以直接访问，不用
        </span>
        <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
         <span>
          cd
         </span>
        </code>
       </section>
      </td>
     </tr>
     <tr>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
        <span>
         Claudesidian MCP
        </span>
        <sup>
         <span>
          [4]
         </span>
        </sup>
       </span>
      </td>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <section powered-by="werss">
        <span>
         更完整的代理模式，支持语义搜索（Ollama）
        </span>
       </section>
      </td>
     </tr>
    </tbody>
   </table>
  </section>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    其他实用插件
   </span>
  </h3>
  <section powered-by="werss" style="max-width: 100%;overflow: auto;">
   <table style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #3f3f3f;">
    <thead>
     <tr>
      <th style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;background: rgba(0, 0, 0, 0.05);">
       <section powered-by="werss">
        <span>
         插件
        </span>
       </section>
      </th>
      <th style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;background: rgba(0, 0, 0, 0.05);">
       <section powered-by="werss">
        <span>
         用来做什么
        </span>
       </section>
      </th>
     </tr>
    </thead>
    <tbody>
     <tr>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
        <span>
         Folder Note
        </span>
        <sup>
         <span>
          [13]
         </span>
        </sup>
       </span>
      </td>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <section powered-by="werss">
        <span>
         给文件夹绑定一个说明页，点击文件夹就能打开对应笔记
        </span>
       </section>
      </td>
     </tr>
     <tr>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
        <span>
         File Hider
        </span>
        <sup>
         <span>
          [14]
         </span>
        </sup>
       </span>
      </td>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <section powered-by="werss">
        <span>
         支持右键隐藏单个文件或文件夹，适合临时清理视图
        </span>
       </section>
      </td>
     </tr>
     <tr>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;color: #576b95;">
        <span>
         Hide Folders
        </span>
        <sup>
         <span>
          [15]
         </span>
        </sup>
       </span>
      </td>
      <td style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;">
       <section powered-by="werss">
        <span>
         按规则控制文件夹的显示与隐藏，用起来更灵活
        </span>
       </section>
      </td>
     </tr>
    </tbody>
   </table>
  </section>
  <h2 data-heading="true" style="text-align: center;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 19.2px;display: table;padding: 0 0.2em;margin: 4em auto 2em;color: #fff;background: #009874;font-weight: bold;">
   <span>
    Dataview 查询技巧
   </span>
  </h2>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    给
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     CLAUDE.md
    </span>
   </code>
   <span>
    加一点结构化信息之后，Dataview 的价值会一下子体现出来。很多原本分散的信息，都可以用查询统一整理出来。
   </span>
  </p>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    给每个
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     CLAUDE.md
    </span>
   </code>
   <span>
    加 frontmatter
   </span>
  </h3>
  <pre style="color: #c9d1d9;background: #0d1117;text-align: left;line-height: 1.5;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;overflow-x: auto;border-radius: 8px;margin: 10px 8px;padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;text-align: left;line-height: 1.75;font-family: Menlo, Operator Mono, Consolas, Monaco, monospace;font-size: 90%;margin: 0;white-space: nowrap;"><span>---</span><span><br/></span><span>type: claude-config</span><span><br/></span><span>project: my-app</span><span><br/></span><span>stack: [nextjs, tailwind, supabase]</span><span style="color: #1f6feb;font-weight: 700;"><span><br/></span><span>status: active</span><span><br/></span><span>---</span></span></code></pre>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    查询所有项目配置
   </span>
  </h3>
  <pre style="color: #c9d1d9;background: #0d1117;text-align: left;line-height: 1.5;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;overflow-x: auto;border-radius: 8px;margin: 10px 8px;padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;text-align: left;line-height: 1.75;font-family: Menlo, Operator Mono, Consolas, Monaco, monospace;font-size: 90%;margin: 0;white-space: nowrap;"><span style="color: #8b949e;"><span>```dataview</span><span><br/></span><span>TABLE project, stack, status</span><span><br/></span><span>FROM ""</span><span><br/></span><span>WHERE type = "claude-config"</span><span><br/></span><span>SORT project ASC</span><span><br/></span><span>```</span></span></code></pre>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    列出所有 Claude 计划（按最近更新）
   </span>
  </h3>
  <pre style="color: #c9d1d9;background: #0d1117;text-align: left;line-height: 1.5;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;overflow-x: auto;border-radius: 8px;margin: 10px 8px;padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;text-align: left;line-height: 1.75;font-family: Menlo, Operator Mono, Consolas, Monaco, monospace;font-size: 90%;margin: 0;white-space: nowrap;"><span style="color: #8b949e;"><span>```dataview</span><span><br/></span><span>TABLE file.mtime as "最后修改"</span><span><br/></span><span>FROM "claude-global/plans"</span><span><br/></span><span>SORT file.mtime DESC</span><span><br/></span><span>```</span></span></code></pre>
  <h3 data-heading="true" style="text-align: left;line-height: 1.2;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 17.6px;padding-left: 8px;border-left: 3px solid #009874;margin: 2em 8px 0.75em 0;color: #3f3f3f;font-weight: bold;">
   <span>
    配合 Templater 自动生成
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     CLAUDE.md
    </span>
   </code>
  </h3>
  <pre style="color: #c9d1d9;background: #0d1117;text-align: left;line-height: 1.5;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;overflow-x: auto;border-radius: 8px;margin: 10px 8px;padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;text-align: left;line-height: 1.75;font-family: Menlo, Operator Mono, Consolas, Monaco, monospace;font-size: 90%;margin: 0;white-space: nowrap;"><span>---</span><span><br/></span><span>type: claude-config</span><span><br/></span><span>project: &lt;% tp.system.prompt("项目名称") %&gt;</span><span><br/></span><span>status: active</span><span style="color: #1f6feb;font-weight: 700;"><span><br/></span><span>date: &lt;% tp.date.now("YYYY-MM-DD") %&gt;</span><span><br/></span><span>---</span></span><span style="color: #1f6feb;font-weight: 700;"><span><br/></span><span><br/></span><span># &lt;% tp.system.prompt("项目名称") %&gt; — Claude Code 配置</span></span><span style="color: #1f6feb;font-weight: 700;"><span><br/></span><span><br/></span><span>## 技术栈</span></span><span style="color: #f2cc60;"><span><br/></span><span><br/></span><span>-</span></span><span style="color: #1f6feb;font-weight: 700;"><span><br/></span><span><br/></span><span>## 代码质量</span></span><span style="color: #f2cc60;"><span><br/></span><span><br/></span><span>-</span></span><span style="color: #1f6feb;font-weight: 700;"><span><br/></span><span><br/></span><span>## 关键架构</span></span><span style="color: #f2cc60;"><span><br/></span><span><br/></span><span>-</span></span><span style="color: #1f6feb;font-weight: 700;"><span><br/></span><span><br/></span><span>## 环境变量</span></span><span><br/></span><span><br/></span><span>-</span></code></pre>
  <h2 data-heading="true" style="text-align: center;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 19.2px;display: table;padding: 0 0.2em;margin: 4em auto 2em;color: #fff;background: #009874;font-weight: bold;">
   <span>
    Obsidian CLI 的突破性进展
   </span>
  </h2>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    Obsidian
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     1.12
    </span>
   </code>
   <span>
    引入的 CLI，可以说把整个集成方式往前推了一大步。现在像 Claude Code、Codex、Gemini CLI 这类工具，都可以直接「使用」 Obsidian，而不只是简单地读文件。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    有开发者在一个 4,000+ 文件、16GB 的仓库上做过测试，结果很直观：
   </span>
  </p>
  <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      •
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <span>
       找孤立笔记
      </span>
     </strong>
     <span>
      ：从十几秒降到不到 1 秒（大约 50 倍提升）
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      •
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <span>
       全仓搜索
      </span>
     </strong>
     <span>
      ：也有明显加速
     </span>
    </section>
   </li>
  </ul>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    本质上，它解决的是一个老问题：以前 AI 只能用 grep 这种方式「硬扫文件」，现在可以直接利用 Obsidian 的索引能力。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     如果把几种接入方式简单排一下
    </span>
   </strong>
   <span>
    ：
   </span>
  </p>
  <ol class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      1.
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <span>
       Obsidian CLI
      </span>
     </strong>
     <span>
      → 最快、最省 token
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      2.
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <span>
       REST API（社区插件）
      </span>
     </strong>
     <span>
      → 灵活，但多一层调用
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      3.
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <span>
       文件系统（grep / glob）
      </span>
     </strong>
     <span>
      → 最慢，也最耗 token
     </span>
    </section>
   </li>
  </ol>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    另外一个值得关注的点是：Obsidian 官方也在逐步完善 Claude 相关能力（比如专门的 skills），让 Claude 能更自然地编辑
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     .md
    </span>
   </code>
   <span>
    、.
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     canvas
    </span>
   </code>
   <span>
    这类文件。
   </span>
  </p>
  <h2 data-heading="true" style="text-align: center;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 19.2px;display: table;padding: 0 0.2em;margin: 4em auto 2em;color: #fff;background: #009874;font-weight: bold;">
   <span>
    社区最佳实践
   </span>
  </h2>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    社区里有个挺有共识的原则，可以用一句话来概括：
   </span>
  </p>
  <blockquote style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;font-style: normal;padding: 1em;border-left: 4px solid #009874;border-radius: 6px;color: rgba(0,0,0,0.5);background: #f7f7f7;margin-bottom: 1em;">
   <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 1em;display: block;letter-spacing: 0.1em;color: #3f3f3f;">
    <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
     <span>
      AI 负责读取，人负责书写
     </span>
    </strong>
   </p>
  </blockquote>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    意思是，你的 vault 应该记录的是
   </span>
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     你自己的思考
    </span>
   </strong>
   <span>
    。Claude 用来读这些内容、补充上下文，但不应该把生成的内容一股脑写进去，把 vault 变成「AI 输出的集合」。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    更清晰一点的做法是：把 Claude 的输出（比如计划、会话、记忆）放在
   </span>
   <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
    <span>
     ~/.claude/
    </span>
   </code>
   <span>
    ，而 vault 本身只保留真正有价值的知识和思考。
   </span>
  </p>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <span>
    在这个思路下，一些自定义命令也挺有意思：
   </span>
  </p>
  <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      •
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
       <span>
        /my-world
       </span>
      </code>
     </strong>
     <span>
      — 加载整个 vault 的上下文
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      •
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
       <span>
        /today
       </span>
      </code>
     </strong>
     <span>
      — 从每日笔记出发做当天规划
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      •
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
       <span>
        /close
       </span>
      </code>
     </strong>
     <span>
      — 做一天的总结和反思
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      •
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
       <span>
        /trace
       </span>
      </code>
     </strong>
     <span>
      — 回溯一个想法是怎么一步步演变的
     </span>
    </section>
   </li>
   <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
    <section powered-by="werss">
     <span>
      •
     </span>
     <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
      <code style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 90%;color: #d14;background: rgba(27,31,35,.05);padding: 3px 5px;border-radius: 4px;">
       <span>
        /ghost
       </span>
      </code>
     </strong>
     <span>
      — 用你的语气，基于已有内容来回答
     </span>
    </section>
   </li>
  </ul>
 </section>
 <h2 data-heading="true" style="text-align: center;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 19.2px;display: table;padding: 0 0.2em;margin: 4em auto 2em;color: #fff;background: #009874;font-weight: bold;">
  <span>
   社区资源
  </span>
 </h2>
 <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
   <span>
    博客文章（偏方法和实践）
   </span>
  </strong>
  <span>
   ：
  </span>
 </p>
 <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      Chase AI — Claude Code + Obsidian Persistent Memory：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://www.chaseai.io/blog/claude-code-obsidian-persistent-memory
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      WhyTryAI — Build Your Second Brain：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://www.whytryai.com/p/claude-code-obsidian
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      Noah Vincent — AI Second Brain Setup：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://noahvnct.substack.com/p/how-to-build-your-ai-second-brain
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      Niclas Dern — My Obsidian + Claude Code Setup：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://niclasdern.substack.com/p/my-obsidian-claude-code-setup
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      Kyle Gao — Using Claude Code with Obsidian：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://kyleygao.com/blog/2025/using-claude-code-with-obsidian/
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      Kenneth Reitz — Obsidian Vaults and Claude Code：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://kennethreitz.org/essays/2026-03-06-obsidian_vaults_and_claude_code
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      Sebastian Steins — Symlinks for Obsidian：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://www.ssp.sh/brain/add-external-folders-git-blog-book-to-my-obsidian-vault-via-symlink/
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      XDA — Claude Code Inside Obsidian：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://www.xda-developers.com/claude-code-inside-obsidian-and-it-was-eye-opening/
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      Awesome Claude — 3 Ways to Use Obsidian with Claude Code：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://awesomeclaude.ai/how-to/use-obsidian-with-claude
      </span>
     </span>
    </span>
   </section>
  </li>
 </ul>
 <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
   <span>
    Twitter / X（趋势 &amp; 一线实践）
   </span>
  </strong>
  <span>
   ：
  </span>
 </p>
 <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      @kepano — Obsidian CEO building official Claude Skills：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://x.com/kepano/status/2008578873903206895
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      @dwarkesh_sp — Early viral 「Claude Code on Obsidian」 tweet：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://x.com/dwarkesh_sp/status/1894147173782360221
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      @drrobcincotta — Obsidian CLI benchmarks (54x faster than grep)：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://x.com/drrobcincotta/status/2022210753575760293
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      @ArtemXTech — QMD + session sync stack：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://x.com/ArtemXTech/status/2028330693659332615
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      @gregisenberg — Personal OS with Obsidian + Claude Code：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://x.com/gregisenberg/status/2026036464287412412
      </span>
     </span>
    </span>
   </section>
  </li>
 </ul>
 <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
   <span>
    GitHub（模板 &amp; 工具）
   </span>
  </strong>
  <span>
   ：
  </span>
 </p>
 <ul class="list-paddingleft-1" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;list-style: circle;padding-left: 1em;margin-left: 0;color: #3f3f3f;">
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      带目标管理的 starter：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://github.com/ballred/obsidian-claude-pkm
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      可演化的第二大脑模板：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://github.com/huytieu/COG-second-brain
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      基于 Git 的同步方案：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://github.com/ksanderer/claude-vault
      </span>
     </span>
    </span>
   </section>
  </li>
  <li style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;display: block;margin: 0.2em 8px;color: #3f3f3f;">
   <section powered-by="werss">
    <span>
     •
     <span style="font-size: 14px;">
      预配置的 Vault 结构：
     </span>
    </span>
    <span style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;font-style: italic;">
     <span>
      <span style="font-size: 14px;">
       https://github.com/heyitsnoah/claudesidian
      </span>
     </span>
    </span>
   </section>
  </li>
 </ul>
 <section powered-by="werss" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;">
  <h4 data-heading="true" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 2em 8px 0.5em;color: #009874;font-weight: bold;">
   <span>
    引用链接
   </span>
  </h4>
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 80%;margin: 0.5em 8px;color: #3f3f3f;">
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [1]
    </span>
   </code>
   <span>
    ballred/obsidian-claude-pkm:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://github.com/ballred/obsidian-claude-pkm
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [2]
    </span>
   </code>
   <span>
    IPARAG 结构:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://noahvnct.substack.com/p/how-to-build-your-ai-second-brain
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [3]
    </span>
   </code>
   <span>
    obsidian-claude-code-mcp:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://github.com/iansinnott/obsidian-claude-code-mcp
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [4]
    </span>
   </code>
   <span>
    Claudesidian MCP:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://github.com/ProfSynapse/claudesidian-mcp
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [5]
    </span>
   </code>
   <span>
    QMD:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://github.com/tobi/qmd
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [6]
    </span>
   </code>
   <span>
    File Explorer++:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://github.com/kelszo/obsidian-file-explorer-plus
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [7]
    </span>
   </code>
   <span>
    File Ignore:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://obsidian-file-ignore.kkuk.dev/
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [8]
    </span>
   </code>
   <span>
    Dataview:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://github.com/blacksmithgu/obsidian-dataview
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [9]
    </span>
   </code>
   <span>
    Templater:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://www.obsidianstats.com/plugins/templater-obsidian
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [10]
    </span>
   </code>
   <span>
    Claudian:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://github.com/YishenTu/claudian
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [11]
    </span>
   </code>
   <span>
    Agent Client:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://github.com/RAIT-09/obsidian-agent-client
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [12]
    </span>
   </code>
   <span>
    Claude Sidebar:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://github.com/derek-larson14/obsidian-claude-sidebar
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [13]
    </span>
   </code>
   <span>
    Folder Note:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://lostpaul.github.io/obsidian-folder-notes/
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [14]
    </span>
   </code>
   <span>
    File Hider:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://github.com/Eldritch-Oliver/file-hider
    </span>
   </i>
   <span>
    <br/>
   </span>
   <code style="font-size: 90%;opacity: 0.6;">
    <span>
     [15]
    </span>
   </code>
   <span>
    Hide Folders:
   </span>
   <i style="word-break: break-all;">
    <span>
     https://github.com/JonasDoesThings/obsidian-hide-folders
    </span>
   </i>
  </p>
 </section>
 <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 80%;margin: 0.5em 8px;color: #3f3f3f;">
  <i style="word-break: break-all;">
   <span>
    <br/>
   </span>
  </i>
 </p>
 <section powered-by="werss">
  <mp-common-profile class="js_uneditable custom_select_card mp_profile_iframe mp_common_widget js_wx_tap_highlight" data-alias="gh_f9d7926173bc" data-biz_account_status="0" data-from="0" data-headimg="http://mmbiz.qpic.cn/mmbiz_png/yvIRzTU5zy1fo3Tc1muibsVUlebQTwXRlzyMOibOfnZ2HybBhPPhJg5wEVlBmrxNfLttmFC1DGHjuiblS4VsWFNyA/300?wx_fmt=png&amp;wxfrom=19" data-id="MjM5NzA1NzMyOQ==" data-index="0" data-is_biz_ban="0" data-isban="0" data-nickname="技术极简主义" data-origin_num="58" data-pluginname="mpprofile" data-service_type="1" data-signature="简单就是最美好的技术表现形式" data-verify_status="0">
  </mp-common-profile>
 </section>
 <section powered-by="werss" style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;">
  <p style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 16px;margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
   <strong style="text-align: left;line-height: 1.75;font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: inherit;color: #009874;font-weight: bold;">
    <span>
     既然看到这里了，如果觉得有启发，随手点个赞、推荐、转发三连吧，你的支持是我持续分享干货的动力。
    </span>
   </strong>
   <span>
    <br/>
   </span>
  </p>
 </section>
</section>
<p style="font-size: 0px;line-height: 0;margin: 0px;">
 <span>
 </span>
</p>
<p style="display: none;">
 <mp-style-type data-value="3">
 </mp-style-type>
</p>