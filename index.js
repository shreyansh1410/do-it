import express from "express";
import bodyParser from "body-parser";
import { connect, Schema, model } from 'mongoose';
import _ from "lodash";

const app = express();
const port = 3000;

app.set('view engine' , 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));
async function main(){
    await connect('mongodb+srv://shreyansh1410:AxEAMxYxr5VoSvdQ@todolistapp.t4fa6ei.mongodb.net/toDoListDB');
}

const itemSchema = new Schema({
    name: String
});

const listSchema = {
    name:String,
    items:[itemSchema]
  }

const Item = model("Item", itemSchema);

const List = model("List", listSchema);

// let newListItems=[];

const item1 = new Item ({
    name: "Welcome to your toDoList app"
});

const item2 = new Item({
    name: "Hit the + button to add a new note"
});

const item3= new Item({
    name: "<--- Hit this button to delete the entry"
});

const defaultItems = [item1, item2, item3];

let currentDate = new Date();
let day = currentDate.getDay();
let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

app.get("/", (req,res) => {
    
    Item.find({}).then(function(foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems)
            .then(function(){
            console.log("successfully inserted database to mongoose");
        })
            .catch(function(err){
            console.log(err);
        });
        res.redirect("/");
    }else{
        res.render("list.ejs", {listTitle: "Home", date: currentDate, options: options, listItemArray: foundItems });
    }        
    })
      .catch(function(err){
        console.log(err);
      });
    // res.render("home.ejs", {date:currentDate, options:options, listItemArray: newListItems});
});

app.get("/:customListName", (req,res) => {
    // console.log(req.params);
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName})
        .then((foundList) => {
            if(foundList === null){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
                console.log("doesn't exist");
            }else{
                res.render("list.ejs", {listTitle: foundList.name, date: currentDate, options: options, listItemArray: foundList.items});
                console.log("exists");
            }
        });
    
});

// app.get("/work", (req,res) => {
//     let currentDate = new Date();
//     let day = currentDate.getDay();
//     let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//     res.render("work.ejs", {date:currentDate, options:options, listItemArray: newListItems});
// });

app.post("/", (req,res) => {
    let newitem = req.body.newitem;
    let listName = req.body.list;
    const item = new Item({
        name: newitem
    });
    // res.redirect("/" + listName);
    if(listName==="Home"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}).then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
});

app.post("/delete" , (req,res) =>{
    console.log(req.body.checkbox);
    const itemIdToDelete = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Home"){
        Item.findByIdAndDelete(itemIdToDelete)
        .then((deletedItem) => {
        if (deletedItem) {
          console.log('Deleted item:', deletedItem);
        } else {
          console.log('Item not found.');
        }
      })
      .catch((error) => {
        console.error('Error deleting item:', error);
      });
      res.redirect("/");
    }else{
        List.findOne({name: listName}).then(foundList => {
            foundList.items.pull({_id: req.body.checkbox});
            foundList.save();
            res.redirect("/" + listName);
        }).catch(err => {
            console.log(err);
        });
    }
});

app.listen(port, () =>{
    console.log(`Server running on port ${port}`);
});