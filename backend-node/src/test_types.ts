import { Prisma } from "@prisma/client";

const where: Prisma.productsWhereInput = {
    active: true
};

console.log(where);
