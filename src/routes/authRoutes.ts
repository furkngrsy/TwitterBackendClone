import {Router} from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import {sendEmailToken} from "../services/emailService";

const router = Router();
const prisma = new PrismaClient();
const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const API_TOKEN_EXPIRATION_HOURS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER SECRET';

console.log("JWT SECRET : ", process.env.JWT_SECRET);


function generateEmailToken(): string{
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateAuthToken(tokenId: number): string{
    const jwtPayload = {tokenId};

    return jwt.sign (jwtPayload, JWT_SECRET, {
        algorithm : 'HS256',
        noTimestamp : true,
    });
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

        await sendEmailToken(email, emailToken);
        res.sendStatus(200);

    }catch(e){
        console.log(e);
        res.sendStatus(404).json({error: "Couldn't start the authentication process."});
    }
    
});

router.post("/authenticate", async (req,res) => {
    const {email,emailToken} = req.body;

    const dbEmailToken = await prisma.token.findUnique({
        where: {
            emailToken,
        },
        include: {
            user :true,
        },
    });
    //console.log(dbEmailToken);
    if(!dbEmailToken || !dbEmailToken.valid){
        return res.status(401).json({error : 'Something went wrong!' });
    }

    if(dbEmailToken.user.email !== email){
        return res.status(401).json({error : 'Something went wrong!' });
        
    }

    if(dbEmailToken.expiration < new Date()){
        return res.status(404).json({error : 'Token expired!' });
    }  

    const expiration = new Date(new Date().getTime() + API_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000);

    const apiToken = await prisma.token.create({
        data : {
            type : "API",
            expiration,
            user : {
                connect : {
                    email,
                },
            },
        },
    });

    await prisma.token.update({
        where : {
            id : dbEmailToken.id
        },
        data : {
            valid : false
        },
    });

    const authToken = generateAuthToken(apiToken.id);
    res.json({authToken}); 
    
})


export default router;