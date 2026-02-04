import app from "./app";
import { PrismaClient } from "@prisma/client";

// GLOBAL FIX: Handle BigInt serialization for JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
