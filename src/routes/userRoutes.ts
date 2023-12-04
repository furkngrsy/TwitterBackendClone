import {Router} from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
//create user
router.post('/', async (req, res) => {
    const { email, name, username } = req.body;
    try {
      const result = await prisma.user.create({
        data: {
          email,
          name,
          username,
          bio: "Hello, I'm new on Twitter",
        },
      });
      console.log(email, name, username);
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: 'Username and email should be unique' });
    }
  });
//list user
router.get('/' , async (req,res) =>{
    const allUser = await prisma.user.findMany();
    res.json(allUser);
});
//get one user
router.get('/:id' , async (req,res) =>{
    const {id} = req.params;
    const user = await prisma.user.findUnique({
        where : {id : Number(id)},
        include : {tweet : true}
    });
    if(!user){
        return res.status(400).json({ error: `Can't find a tweet` });
    }    
    res.json(user);
});
//update user
router.put('/:id' , async (req,res) =>{
    const {id} = req.params;
    const {bio, name, image} = req.body;
    try{
        const result = await prisma.user.update({
            where : {id : Number(id)},
            data : {bio,name,image},
        });
        res.json(result);
    }catch(e){
        res.status(400).json({error : `Failed to update the user.`});
    }
});

//delete user
router.delete('/:id' , async (req,res) =>{
    const {id} = req.params;
    try{
        await prisma.user.delete({
            where : {id : Number(id)},
        });
        res.status(200).json({error : `Deleted the user.`});
    }catch(e){
        res.status(400).json({error : `No user found matching the given id.`});
    }
});

export default router;