export type prescriptionType = {
  id: string,
  userId: string,
  prescriptionNo: string,
  prescriptionDate: string,
  hn: string,
  an: string,
  patientName: string,
  wardCode: string,
  wardDesc: string,
  priorityCode: string,
  priorityDesc: string,
  status: string,
  createdAt: string,
  updatedAt: string,
  orders: ordersType[]

}

export type ordersType = {
  id: string,
  orderItemName: string,
  quantity: number,
  unitCode: string,
  command: string,
  status: string,
  floor: number,
  position: number,
  slot: string,
  prescriptionId: string,
  drugId: string,
  machineId: string,
  createdAt: string,
  updatedAt: string,
  drug: drudinfotype
}

type drudinfotype = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  drugCode: string;
  drugName: string;
  drugStatus: boolean;
  drugImage: string | null;
}

