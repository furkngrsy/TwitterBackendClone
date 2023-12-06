import {Router} from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();
const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;

function generateEmailToken(): string{
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

router.post("/login", async (req,res) => {
    const {email} = req.body;
    const emailToken = generateEmailToken();
    const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000);

    try{
        const createdToken = await prisma.token.create({
            data: {
                type: "EMAIL",
                emailToken,
                expiration,
                user : {
                    connectOrCreate: {
                        where : {email},
                        create : {email}
                    },
                },
            },
        });
    
        console.log(createdToken);
        res.sendStatus(200);

    }catch(e){
        console.log(e);
        res.sendStatus(404).json({error: "Couldn't start the authentication process."});
    }
    
});

router.post("/authenticate", async (req,res) => {

    
})


export default router;