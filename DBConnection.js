var mysql = require('mysql');
  class DataBase {
 
  constructor(){ 
    this.con = mysql.createConnection({
        host:'localhost',
        user:'ipfs_app',
        password:'YEXVGgS0BerBCS8t',
        database:"ipfs_file_db"
    
    });
this.con.connect(function(err){
    if(err) throw err;
    console.log('Connected!');
});
  }
CreateFileTable(){
var sql= `CREATE TABLE IF NOT EXISTS FileDataBase (
    hash VARCHAR(256) PRIMARY KEY ,
    name VARCHAR(256) NOT NULL
    )`;
    this.con.query(sql, (err,res,fields)=>{
        if(err){
            console.log(err.message);
        }
        console.log('Created Table FileDataBase');
        return res;
    });

}
AddFile(data,cb){
    var sql = 'Insert into FileDataBase (hash,name) Values (?,?)';
    this.con.query(sql,[data.hash,data.name],(err,res,fields)=>{
        if(err){
            console.log('Error in adding into chatdatabase', err);
        } 
        cb(err,res,fields);
    })
}
GetAllFiles(cb){
var sql = "Select * from FileDataBase";
this.con.query(sql,(err,results,fields)=>{
    cb(err,results,fields);
});
}


}


module.exports = DataBase;