import prisma from './prisma';

export interface CustomerData {
  name: string;
  licensePlate: string;
  carType: string;
  phoneNumber?: string;
}

export class CustomerService {
  static async findOrCreateCustomer(customerData: CustomerData) {
    try {
      let customer = await prisma.customer.findFirst({
        where: {
          licensePlate: customerData.licensePlate,
        },
      });

      if (customer) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: {
            name: customerData.name,
            carType: customerData.carType,
            phoneNumber: customerData.phoneNumber || customer.phoneNumber,
            updatedAt: new Date(),
          },
        });
      } else {
        customer = await prisma.customer.create({
          data: {
            name: customerData.name,
            licensePlate: customerData.licensePlate,
            carType: customerData.carType,
            phoneNumber: customerData.phoneNumber || "",
          },
        });
      }

      return customer;
    } catch (error) {
      console.error("Error in findOrCreateCustomer:", error);
      throw error;
    }
  }

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
        let totalSpent = 0;
        
        for (const job of customer.jobOrders) {
          try {
            const bill = await prisma.bill.findFirst({
              where: {
                jobOrderId: job.id,
                status: "PAID"
              },
              orderBy: { createdAt: "desc" },
              select: { grandTotal: true }
            });
            
            if (bill && bill.grandTotal) {
              totalSpent += bill.grandTotal;
            } else {
              const itemTotal = job.items.reduce((itemSum, item) => {
                return itemSum + item.unitPrice * item.qty;
              }, 0);
              totalSpent += itemTotal;
            }
          } catch (error) {
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

        const serviceCount = new Map();
        customer.jobOrders.forEach((job) => {
          const service = job.jobDetail || "บริการทั่วไป";
          serviceCount.set(service, (serviceCount.get(service) || 0) + 1);
        });

        const favoriteServices = Array.from(serviceCount.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([service]) => service);

        let status: "active" | "inactive" | "vip" = "active";
        if (totalJobs >= 10 && totalSpent >= 50000) {
          status = "vip";
        } else if (totalJobs === 0) {
          status = "active";
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
          branch: "สาขาหลัก",
          status,
        };
      });
      
      const customersWithStats = await Promise.all(customerPromises);
      return customersWithStats;
    } catch (error) {
      console.error("Error in getAllCustomersWithStats:", error);
      throw error;
    }
  }
}
