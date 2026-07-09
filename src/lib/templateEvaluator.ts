// Minimal Go-template-style evaluator for the AWS Terraform templates.
// Supports: {{.Key}}, {{$var}}, {{$var.Path}}, {{$.RootKey}}, {{$i}},
// {{or .Key "default"}}, {{if <cond>}}...{{else}}...{{end}} with
// eq/truthiness conditions, and {{range $i, $item := .List}}...{{end}}.

// Scope holds range-loop variable bindings, e.g. { i: 0, rule: {...} }
type Scope = Record<string, unknown>;

export function evaluateTemplate(
  template: string,
  data: Record<string, unknown>,
  scope: Scope = {}
): string {
  let result = "";
  let pos = 0;

  while (pos < template.length) {
    const startIdx = template.indexOf("{{", pos);
    if (startIdx === -1) {
      result += template.substring(pos);
      break;
    }

    result += template.substring(pos, startIdx);
    const endIdx = template.indexOf("}}", startIdx);
    if (endIdx === -1) {
      result += template.substring(startIdx);
      break;
    }

    const tag = template.substring(startIdx, endIdx + 2);
    // Remove {{, }}, and optional dashes
    const rawContent = tag.substring(2, tag.length - 2);
    const content = rawContent.replace(/^-?\s*|\s*-?$/g, "").trim();

    if (content.startsWith("if ")) {
      const { blockContent, nextPos } = findEndTag(template, endIdx + 2);
      const condition = content.substring(3).trim();
      const { ifPart, elsePart } = splitElseBranch(blockContent);
      if (evaluateCondition(condition, data, scope)) {
        result += evaluateTemplate(ifPart, data, scope);
      } else if (elsePart !== null) {
        result += evaluateTemplate(elsePart, data, scope);
      }
      pos = nextPos;
    } else if (content.startsWith("range ")) {
      const { blockContent, nextPos } = findEndTag(template, endIdx + 2);
      const parts = content.substring(6).trim().split(/\s*,\s*|\s*:=\s*|\s+/);
      const listRef = parts[parts.length - 1];
      // {{range $i, $item := .List}} binds both; {{range $item := .List}} binds one
      const indexName = parts.length >= 3 ? parts[0].replace(/^\$/, "") : null;
      const itemName =
        parts.length >= 3
          ? parts[1].replace(/^\$/, "")
          : parts[0].replace(/^\$/, "");

      const list = resolveRef(listRef, data, scope);
      if (Array.isArray(list)) {
        list.forEach((item, index) => {
          const innerScope: Scope = { ...scope, [itemName]: item };
          if (indexName) innerScope[indexName] = index;
          result += evaluateTemplate(blockContent, data, innerScope);
        });
      }
      pos = nextPos;
    } else if (content.startsWith("or ")) {
      const match = content
        .substring(3)
        .trim()
        .match(/^(\S+)\s+(?:"([^"]*)"|(\S+))$/);
      if (match) {
        const value = resolveRef(match[1], data, scope);
        const defaultValue = match[2] !== undefined ? match[2] : match[3];
        result +=
          value !== undefined && value !== null && value !== ""
            ? String(value)
            : defaultValue;
      }
      pos = endIdx + 2;
    } else if (content.startsWith(".") || content.startsWith("$")) {
      const value = resolveRef(content, data, scope);
      result += value !== undefined && value !== null ? String(value) : "";
      pos = endIdx + 2;
    } else {
      // Unknown tags (comments, stray else/end) render as nothing
      pos = endIdx + 2;
    }
  }

  return result;
}

// Resolves ".Key.Path" against data, "$var" / "$var.Path" against scope,
// and "$.Key" against the root data object
function resolveRef(
  ref: string,
  data: Record<string, unknown>,
  scope: Scope
): unknown {
  if (ref.startsWith("$.")) {
    return getDeepValue(data, ref.substring(2));
  }
  if (ref.startsWith("$")) {
    const dotIdx = ref.indexOf(".");
    const name = dotIdx === -1 ? ref.substring(1) : ref.substring(1, dotIdx);
    const base = scope[name];
    if (dotIdx === -1) return base;
    if (base && typeof base === "object") {
      return getDeepValue(base as Record<string, unknown>, ref.substring(dotIdx + 1));
    }
    return undefined;
  }
  return getDeepValue(data, ref.replace(/^\./, ""));
}

// Supports plain truthiness (`if .Key`, `if $i`) and equality (`if eq .Key "literal"`)
function evaluateCondition(
  condition: string,
  data: Record<string, unknown>,
  scope: Scope
): boolean {
  if (condition.startsWith("eq ")) {
    const match = condition.substring(3).trim().match(/^(\S+)\s+"([^"]*)"$/);
    if (!match) return false;
    const value = resolveRef(match[1], data, scope);
    return String(value ?? "") === match[2];
  }
  return Boolean(resolveRef(condition, data, scope));
}

// Splits an if-block's content at a top-level {{else}}, ignoring else tags nested inside inner if/range blocks
function splitElseBranch(block: string): { ifPart: string; elsePart: string | null } {
  let depth = 0;
  let pos = 0;
  while (pos < block.length) {
    const start = block.indexOf("{{", pos);
    if (start === -1) break;
    const end = block.indexOf("}}", start);
    if (end === -1) break;
    const tagContent = block
      .substring(start + 2, end)
      .replace(/^-?\s*|\s*-?$/g, "")
      .trim();

    if (tagContent.startsWith("if ") || tagContent.startsWith("range ")) {
      depth++;
    } else if (tagContent === "end") {
      depth--;
    } else if (tagContent === "else" && depth === 0) {
      return { ifPart: block.substring(0, start), elsePart: block.substring(end + 2) };
    }
    pos = end + 2;
  }
  return { ifPart: block, elsePart: null };
}

function findEndTag(template: string, startPos: number): { blockContent: string; nextPos: number } {
  let depth = 1;
  let pos = startPos;
  while (pos < template.length) {
    const nextStart = template.indexOf("{{", pos);
    const nextEnd = template.indexOf("}}", pos);

    if (nextStart !== -1 && nextEnd !== -1) {
      const tag = template.substring(nextStart + 2, nextEnd);
      const tagContent = tag.replace(/^-?\s*|\s*-?$/g, "").trim();

      if (tagContent.startsWith("if ") || tagContent.startsWith("range ")) {
        depth++;
        pos = nextEnd + 2;
      } else if (tagContent === "end") {
        depth--;
        if (depth === 0) {
          return {
            blockContent: template.substring(startPos, nextStart),
            nextPos: nextEnd + 2,
          };
        }
        pos = nextEnd + 2;
      } else {
        pos = nextEnd + 2;
      }
    } else {
      break;
    }
  }
  return { blockContent: "", nextPos: pos };
}

function getDeepValue(obj: Record<string, unknown>, path: string): unknown {
  if (!path) return undefined;
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}
