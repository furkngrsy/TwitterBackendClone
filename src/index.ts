import express from 'express';
import userRoutes from './routes/userRoutes';
import tweetRoutes from './routes/tweetRoutes';
import authRoutes from './routes/authRoutes';



const app = express();
const port = 3000;

app.use(express.json());
app.use('/user', userRoutes);   
app.use('/tweet', tweetRoutes);   
app.use('/auth', authRoutes);   



app.get('/' , (req,res) =>{
    res.send("Welcome Twitter!");
})

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})