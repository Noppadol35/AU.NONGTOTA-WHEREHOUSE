export interface CustomerData {
    name: string;
    licensePlate: string;
    carType: string;
    phoneNumber?: string;
}
export declare class CustomerService {
    /**
     * หาลูกค้าจากทะเบียนรถ หรือสร้างใหม่ถ้าไม่มี
     */
    static findOrCreateCustomer(customerData: CustomerData): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        notes: string | null;
        phoneNumber: string;
        carType: string | null;
        licensePlate: string | null;
    }>;
    /**
     * ตรวจสอบและแก้ไข JobOrder ที่มีข้อมูลลูกค้าไม่ตรงกัน
     */
    static fixJobOrderCustomers(): Promise<{
        fixedCount: number;
    }>;
    /**
     * ดึงข้อมูลลูกค้าทั้งหมดพร้อมสถิติ
     */
    static getAllCustomersWithStats(): Promise<{
        id: number;
        customerName: string;
        phoneNumber: string;
        carType: string;
        licensePlate: string;
        totalJobs: number;
        totalSpent: number;
        lastVisit: string | undefined;
        favoriteServices: any[];
        branch: string;
        status: "active" | "vip";
    }[]>;
}
//# sourceMappingURL=customerService.d.ts.map