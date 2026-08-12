import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());

const bookSchema=new mongoose.Schema({
  title:{type:String,required:true,trim:true},
  author:{type:String,required:true,trim:true},
  category:{type:String,required:true,trim:true},
  rating:{type:Number,min:0,max:5,default:0}
},{timestamps:true});
const Book=mongoose.model("Book",bookSchema);

app.get("/api/health",(req,res)=>res.json({ok:true}));

app.get("/api/books",async(req,res)=>{
  try{
    const {search="",category=""}=req.query;
    const filter={};
    if(search) filter.$or=[
      {title:{$regex:search,$options:"i"}},
      {author:{$regex:search,$options:"i"}}
    ];
    if(category) filter.category=category;
    res.json(await Book.find(filter).sort({createdAt:-1}));
  }catch(e){res.status(500).json({message:e.message});}
});

app.post("/api/books",async(req,res)=>{
  try{res.status(201).json(await Book.create(req.body));}
  catch(e){res.status(400).json({message:e.message});}
});

app.put("/api/books/:id",async(req,res)=>{
  try{
    const book=await Book.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
    if(!book)return res.status(404).json({message:"Book not found"});
    res.json(book);
  }catch(e){res.status(400).json({message:e.message});}
});

app.delete("/api/books/:id",async(req,res)=>{
  try{
    const book=await Book.findByIdAndDelete(req.params.id);
    if(!book)return res.status(404).json({message:"Book not found"});
    res.json({message:"Book deleted"});
  }catch(e){res.status(500).json({message:e.message});}
});

app.post("/api/books/demo",async(req,res)=>{
  try{
    await Book.insertMany([
      {title:"Atomic Habits",author:"James Clear",category:"Self-Help",rating:4.8},
      {title:"The Alchemist",author:"Paulo Coelho",category:"Fiction",rating:4.6},
      {title:"Clean Code",author:"Robert C. Martin",category:"Technology",rating:4.7},
      {title:"Deep Work",author:"Cal Newport",category:"Productivity",rating:4.5}
    ]);
    res.status(201).json({message:"Demo books added"});
  }catch(e){res.status(500).json({message:e.message});}
});

const PORT=process.env.PORT||5000;
mongoose.connect(process.env.MONGODB_URI)
.then(()=>app.listen(PORT,()=>console.log(`Server: http://localhost:${PORT}`)))
.catch(e=>{console.error("MongoDB connection failed:",e.message);process.exit(1);});
