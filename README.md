# Competitor Research Workbench

一个搭配 Codex Skill 使用的本地竞品调研工作台，用于把公开资料、手动发现和真实产品操作整理成可追溯的功能框架、用户旅程与产品方案。

## 核心能力

- 竞品资料抓取、定位分析、趋势判断与功能框架整理
- 手动快捷记录，并拆解为原子功能
- 工作流录制：观察真实操作，在关键节点截图
- 可视化录制结果收件箱：审阅功能、旅程、摩擦点和截图
- 人工确认后才写入功能框架或用户旅程
- 方案画布：将功能拖入 P0 / P1 / P2，并继续调整优先级
- 本地浏览器存储与工作台 JSON 导入、导出

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

打开终端输出的本地地址，通常为 [http://localhost:3000](http://localhost:3000)。

## 安装 Skill

将 `skills/competitor-research-workbench` 复制到你的 Codex Skills 目录：

```bash
cp -R skills/competitor-research-workbench "$CODEX_HOME/skills/competitor-research-workbench"
```

重新打开 Codex 后，即可通过 `$competitor-research-workbench` 使用。

## 工作流录制

1. 在网页点击“复制 Codex 指令”，粘贴到 Codex。
2. 阅读监控范围和隐私提示，明确确认后开始操作竞品。
3. Codex 从实际操作识别任务，在入口、关键选择、成功、失败或付费拦截时截图。
4. 发送“结束录制”。Codex 会立即停止，并把结果保存到 `public/recordings/latest.json`。
5. 回到网页点击“查看最新录制”，逐项审阅后再确认保存。

录制前不要求填写“本次操作目标”。敏感字段、凭证、私信、支付信息和无关应用应始终避免出现在录制画面中。

## 数据与隐私

- 已确认的工作台内容默认保存在浏览器 `localStorage`。
- 录制截图保存在 `public/recordings/<session-id>/`。
- 推断与实际观察分开标记。
- 未经网页确认，录制结果不会直接写入功能框架或用户旅程。

## 项目结构

```text
app/                                      本地工作台页面
public/recordings/                        最新录制结果与截图
recordings/                               示例录制结果
skills/competitor-research-workbench/     Codex Skill
  references/                             调研、录制与数据协议
  scripts/validate_workspace.py           工作台 JSON 校验器
```

## 校验

```bash
npx oxlint app/page.tsx
npm run build
python3 skills/competitor-research-workbench/scripts/validate_workspace.py public/recordings/latest.json
```
