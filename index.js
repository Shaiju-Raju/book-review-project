import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static("public"));

//Data Base Configuration
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();


//Function for Fetching data from database
async function book_review() {
    try {
        const result = await db.query("SELECT * FROM book_review")
        const books = result.rows
        return books
    } catch (err) {
        console.error("Error in Fetching data",err.message);
    }
};


//initial route
app.get("/", async (req, res) => {
    const books = await book_review();
    // console.log(books)
    res.render("index.ejs",{book_review: books});
});


app.get("/new-review",  (req, res) => {
    res.render("form.ejs");
});

app.get("/edit/:id", async (req, res) => {
    const id = req.params.id;
    const result = await db.query("SELECT * FROM book_review WHERE id=$1",[id]);
    const dataToEdit = result.rows[0];

    res.render("edit.ejs",{id:dataToEdit.id, title: dataToEdit.title, author: dataToEdit.author,
        rating: dataToEdit.rating, review: dataToEdit.review
    });

});


app.post("/submit", async (req, res) => {
    const title = req.body.title;
    const author = req.body.author;
    const rating = req.body.rating;
    const review = req.body.review;

    await db.query(
        "INSERT INTO book_review (title, author, rating, review) VALUES ($1, $2, $3, $4)",
    [title, author, rating, review]);
    res.redirect("/")
} )

app.post("/delete/:id", async (req,res) => {
    const id = req.params.id;

    try {
        await db.query("DELETE FROM book_review WHERE id=$1", [id]);
        res.redirect("/");
    } catch (err) {
        console.error("Unable to catch item from database", err.message);
    }  
})

app.post("/edit-submit", async (req, res) => {
    const data = {
        id: req.body.id,
        title: req.body.title,
        author: req.body.author,
        rating: req.body.rating,
        review: req.body.review
    };

    await db.query(
        "UPDATE book_review SET title=$1, author=$2, rating=$3, review=$4 WHERE id=$5",
        [data.title,data.author,data.rating,data.review,data.id]
     );

     res.redirect("/");
})




app.listen(port, ()=> {
    console.log(`Server running on port ${port}`);
})