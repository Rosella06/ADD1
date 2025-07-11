export type inventorytype = {
  id: string;
  InventoryPosition: number;
  Min: number;
  Max: number;
  InventoryQty: number;
  InventoryStatus: boolean;
  DrugId: string;
  MachineId: string;   // ต้องมีตรงนี้
  Expiydate: string;
  InventoryFloor: number;
  Drug: {
    id: string;
    DrugName: string;
    DrugStatus: boolean;
    DrugImage?: string;
    CreatedAt: string;
    UpdatedAt: string;
  };
};

export type machinetype = {
  id: string;
  MachineName: string;
  MachineStatus: string;
  IP: string;
};
