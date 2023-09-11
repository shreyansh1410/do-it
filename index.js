import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let newListItems=[];

app.get("/", (req,res) => {
    let currentDate = new Date();
    let day = currentDate.getDay();
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    res.render("home.ejs", {date:currentDate, options:options, listItemArray: newListItems});
});

app.post("/", (req,res) => {
    let newitem = req.body.newitem;
    newListItems.push(newitem);
    res.redirect("/");
});

app.get("/work", (req,res) => {
    let currentDate = new Date();
    let day = currentDate.getDay();
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    res.render("work.ejs", {date:currentDate, options:options, listItemArray: newListItems});
});

app.listen(port, () =>{
    console.log(`Server running on port ${port}`);
});