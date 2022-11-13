export interface CustomResourceResult {
    PhysicalResourceId?: string,
    Data?: {
        [Key: string]: any;
    } | undefined,
    NoEcho?: boolean | undefined,
    Status: "SUCCESS" | "FAILED",
    Reason?: string
}