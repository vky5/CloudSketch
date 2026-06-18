export function evaluateTemplate(template: string, data: Record<string, unknown>): string {
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
      const condition = content.substring(3).trim().replace(/^\./, "");
      const value = getDeepValue(data, condition);
      if (value) {
        result += evaluateTemplate(blockContent, data);
      }
      pos = nextPos;
    } else if (content.startsWith("range ")) {
      const { blockContent, nextPos } = findEndTag(template, endIdx + 2);
      const parts = content.substring(6).trim().split(/\s*,\s*|\s*:=\s*|\s+/);
      const listKey = parts[parts.length - 1].replace(/^\./, "");
      const itemName = parts[1].replace(/^\$/, "");

      const list = getDeepValue(data, listKey);
      if (Array.isArray(list)) {
        list.forEach((item, index) => {
          result += evaluateRangeBlock(blockContent, item, index, itemName, data);
        });
      }
      pos = nextPos;
    } else if (content.startsWith("or ")) {
      const parts = content.split(/\s+/);
      const key = parts[1].replace(/^\./, "");
      const defaultValue = parts[2].replace(/"/g, "");
      const value = getDeepValue(data, key);
      result += (value !== undefined && value !== null && value !== "") ? String(value) : defaultValue;
      pos = endIdx + 2;
    } else if (content.startsWith(".")) {
      const key = content.replace(/^\./, "");
      const value = getDeepValue(data, key);
      result += (value !== undefined && value !== null) ? String(value) : "";
      pos = endIdx + 2;
    } else {
      pos = endIdx + 2;
    }
  }

  return result;
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

function evaluateRangeBlock(
  template: string,
  item: unknown,
  index: number,
  itemName: string,
  globalData: Record<string, unknown>
): string {
  let pos = 0;
  let finalResult = "";

  while (pos < template.length) {
    const startIdx = template.indexOf("{{", pos);
    if (startIdx === -1) {
      finalResult += template.substring(pos);
      break;
    }
    finalResult += template.substring(pos, startIdx);
    const endIdx = template.indexOf("}}", startIdx);
    const tag = template.substring(startIdx + 2, endIdx);
    const tagContent = tag.replace(/^-?\s*|\s*-?$/g, "").trim();

    if (tagContent.startsWith("if $i")) {
      const { blockContent, nextPos } = findEndTag(template, endIdx + 2);
      if (index > 0) {
        finalResult += blockContent;
      }
      pos = nextPos;
    } else if (tagContent === `$${itemName}`) {
      finalResult += String(item);
      pos = endIdx + 2;
    } else {
      finalResult += template.substring(startIdx, endIdx + 2);
      pos = endIdx + 2;
    }
  }

  return evaluateTemplate(finalResult, globalData);
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
