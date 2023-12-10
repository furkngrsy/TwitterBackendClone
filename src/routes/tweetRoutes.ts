import {Router} from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from "jsonwebtoken";


const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = "SUPER SECRET";



//create tweet
router.post('/', async (req, res) => {
    const { content, image} = req.body;

    //Authentication
    const authHeader = req.headers['authorization'];
    const jwtToken = authHeader?.split(' ')[1];

    if(!jwtToken){
        return res.sendStatus(401);
    }

    try{
        const payload = (await jwt.verify(jwtToken, JWT_SECRET)) as {
            tokenId : number;
        };
        const dbToken = await prisma.token.findUnique({
            where : {id : payload.tokenId},
            include : {user : true}
        });
        //console.log(dbToken);

        if(!dbToken?.valid){
            return res.status(401).json({ error : 'API token invalid.'});
        }

        if(dbToken.expiration < new Date()){
            return res.status(401).json({ error : 'API token expired.'});
        }

        try {
            const result = await prisma.tweet.create({
            data: {
                content,
                image,
                userId: dbToken.userId
            },
            });

            return res.status(200).json({result});

        } catch (e) {
            return res.status(401).json({ error: 'Something went wrong!' });
        }

    }catch(e){
        return res.sendStatus(401);
    }

    
});
//list tweet
router.get('/' , async (req,res) =>{
    const allTweet = await prisma.tweet.findMany({
        include : {
            user : {
                select : {
                    id : true, 
                    name : true, 
                    username : true, 
                    image : true
                }
            }
        }
    });
    res.json(allTweet);
});
//get one tweet
router.get('/:id' , async (req,res) =>{
    const {id} = req.params;
    const tweet = await prisma.tweet.findUnique({
        where : {id : Number(id)}, 
        include : {user : true}});
    if(!tweet){
        return res.status(400).json({ error: `Can't find a tweet` });
    }    
    res.json(tweet);
});
//update tweet
router.put('/:id' , async (req,res) =>{
    const {id} = req.params;
    res.status(501).json({error : `Not Implemented: ${id}`});
});

//delete tweet
router.delete('/:id' , async (req,res) =>{
    const {id} = req.params;
    try{
        await prisma.tweet.delete({
            where : {id : Number(id)},
        });
        res.status(200).json({error : `Deleted the tweet.`});
    }catch(e){
        res.status(400).json({error : `No tweet found matching the given id.`});
    }
})

export default router;