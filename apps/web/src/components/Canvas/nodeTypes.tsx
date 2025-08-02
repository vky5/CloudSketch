// importing all nodes
import EC2Node from "../nodes/awsNodes/EC2Node";
import RhombusNode from "../nodes/tools/RhombusNode";
import RectangleNode from "../nodes/tools/RectangleNode";
import TextNode from "../nodes/tools/TextNode";
import LambdaNode from "../nodes/awsNodes/LambdaNode";

export const nodeTypes = {
  ec2: EC2Node,
  rectangle: RectangleNode,
  rhombus: RhombusNode,
  text: TextNode,
  lambda: LambdaNode,
};
