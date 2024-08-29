let mongo = require('mongodb');
let { MongoClient } = require('mongodb');
let mongoUrl = "mongodb+srv://sanjuzom:z9qRX07wtVw8iK2Q@cluster0.w7yd8em.mongodb.net/internmay?retryWrites=true&w=majority";
let client = new MongoClient(mongoUrl)

async function dbConnect(){
    await client.connect()
}

let db = client.db('internmay');

async function getData(colName,query){
    let output = [];
    try{
        const cursor = db.collection(colName).find(query);
        for await(const data of cursor){
            output.push(data)
        }
        cursor.closed
    } catch(err){
        output.push({"Error":"Error in getData"})
    }
    return output
}

async function postData(colName,data){
    let output;
    
    try{
        await db.collection(colName).insertOne(data)
        output = {"response":"order Placed"}
    }
    catch(err){
        output = {"response":"error in post data"}
    }
    return output
}

async function updateOrder(colName,condition,data){
    let output;
    try{
        output = await db.collection(colName).updateOne(condition,data)
    }
    catch(err){
        output = {"response":"error in update data"}
    }
    return output
}
async function deleteOrder(colName,condition){
    let output;
    try{
        output = await db.collection(colName).deleteOne(condition)
    }catch(err){
        output = {"response":"Error in delete data"}
    }
    return output
}


module.exports = {
    dbConnect,
    getData,
    postData,
    updateOrder,
    deleteOrder
}