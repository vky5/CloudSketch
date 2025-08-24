import { NodeField } from "@/utils/types/NodeField";

export const s3FormConfig: NodeField[] = [
  {
    key: "BucketName",
    label: "Bucket Name",
    type: "text",
    required: true,
    placeholder: "my-app-bucket",
    description: "Globally unique bucket name.",
  },
  //   {
  //     key: "DefaultStorageClass",
  //     label: "Default Storage Class",
  //     type: "dropdown",
  //     required: true,
  //     options: [
  //       "STANDARD",
  //       "INTELLIGENT_TIERING",
  //       "STANDARD_IA",
  //       "ONEZONE_IA",
  //       "GLACIER",
  //       "DEEP_ARCHIVE",
  //     ],
  //     description: "Default storage class for newly uploaded objects.",
  //   },
  //   {
  //     key: "LifecycleRules",
  //     label: "Lifecycle Rules",
  //     type: "group",
  //     required: false,
  //     fields: [
  //       {
  //         key: "Enabled",
  //         label: "Enable Lifecycle",
  //         type: "checkbox",
  //         description: "Apply automatic transitions or expirations.",
  //       },
  //       {
  //         key: "TransitionAfterDays",
  //         label: "Transition After (Days)",
  //         type: "number",
  //         placeholder: "e.g. 30",
  //         description:
  //           "Number of days after which objects transition to another storage class.",
  //       },
  //       {
  //         key: "TransitionToClass",
  //         label: "Transition To",
  //         type: "dropdown",
  //         options: [
  //           "INTELLIGENT_TIERING",
  //           "STANDARD_IA",
  //           "ONEZONE_IA",
  //           "GLACIER",
  //           "DEEP_ARCHIVE",
  //         ],
  //         description: "Storage class to transition to.",
  //       },
  //     ],
  //   },
];

export type s3Data = {
  BucketName: string;
  // DefaultStorageClass?: "STANDARD" | "INTELLIGENT_TIERING" | "STANDARD_IA" | "ONEZONE_IA" | "GLACIER" | "DEEP_ARCHIVE";
  // LifecycleRules?: {
  //   Enabled: boolean;
  //   TransitionAfterDays?: number;
  //   TransitionToClass?: "INTELLIGENT_TIERING" | "STANDARD_IA" | "ONEZONE_IA" | "GLACIER" | "DEEP_ARCHIVE";
  // };
};

// StorageClass
// Lifecycle is at bucket level (sets how the object will go from one storage class to another after how many days) // applies to all if no filtering is provided
