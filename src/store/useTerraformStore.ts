import { create } from "zustand";

interface TerraformStoreInterface {
  terraformBlocks: Record<string, string>; // we are using uuid generated when anything is added as key

  setBlocks: (blocks: Record<string, string>) => void; // if we have multiple blocks and we want to add it to the record
  appendBlocks: (newBlock: Record<string, string>) => void;
  updateBlock: (nodeID: string, block: string) => void; // update a particular block with new data
  deleteBlock: (nodeID: string) => void;
  clearAll: () => void;
  getAllAsString: () => string;
}

export const useTerraformStore = create<TerraformStoreInterface>((set, get) => ({
  terraformBlocks: {},

  // func to set completely new state
  setBlocks: (blocks) => {
    set(() => ({
      terraformBlocks: blocks,
    }));
  },

  // to append a new blocks. 
  appendBlocks: (newBlock)=> {
    set((state)=>({
        terraformBlocks : {
            ...state.terraformBlocks,
            ...newBlock // appending new block
        }
    }))
  },

  // to update a particular block. Can also be used to append a single block
  updateBlock: (nodeID, block) => {
    set((state) => ({
      terraformBlocks: {
        ...state.terraformBlocks,
        [nodeID]: block,
      },
    }));
  },

  // func to delete a block
  deleteBlock: (nodeID) => {
    set((state) => {
      const newBlocks = { ...state.terraformBlocks };
      delete newBlocks[nodeID];
      return {terraformBlocks: newBlocks};
    });
  },

  // Clear all terraform blocks
  clearAll: () => {
    set({ terraformBlocks: {} });
  },

  // Combine all blocks into one string
  getAllAsString: () => {
    const blocks = Object.values(get().terraformBlocks);
    return blocks.join("\n\n");
  },
}));


// anything that sets return is used to set the state 
// get to get the current state


//I am asking this lets say I connect ec2 to s3 and a new IAM is generated it doesnt have any record in my resource..... it will be just like that?? you know what is a better way? when the edge is clicked I mean edge setting the setting to configure it appears and in that setting an ability to chooes the IAM role you wanna use and also any IAM role that they returns I am thinking about adding it in resource but in terraform store it is saved under the record of edge not individual id or itsef's id like the normal iam role is saved. 

// This way the user will have the ability to edit it but also they wont be able to delete it until they delete the edge in which case the entire iam is deleted and we will have too clean up the resource   

/*
Ahh yes — now I get exactly what you’re thinking, and that’s actually a **very clean and manageable design**. Let me break it down:

---

### **Current problem**

* Generating a new IAM role automatically per edge is fine Terraform-wise, but the **dashboard has no record** of it.
* User cannot see or edit it — it’s “hidden” in the backend.
* If you have multiple EC2 → S3 edges, you get **duplicate roles** that are impossible to manage easily.

---

### **Proposed solution (your idea)**

1. **Edge settings panel**

   * When the user clicks an edge, a settings UI pops up.
   * They can **select an existing IAM role** or **let the system generate a new one**.

2. **Resource management**

   * Any IAM role created for the edge is added to the **global resource list**, just like a normal IAM role.
   * But its **Terraform block is stored under the edge’s ID** in the Terraform store.
   * This keeps it **tied to the edge** for deletion purposes.

3. **Lifecycle behavior**

   * If the user deletes the edge:

     * Terraform block for the edge (including the IAM role) is deleted from the store.
     * The global resource list still shows it for reference, or you can clean it up automatically if it’s only used by that edge.

4. **Editing permissions**

   * The user can **select IAM role** from the dropdown in the edge settings.
   * Can reuse roles for multiple edges, avoiding duplication.

---

### **Advantages**

* ✅ Dashboard sees and can edit IAM roles.
* ✅ Terraform store keeps IAM role tied to edge — easy to delete.
* ✅ Avoids duplication, allows reuse.
* ✅ Clean UX: user knows which IAM is associated with which edge.
* ✅ Edge deletion automatically cleans up resources linked exclusively to it.

---

### **Implementation suggestion**

* **Global resource store** holds all IAM roles (with IDs).
* **Edge Terraform block** references the IAM role selected in settings.
* **Edge deletion logic**:

  * Check if the IAM role is **exclusive to this edge**.
  * If yes → delete block + optionally remove from global resources.
  * If shared → just delete edge block, leave IAM role.


*/