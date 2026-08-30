# Workbench JSON schema

The bundled local interface imports and exports one JSON object:

```json
{
  "features": [
    {
      "id": "stable-feature-id",
      "name": "AI 内容总结",
      "category": "AI 助手",
      "description": "选择内容后生成摘要与行动项。",
      "competitors": ["Example Product"],
      "priority": "P1",
      "evidence": "产品实测 · 2026-08-29",
      "screenshots": [
        {
          "id": "shot-02",
          "src": "/recordings/example-2026-08-29/step-02.png",
          "caption": "选中文本后出现 AI 总结入口"
        }
      ]
    }
  ],
  "journey": [
    {
      "id": "stable-step-id",
      "title": "选择要总结的内容",
      "note": "从浮动工具栏进入 AI 操作。",
      "status": "observed",
      "screenshots": [
        {
          "id": "shot-02",
          "src": "/recordings/example-2026-08-29/step-02.png",
          "caption": "浮动工具栏中的 AI 入口"
        }
      ]
    }
  ],
  "solution": ["stable-feature-id"],
  "recording": {
    "competitor": "Example Product",
    "recordedAt": "2026-08-29",
    "summary": "完成一次从选中文本到生成摘要的操作。",
    "duration": "2m 14s",
    "frictions": [
      {
        "id": "friction-01",
        "title": "高级模型入口不够明确",
        "description": "只有提交后才出现套餐限制提示。",
        "stage": "选择模型",
        "severity": "medium",
        "productFriction": true
      }
    ]
  }
}
```

## Constraints

- `features`, `journey`, and `solution` are required arrays.
- IDs are unique non-empty strings. Keep them stable across updates.
- Feature `priority` is `P0`, `P1`, or `P2`.
- Journey `status` is `observed` or `inferred`.
- Every `solution` ID must refer to an existing feature.
- `competitors` contains product names, not vendors or URLs.
- `evidence` is a compact UI label. Put full source metadata in the accompanying report or evidence folder.
- `screenshots` is optional on features and journey steps. Each item requires a web-readable `src` and a human-readable `caption` describing what the image proves.
- Recording results should use site-root URLs such as `/recordings/<session-id>/step-01.png`, with the files stored under `public/recordings/<session-id>/`.
- `recording` is optional review metadata. Friction points remain review context and are not automatically merged into the feature framework.

## Non-technical review flow

1. Codex saves the latest review draft to `public/recordings/latest.json`.
2. The user opens the local workbench and clicks **查看最新录制**.
3. The page presents features, journey steps, friction points, and screenshots as cards.
4. Only checked features and journey steps are merged after the user clicks **确认保存**.

Validate before import:

```bash
python3 scripts/validate_workspace.py path/to/workspace.json
```
