#!/usr/bin/env python3
"""Validate JSON exported to or imported from the local research workbench."""

import json
import sys
from pathlib import Path


def fail(message: str) -> None:
    print(f"INVALID: {message}", file=sys.stderr)
    raise SystemExit(1)


def validate_screenshots(value: object, location: str) -> None:
    if value is None:
        return
    if not isinstance(value, list):
        fail(f"{location}.screenshots must be an array")
    for index, screenshot in enumerate(value):
        if not isinstance(screenshot, dict):
            fail(f"{location}.screenshots[{index}] must be an object")
        if not isinstance(screenshot.get("src"), str) or not screenshot["src"].strip():
            fail(f"{location}.screenshots[{index}].src must be a non-empty string")
        if not isinstance(screenshot.get("caption"), str) or not screenshot["caption"].strip():
            fail(f"{location}.screenshots[{index}].caption must be a non-empty string")


def main() -> None:
    if len(sys.argv) != 2:
        fail("usage: validate_workspace.py <workspace.json>")
    path = Path(sys.argv[1])
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(str(exc))
    if not isinstance(data, dict):
        fail("root must be an object")
    for key in ("features", "journey", "solution"):
        if not isinstance(data.get(key), list):
            fail(f"{key} must be an array")

    feature_ids: set[str] = set()
    for index, feature in enumerate(data["features"]):
        if not isinstance(feature, dict):
            fail(f"features[{index}] must be an object")
        required = ("id", "name", "category", "description", "competitors", "priority", "evidence")
        if any(key not in feature for key in required):
            fail(f"features[{index}] is missing required fields")
        if not isinstance(feature["id"], str) or not feature["id"].strip():
            fail(f"features[{index}].id must be a non-empty string")
        if feature["id"] in feature_ids:
            fail(f"duplicate feature id: {feature['id']}")
        feature_ids.add(feature["id"])
        if feature["priority"] not in {"P0", "P1", "P2"}:
            fail(f"features[{index}].priority must be P0, P1, or P2")
        if not isinstance(feature["competitors"], list):
            fail(f"features[{index}].competitors must be an array")
        validate_screenshots(feature.get("screenshots"), f"features[{index}]")

    journey_ids: set[str] = set()
    for index, step in enumerate(data["journey"]):
        if not isinstance(step, dict):
            fail(f"journey[{index}] must be an object")
        if any(key not in step for key in ("id", "title", "note", "status")):
            fail(f"journey[{index}] is missing required fields")
        if step["id"] in journey_ids:
            fail(f"duplicate journey id: {step['id']}")
        journey_ids.add(step["id"])
        if step["status"] not in {"observed", "inferred"}:
            fail(f"journey[{index}].status must be observed or inferred")
        validate_screenshots(step.get("screenshots"), f"journey[{index}]")

    recording = data.get("recording")
    if recording is not None:
        if not isinstance(recording, dict):
            fail("recording must be an object")
        frictions = recording.get("frictions", [])
        if not isinstance(frictions, list):
            fail("recording.frictions must be an array")
        for index, friction in enumerate(frictions):
            if not isinstance(friction, dict) or not isinstance(friction.get("title"), str) or not isinstance(friction.get("description"), str):
                fail(f"recording.frictions[{index}] must include string title and description")

    unknown = [item for item in data["solution"] if item not in feature_ids]
    if unknown:
        fail(f"solution references unknown feature ids: {', '.join(unknown)}")
    print(f"VALID: {len(feature_ids)} features, {len(journey_ids)} journey steps, {len(data['solution'])} solution items")


if __name__ == "__main__":
    main()
