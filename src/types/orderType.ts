export type orderType = {
  id: string,
  PrescriptionId: string,
  OrderItemId: string,
  OrderItemName: string,
  OrderQty: number,
  OrderUnitcode: string,
  Machine: string,
  OrderStatus: string,
  Slot?: string,
  CreatedAt: string,
  UpdatedAt: string
  DrugInfo: {
    DrugImage?: string
  },
  warning?: {
    message: string,
    inventoryRemaining: number,
    orderQty: number
  }


}