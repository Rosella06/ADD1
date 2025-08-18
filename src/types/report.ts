
export interface Prescription {
  Hn: string;
  PatientName: string;
}

export interface DrugInfo {
  DrugName: string;
  Drugcode: string;
}

export interface Inventory {
  Min: number;
  InventoryQty: number;
}

export interface ReportItem {
  UpdatedAt: string; 
  Machine: string; 
  Prescription: Prescription;
  DrugInfo: DrugInfo;
  Inventory?: Inventory; 
  OrderQty: number;   
}
