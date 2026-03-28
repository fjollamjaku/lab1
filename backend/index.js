const express =require('express')

const app = express()
const cors = require("cors")
app.use(cors());

app.use(express.json());

const db = require('./models')

//Routers

const authRouter = require('./routes/auth')
app.use('/auth', authRouter)

const postRouter = require('./routes/Posts')
app.use('/posts', postRouter)

db.sequelize.sync().then(()=>{
   app.listen(3001,()=>{
    console.log("server running on port 3001")
}) 
})
