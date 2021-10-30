//ignore jshint
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const _= require("lodash");
const date = require(__dirname + "/date.js");



const app = express();
mongoose.connect("mongodb+srv://admin-sonai:sonai1234@cluster0.5l6po.mongodb.net/todolistDB", {useNewUrlParser: true});

// const items = ["Schedule your task"];
// const workItems = [];
const itemSchema = {
    name: String
};
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
    name: "Welcome to the ToDoList!"
});
// const item2 = new Item({
//     name: "Hit the + button to add new task."
// });
// const item3 = new Item({
//     name: "<-- Hit this to delete a task."
// });
const  defaultItems= [item1];

const listSchema ={
    name : String,
    items: [itemSchema]
}
const List = mongoose.model("List", listSchema);


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.get("/", (req,res)=>{


        Item.find({}, function(err, foundItems){
            if(foundItems.length ===0){
                Item.insertMany(defaultItems,function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Successfully saved!");
                    }
                });
                res.redirect("/");// this redirect go to our home rout and check whether the the database is null or not
            }
            res.render("list",{ listTitle : "Today", newListItems: foundItems});// then its come here and render this items
        });

        // let day = date.getData();
       
});

app.get('/:customListName', function(req,res){
   const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                res.render("list", {listTitle: foundList.name, newListItems:foundList.items})
            }
        }
    });
    
});
// here the data will be stored into this variable and redirect to the home route and then the home rout will 
//triggered the hole ejs data
app.post("/", (req,res)=>{
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    } 
});

app.post("/delete", (req,res)=>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId, function(err, docs){
            if(err){
                console.log(err);
            }else{
                console.log("deleted");
            }
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items:{_id:checkedItemId}}}, function(err, foundList) {
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }
   
});
app.get("/work", (req,res)=>{
    res.render("list", { listTitle: "Work List", newListItems: workItems});
});

app.listen(process.env.PORT || 8000 , ()=>{
    console.log("Port is running on 8000.");
});