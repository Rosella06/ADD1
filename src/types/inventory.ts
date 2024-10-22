export type inventorytype = {
  id: string;
  InventoryPosition: number;
  Min: number,
  Max: number,
  InventoryQty: number;
  InventoryStatus: boolean;
  DrugId: string;
  MachineId: string;
  Drug: {
    id: string;
    DrugName: string;
    DrugStatus: boolean;
    DrugImage?: string;
    CreatedAt: string;
    UpdatedAt: string;
  };
};
