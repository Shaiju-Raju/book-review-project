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

app.post("/submit", async (req, res) => {
    const title = req.body.title;
    const author = req.body.author;
    const rating = req.body.rating;
    const review = req.body.review;

    console.log(title, author, rating, review)

     await db.query(
        "INSERT INTO book_review (title, author, rating, review) VALUES ($1, $2, $3, $4)",
    [title, author, rating, review]);
    res.redirect("/")
} )






app.listen(port, ()=> {
    console.log(`Server running on port ${port}`);
})