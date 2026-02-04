import "express";

declare module "express" {
    export interface Request {
        user?: {
            userId: string;
            role: string;
            sub: string;
            [key: string]: any;
        };
    }
}
