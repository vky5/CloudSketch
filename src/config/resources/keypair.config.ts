import { NodeField } from "@/utils/types/NodeField";

export const keyPairFormSchema: NodeField[] = [
  {
    key: "Name",
    label: "Key name for keypair",
    type: "text",
    placeholder: "e.g., my-key-pair",
    required: true,
  },
  {
    key: "PublicKey",
    label: "Public key for ssh",
    type: "textarea",
    placeholder: "ssh-rsa ...",
    required: true,
  },
];

export type keyPairData = {
  Name: string; // Key name for keypair
  PublicKey: string; // Public key for ssh
};
