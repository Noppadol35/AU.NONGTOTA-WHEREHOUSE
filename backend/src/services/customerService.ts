import { prisma } from "../lib/prisma";

export interface CustomerData {
    name: string;
    licensePlate: string;
    carType: string;
    phoneNumber?: string;
}

export class CustomerService {
    /**
     * หาลูกค้าจากทะเบียนรถ หรือสร้างใหม่ถ้าไม่มี
     */
    static async findOrCreateCustomer(customerData: CustomerData) {
        try {
            // หาลูกค้าจากทะเบียนรถ
            let customer = await prisma.customer.findFirst({
                where: {
                    licensePlate: customerData.licensePlate,
                },
            });

            if (customer) {
                // อัพเดทข้อมูลลูกค้าถ้าจำเป็น
                customer = await prisma.customer.update({
                    where: { id: customer.id },
                    data: {
                        name: customerData.name,
                        carType: customerData.carType,
                        phoneNumber: customerData.phoneNumber || customer.phoneNumber,
                        updatedAt: new Date(),
                    },
                });
                console.log(
                    `อัพเดทลูกค้า: ${customer.name} (${customer.licensePlate})`
                );
            } else {
                // สร้างลูกค้าใหม่
                customer = await prisma.customer.create({
                    data: {
                        name: customerData.name,
                        licensePlate: customerData.licensePlate,
                        carType: customerData.carType,
                        phoneNumber: customerData.phoneNumber || "",
                    },
                });
                console.log(
                    `สร้างลูกค้าใหม่: ${customer.name} (${customer.licensePlate})`
                );
            }

            return customer;
        } catch (error) {
            console.error("Error in findOrCreateCustomer:", error);
            throw error;
        }
    }

    /**
     * ตรวจสอบและแก้ไข JobOrder ที่มีข้อมูลลูกค้าไม่ตรงกัน
     */
    static async fixJobOrderCustomers() {
        try {
            console.log("เริ่มตรวจสอบและแก้ไข JobOrder customers...");

            // ดึง JobOrder ทั้งหมดที่มีข้อมูลลูกค้า
            const jobOrders = await prisma.jobOrder.findMany({
                where: {
                    customerName: { not: null as any },
                    licensePlate: { not: null as any },
                },
                select: {
                    id: true,
                    customerId: true,
                    customerName: true,
                    licensePlate: true,
                    carType: true,
                    phoneNumber: true,
                },
            });

            let fixedCount = 0;

            for (const jobOrder of jobOrders) {
                if (!jobOrder.customerName || !jobOrder.licensePlate) continue;

                try {
                    // หาหรือสร้างลูกค้า
                    const customer = await this.findOrCreateCustomer({
                        name: jobOrder.customerName as string,
                        licensePlate: jobOrder.licensePlate as string,
                        carType: jobOrder.carType || "ไม่ระบุ",
                        phoneNumber: jobOrder.phoneNumber,
                    });

                    // อัพเดท JobOrder ให้ชี้ไปที่ลูกค้าที่ถูกต้อง
                    if (jobOrder.customerId !== customer.id) {
                        await prisma.jobOrder.update({
                            where: { id: jobOrder.id },
                            data: { customerId: customer.id },
                        });
                        fixedCount++;
                        console.log(
                            `แก้ไข JobOrder ${jobOrder.id}: customerId ${jobOrder.customerId} -> ${customer.id}`
                        );
                    }
                } catch (error) {
                    console.error(`Error fixing JobOrder ${jobOrder.id}:`, error);
                }
            }

            console.log(`เสร็จสิ้น: แก้ไข ${fixedCount} รายการ`);
            return { fixedCount };
        } catch (error) {
            console.error("Error in fixJobOrderCustomers:", error);
            throw error;
        }
    }

    /**
     * ดึงข้อมูลลูกค้าทั้งหมดพร้อมสถิติ
     */
    static async getAllCustomersWithStats() {
        try {
            const customers = await prisma.customer.findMany({
                include: {
                    jobOrders: {
                        include: {
                            items: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            const customerPromises = customers.map(async (customer) => {
                const totalJobs = customer.jobOrders.length;
                // คำนวณ totalSpent จาก grandTotal ของ Bill
                let totalSpent = 0;
                for (const job of customer.jobOrders) {
                    try {
                        // ดึงข้อมูล Billing เพื่อหาค่า grandTotal
                        const bill = await prisma.bill.findFirst({
                            where: {
                                jobOrderId: job.id,
                                status: "PAID"
                            },
                            orderBy: { createdAt: "desc" },
                            select: { grandTotal: true }
                        });
                        
                        // ใช้ grandTotal ถ้ามี หรือคำนวณจาก items ถ้าไม่มี
                        if (bill && bill.grandTotal) {
                            totalSpent += bill.grandTotal;
                        } else {
                            // Fallback: คำนวณจาก items
                            const itemTotal = job.items.reduce((itemSum, item) => {
                                return itemSum + item.unitPrice * item.qty;
                            }, 0);
                            totalSpent += itemTotal;
                        }
                    } catch (error) {
                        console.error(`Error calculating total for job ${job.id}:`, error);
                        // Fallback: คำนวณจาก items
                        const itemTotal = job.items.reduce((itemSum, item) => {
                            return itemSum + item.unitPrice * item.qty;
                        }, 0);
                        totalSpent += itemTotal;
                    }
                }

                const lastVisit =
                    customer.jobOrders.length > 0
                        ? customer.jobOrders.sort(
                            (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime()
                        )[0]?.createdAt || customer.createdAt
                        : customer.createdAt;

                // หาบริการที่ใช้บ่อย
                const serviceCount = new Map();
                customer.jobOrders.forEach((job) => {
                    const service = job.jobDetail || "บริการทั่วไป";
                    serviceCount.set(service, (serviceCount.get(service) || 0) + 1);
                });

                const favoriteServices = Array.from(serviceCount.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([service]) => service);

                // กำหนดสถานะ
                let status: "active" | "inactive" | "vip" = "active";
                if (totalJobs >= 10 && totalSpent >= 50000) {
                    status = "vip";
                } else if (totalJobs === 0) {
                    status = "active"; // ลูกค้าใหม่จะเป็น active
                }

                return {
                    id: customer.id,
                    customerName: customer.name,
                    phoneNumber: customer.phoneNumber || "ไม่ระบุ",
                    carType: customer.carType || "ไม่ระบุ",
                    licensePlate: customer.licensePlate || "ไม่ระบุ",
                    totalJobs,
                    totalSpent,
                    lastVisit: lastVisit.toISOString().split("T")[0],
                    favoriteServices:
                        favoriteServices.length > 0
                            ? favoriteServices
                            : ["ยังไม่เคยใช้บริการ"],
                    branch: "สาขลัก",
                    status,
                };
            });
            
            // รอให้ async operations เสร็จสิ้น
            const customersWithStats = await Promise.all(customerPromises);
            return customersWithStats;
        } catch (error) {
            console.error("Error in getAllCustomersWithStats:", error);
            throw error;
        }
    }
}
