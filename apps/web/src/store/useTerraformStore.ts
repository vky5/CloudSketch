import { create } from "zustand";

interface TerraformStoreInterface {
  terraformBlocks: Record<string, string>;

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

