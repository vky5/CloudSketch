import { describe, it, expect } from "vitest";
import canConnect, { keyGen } from "./connectionsConfig";

describe("canConnect", () => {
  describe("allowed pairs", () => {
    it.each([
      ["ebs", "ec2"],
      ["s3", "ec2"],
      ["elb", "ec2"],
    ])("allows %s -> %s", (source, target) => {
      expect(canConnect(source, target)).toBe(true);
    });
  });

  describe("restricted sources", () => {
    it.each([
      ["ebs", "rds"],
      ["ebs", "s3"],
      ["s3", "rds"],
      ["s3", "vpc"],
      ["elb", "rds"],
      ["elb", "subnet"],
    ])("rejects %s -> %s", (source, target) => {
      expect(canConnect(source, target)).toBe(false);
    });
  });

  describe("permissive fallback for sources without rules", () => {
    // Sources with no entry in connectionRules are allowed to connect to
    // anything. This is current intended behavior; if a new resource should
    // be restricted, it needs an explicit entry in connectionRules.
    it.each([
      ["ec2", "ebs"],
      ["ec2", "s3"],
      ["rds", "ec2"],
      ["vpc", "subnet"],
    ])("allows unlisted source %s -> %s", (source, target) => {
      expect(canConnect(source, target)).toBe(true);
    });
  });
});

describe("keyGen", () => {
  it("maps ec2 -> ebs to the ec2ebs contract", () => {
    expect(keyGen("ec2", "ebs")).toBe("ec2ebs");
  });

  it("maps ec2 -> s3 to the ec2s3 contract", () => {
    expect(keyGen("ec2", "s3")).toBe("ec2s3");
  });

  it("maps elb -> ec2 to the elbec2 contract", () => {
    expect(keyGen("elb", "ec2")).toBe("elbec2");
  });

  it("is direction-sensitive", () => {
    expect(keyGen("ebs", "ec2")).toBeNull();
    expect(keyGen("s3", "ec2")).toBeNull();
    expect(keyGen("ec2", "elb")).toBeNull();
  });

  it("returns null for pairs without connection logic", () => {
    expect(keyGen("rds", "ec2")).toBeNull();
    expect(keyGen("vpc", "subnet")).toBeNull();
  });
});
