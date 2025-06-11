export type inventorytype = {
  id: string;
  InventoryPosition: number;
  Min: number,
  Max: number,
  InventoryQty: number;
  InventoryStatus: boolean;
  DrugId: string;
  MachineId: string;
  Expiydate:string;
  InventoryFloor:number;
  Drug: {
    id: string;
    DrugName: string;
    DrugStatus: boolean;
    DrugImage?: string;
    CreatedAt: string;
    UpdatedAt: string;
  };
};
