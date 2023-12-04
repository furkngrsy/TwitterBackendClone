import {Router} from 'express';
import { PrismaClient } from '@prisma/client';


const router = Router();
const prisma = new PrismaClient();


//create tweet
router.post('/', async (req, res) => {
    const { content, image, userId} = req.body;
    try {
        const result = await prisma.tweet.create({
        data: {
            content,
            image,
            userId
        },
        });
        res.json(result);
    } catch (e) {
    res.status(400).json({ error: 'Something went wrong!' });
    }
});
//list tweet
router.get('/' , async (req,res) =>{
    const allTweet = await prisma.tweet.findMany({include : {user : {select : {id : true, name : true, username : true, image : true}}}});
    res.json(allTweet);
});
//get one tweet
router.get('/:id' , async (req,res) =>{
    const {id} = req.params;
    const tweet = await prisma.tweet.findUnique({where : {id : Number(id)}})
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