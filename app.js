//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true})

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item0 = new Item ({
  name: "Welcome to your to-do list!"
});

const item1 = new Item ({
  name: "Hit the + button to add a new item."
});

const item2 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item0, item1, item2];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

  Item.find({}, (err, foundItems) => {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to database!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });

});

app.get("/:customListName" , (req, res) => {
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, (err, foundList) => {
    if (!err) {
      if(!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });


});

app.post("/", (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", (req, res) => {
  const checkedItemID = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemID, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Item deleted successfully.");
      res.redirect("/");
    }
  });

});



app.get("/work", (req, res) => {
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
