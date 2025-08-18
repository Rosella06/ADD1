import { ordersType } from "./orderType";
import { Users } from "./user.type";

export type Prescription = {
  id: string;
  PrescriptionDate: string;
  Hn: string;
  An: string;
  PatientName: string;
  WardCode: string;
  WardDesc: string;
  PriorityCode: string;
  PriorityDesc: string;
  PresStatus: string; 
  UsedByUserId: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  Order: ordersType[]; 
  UsedBy: Users;   
};
