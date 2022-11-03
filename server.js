const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/',async (request, response)=>{
    db.collection('todos').find().toArray()
    .then(data => {
        db.collection('todos').countDocuments({completed: false})
        .then(itemsLeft => {
            console.log(itemsLeft)
            response.render('index.ejs', { items: data, left: itemsLeft})
        })
    })
    .catch(error => console.error(error))
})

/*
   24. app.get => asynchroniczna funkcja przybierająca dwie wartości (request i response).
   25. idz do bazy danych i znajdz kolekcję o nazwie 'todos', znajdz wszystkie dokumenty z tej bazy i stwórz z nich array
   26. Następnie pozyskany przez nas array zamieniamy na obiekt 'data', którym będziemy się posługiwać
   27. Idz do bazy danych o nazwie 'todos' i policz znajdujące się w niej dokumenty które spełniają podany warunek === countDocuments({warunek})
   28. Następnie otrzymaną przez nas liczbę dokumentów zamieniamy na obiekt 'itemsLeft'
   30. Przekazujemy odpowiedź dla przeglądarki w formie pliku ejs w którym przekazujemy informacje o obiektach (items: data oraz left: itemsLeft)
*/



app.post('/addTodo', (request, response) => {
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false, category: request.body.todoCategory.toLowerCase()},
    {upsert: false})
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})


app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/showCategory', (request, response) => {
    db.collection('todos').find().toArray()
    .then(data => {
        console.log(data)
    })
    .catch(error => console.error(error))
})

app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})