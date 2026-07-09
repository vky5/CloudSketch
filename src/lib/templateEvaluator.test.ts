import { describe, it, expect } from "vitest";
import { evaluateTemplate } from "./templateEvaluator";

describe("evaluateTemplate", () => {
  describe("variable substitution", () => {
    it("substitutes a simple variable", () => {
      expect(evaluateTemplate("hello {{.Name}}", { Name: "world" })).toBe(
        "hello world"
      );
    });

    it("substitutes multiple variables", () => {
      expect(
        evaluateTemplate("{{.A}}-{{.B}}", { A: "x", B: "y" })
      ).toBe("x-y");
    });

    it("renders missing variables as empty string", () => {
      expect(evaluateTemplate("v={{.Missing}}!", {})).toBe("v=!");
    });

    it("resolves nested paths", () => {
      expect(
        evaluateTemplate("{{.Outer.Inner}}", { Outer: { Inner: "deep" } })
      ).toBe("deep");
    });

    it("strips whitespace-trim dashes from tags", () => {
      expect(evaluateTemplate("a{{- .X -}}b", { X: "1" })).toBe("a1b");
    });
  });

  describe("or defaults", () => {
    it("uses the value when present", () => {
      expect(evaluateTemplate('{{or .Port "80"}}', { Port: "443" })).toBe(
        "443"
      );
    });

    it("falls back to the default when the key is missing", () => {
      expect(evaluateTemplate('{{or .Port "80"}}', {})).toBe("80");
    });

    it("falls back to the default when the value is empty string", () => {
      expect(evaluateTemplate('{{or .Port "80"}}', { Port: "" })).toBe("80");
    });

    it("keeps multi-word quoted defaults intact", () => {
      expect(evaluateTemplate('{{or .AMI "TODO: Provide AMI ID"}}', {})).toBe(
        "TODO: Provide AMI ID"
      );
    });

    it("supports unquoted defaults", () => {
      expect(evaluateTemplate("{{or .ForceDetach false}}", {})).toBe("false");
    });
  });

  describe("if blocks", () => {
    it("renders the block when the condition is truthy", () => {
      expect(
        evaluateTemplate("{{if .Show}}visible{{end}}", { Show: true })
      ).toBe("visible");
    });

    it("skips the block when the condition is falsy", () => {
      expect(
        evaluateTemplate("{{if .Show}}visible{{end}}", { Show: false })
      ).toBe("");
    });

    it("skips the block when the key is missing", () => {
      expect(evaluateTemplate("{{if .Show}}visible{{end}}", {})).toBe("");
    });

    it("substitutes variables inside a rendered block", () => {
      expect(
        evaluateTemplate("{{if .Sub}}id={{.Sub}}{{end}}", { Sub: "s-1" })
      ).toBe("id=s-1");
    });

    it("handles nested if blocks", () => {
      expect(
        evaluateTemplate("{{if .A}}a{{if .B}}b{{end}}{{end}}", {
          A: true,
          B: true,
        })
      ).toBe("ab");
    });
  });

  describe("eq / else support (used by vpc and elb templates)", () => {
    // Templates in awsTemplates.ts rely on this construct:
    //   internal = {{if eq .Scheme "internal"}}true{{else}}false{{end}}
    // If eq/else are unsupported the expression renders as empty string,
    // producing invalid Terraform like `internal = `.
    it("renders the if-branch when eq matches", () => {
      expect(
        evaluateTemplate('{{if eq .Scheme "internal"}}true{{else}}false{{end}}', {
          Scheme: "internal",
        })
      ).toBe("true");
    });

    it("renders the else-branch when eq does not match", () => {
      expect(
        evaluateTemplate('{{if eq .Scheme "internal"}}true{{else}}false{{end}}', {
          Scheme: "internet-facing",
        })
      ).toBe("false");
    });

    it("renders the else-branch of a plain if when condition is falsy", () => {
      expect(
        evaluateTemplate("{{if .X}}yes{{else}}no{{end}}", {})
      ).toBe("no");
    });
  });

  describe("range blocks", () => {
    it("repeats the block for each item", () => {
      expect(
        evaluateTemplate(
          "{{range $i, $sg := .SecurityGroups}}[{{$sg}}]{{end}}",
          { SecurityGroups: ["a", "b"] }
        )
      ).toBe("[a][b]");
    });

    it("renders nothing for an empty list", () => {
      expect(
        evaluateTemplate("{{range $i, $sg := .Items}}[{{$sg}}]{{end}}", {
          Items: [],
        })
      ).toBe("");
    });

    it("renders nothing when the list is missing", () => {
      expect(
        evaluateTemplate("{{range $i, $sg := .Items}}[{{$sg}}]{{end}}", {})
      ).toBe("");
    });

    it("emits a comma separator via {{if $i}} for items after the first", () => {
      expect(
        evaluateTemplate(
          "{{range $i, $sg := .Items}}{{if $i}},{{end}}{{$sg}}{{end}}",
          { Items: ["a", "b", "c"] }
        )
      ).toBe("a,b,c");
    });

    it("exposes the loop index via {{$i}}", () => {
      expect(
        evaluateTemplate("{{range $i, $x := .Items}}{{$i}};{{end}}", {
          Items: ["a", "b"],
        })
      ).toBe("0;1;");
    });

    it("resolves fields of object items (used by security group rules)", () => {
      expect(
        evaluateTemplate(
          "{{range $i, $rule := .Rules}}{{$rule.FromPort}}-{{$rule.ToPort}} {{end}}",
          { Rules: [{ FromPort: 80, ToPort: 80 }, { FromPort: 443, ToPort: 443 }] }
        )
      ).toBe("80-80 443-443 ");
    });

    it("resolves root data via {{$.Key}} inside a range", () => {
      expect(
        evaluateTemplate(
          "{{range $i, $x := .Items}}{{$.Name}}_{{$i}} {{end}}",
          { Name: "sg", Items: ["a", "b"] }
        )
      ).toBe("sg_0 sg_1 ");
    });

    it("renders if-blocks over item fields inside a range", () => {
      expect(
        evaluateTemplate(
          '{{range $i, $rule := .Rules}}{{if $rule.Cidr}}cidr="{{$rule.Cidr}}"{{end}}{{end}}',
          { Rules: [{ Cidr: "0.0.0.0/0" }, {}] }
        )
      ).toBe('cidr="0.0.0.0/0"');
    });
  });
});
