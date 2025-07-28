// importing all nodes
import EC2Node from "../nodes/EC2Node";
import CircleNode from "../nodes/tools/CircleNode";
import RectangleNode from "../nodes/tools/RectangleNode";

export const nodeTypes = {
  ec2: EC2Node,
  rectangle: RectangleNode,
  circle: CircleNode,
};
