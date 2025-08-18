export type inventorytype = {
 id: string
  floor: number
  position: number
  quantity: number
  min: number
  max: number
  status: boolean
  expiryDate: string
  drugId: string
  machineId: string
  drug: {
    id: string;
    drugName: string;
    drugStatus: boolean;
    drugImage?: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type machinetype = {
  id: string;
  machineName: string;
  status: string;
  ipAddress: string;
};
