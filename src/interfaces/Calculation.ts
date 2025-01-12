export enum CalculationStatusType{
    READY,
    RUNNING, 
    PAUSED, 
    STOPPED,
    ERROR
}

export interface Calculation{
    status: CalculationStatusType,
    currentX: number
}