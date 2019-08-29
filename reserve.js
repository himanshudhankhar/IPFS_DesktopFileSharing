const { app, BrowserWindow } = require('electron')
const url = require('url');
const path = require('path');
var Promise = require("bluebird");
var cmd = require('node-cmd');
const {ipcMain} = require('electron');
var fs = require('fs');

var socket = require('socket.io-client')('http://localhost');
socket.on('connect',function(){
    console.log('Connected to Socket ....');
    socket.emit('Hi','Ho');
}); 

let win ;
////////////////////////////////////////////////////////
//now we have to use sockets and node-cmd to work upon the ipfs commands and connect with server
//again we have to use socket.io-client
//var cmd = require('node-cmd');

function Start(){
    // cmd.get('ipfs daemon',function(err,data,stderr){
    //     if(err || stderr){
    //         console.log('Error',err,stderr);
    //     }else{
    //         console.log('Daemon is running ....');
    //     }
    // }); //will not create any problem if daemon is already running
     cmd.run('ipfs daemon');
    console.log('Daemon is running');
    //  setTimeout(function(cb){
    //      cb();
    //     console.log('Daemon is Running')},2000);
    
    }
function getID(){
        var arr;
        var Id;
        //we need to make this synchroised synchroisation of this part is essential
     var getAsync = Promise.promisify(cmd.get,{ multiArgs: true, context: cmd });
     
        getAsync('ipfs swarm addrs local').then(data =>{
           
            arr = data[0].split('\n');
         console.log(arr);
         //now again we have to use a promise here to get the ID of that ipfs node
            var newGetAsync = Promise.promisify(cmd.get,{ multiArgs: true, context: cmd });
            newGetAsync('ipfs id').then(Data=>{
                Data= JSON.parse( JSON.stringify(Data[0]));
                var myJSONString = JSON.stringify(Data);
                var myEscapedJSONString = myJSONString.replace(/\\n/g, "")
                .replace(/\\'/g, "")
                .replace(/\\r/g, "\\r")
                .replace(/\\t/g, "")
                .replace(/\\b/g, "\\b")
                 .replace(/\\/g,"")
                .replace(/\\f/g, "\\f");
                myEscapedJSONString = myEscapedJSONString.substring(1,myEscapedJSONString.length -1);
                var new_data = JSON.parse( JSON.stringify( myEscapedJSONString));
               // console.log(myEscapedJSONString);
               // console.log('\n',new_data.ID);
                var neww_data = JSON.parse(new_data)
                //console.log(neww_data);
            Id = neww_data["ID"];
            socket.emit('MyID',{
                Addresses:arr,
                Id:Id,
                Name:'Himanshu'
            })
            }).catch(err=>{console.log('Error in getting Id of ipfs node',err)});
           }).catch(err=>{
               console.log('Error in getting addresses',err);
           })
       
     
      
    }

Start(); // it will start the daemon
setTimeout(()=>{
// get all the onlines ids and connect to them one by one
socket.emit('give_all_ids',{message:'give all ids'});

//now after some time means after getting all ids then i should respond with my id
 


// all others will be automatically connected to that address i think you dont need to connect to others they will connect to you once you comes online
// you sould have to give your id no doubt in that , but you should recieve the id of others also
//server should not broadcast it
// server should provide you the data of all those who are online
},2000); // getID ho gaya now we have make a function to accept to NewConnection and call to connect it

socket.on('GetAllIDs',function(daata){
     // now data will be an array
     console.log('Got all ids',daata);
     daata.arr.forEach(data => {
         
     
         
     
    var id = data.Id;
    var addr  = data.Addresses.map(ele =>{
      return ele+'/ipfs/'+id;
    })
    console.log(addr);
    var getAsync = Promise.promisify(cmd.get, { multiArgs: true, context: cmd });
    addr.forEach(element => {
      getAsync('ipfs swarm connect '+element).then(response=>{
        console.log(response);
      }).catch(err=>{
        console.log(err);
      })
      
    });
  }); // it may be a very long process so it surely send server its data 
// the whole process may take 10 secs at max
setTimeout(()=>{getID();},4000);

// this point will be the failure point in the near future

 // now it will give my id to the server

});



////////////////////////////////////////////
//now write a function to add a file to ipfs 
//file path will be required here
// how to get that filepath will be based on browse file 

function addFile(fileLocation){
    //cmd.get('ipfs add E:/IPFS_FileSharing/server.js',function(err,data,stderr){
        //make sure that we have made changes in fileLocation means for 
        fileLocation = fileLocation.replace(/\\/g, '/');
        console.log(fileLocation);
        // now problem here is that it can give error also
        // so we should have to use promise here 
        cmd.get('ipfs add '+fileLocation,function(err,data,stderr){    
        var arr = data.split(' ');
        //console.log(arr[1],arr[2]);
        return {
            filename:arr[2],
            hash:arr[1]
        }
    })
    }
/////////////////////////////////////////////////////////
//now we have to write a function to download a file from ipfs
function downloadFile(FileHash){
    var getAsync = Promise.promisify('cmd.get',{multiArgs:true,context:cmd});
    getAsync('ipfs get '+FileHash).then(data=>{
        console.log(data[0]);
    }).catch(err=>{
        console.log(err);
    })
};
//now how this function will be called is a problem , we have to use ipc from the fromtend to 
// to download a file
// set up ipc at both ends to carry out tests for adding a file as well as downloading a file

//setup ipc connection and then  add a file to ipfs and then download a file from ipfs with a given hash

//
ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg); 
 
    // Event emitter for sending asynchronous messages
    event.sender.send('asynchronous-reply', 'async pong')
 })
 
 // Event handler for synchronous incoming messages
 ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg) 
 
    // Synchronous event emmision
    event.returnValue = 'sync pong'
 });
 
 ipcMain.on('addFile',(event,arg)=>{
     // arg is  a json object 
     console.log(typeof(arg),arg);
     var name =arg.file_name;
     var path_file = arg.filePath[0];
     console.log('adding file to ipfs '+name);
     var fileLocation = path_file.replace(/\\/g, '/');
     console.log(fileLocation);
     var getAsync = Promise.promisify(cmd.get,{multiArgs:true,context:cmd});

      // we have to make a async promise here  
    //you have not sent the response 
    getAsync('ipfs add '+fileLocation).then(data=>{
        
        //now you have added a file , you should publish it to the server through socket.io
        console.log('tt',data);
        var rss = data[0].split(' ');
        rss[2]=name;
        socket.emit('Add_New_File',{fileHash:rss[1],fileName:name});
        console.log('rr',rss);
        // is there any need to send the name of sender // no need 
        //socket on server will recieve it and broadcast to all others that a new file has been uploaded and 
        //also store it in database
        //now whenever some one comes online it will send all the database to that new socket which hs been connected
        event.sender.send('AddFile',data[0]);
    }).catch(err=>{
        console.log('err' , err);
        event.sender.send('AddFile','Error while adding file to ipfs node');
    });

    
 });

socket.on('NewFileAdded',function(message){
    //message fileHash and fileName
    // now we have to notify our renderer process to show something new
    //how will it notify the 
    if(win!=null){
        win.webContents.send('NewFileAdded', message);
    }
});

socket.on('File_Added',function(message){
    if(win!=null){
        win.webContents.send('FileAdded', message);
    }

});

 //now we had set up the ipc connection between them 
 // how to use it to add a file to ipfs

setTimeout(()=>{
//now what we have to do 
socket.emit('GetAllFiles','getAllFiles');
},2000);

socket.on('GetAllFiles',function(message){
    //you get list of files now publish it to the renderer side
    //win can do that
    if(win!=null){
        console.log('All files DataBase ',message);
        win.webContents.send('AllFiles',message); // yes we will send it to all the renderer processes however there will be only one renderer process
    }
});


ipcMain.on('DownloadFile',(event,arg)=>{
    console.log(arg);
    var getAsync  = Promise.promisify(cmd.get,{multiArgs:true,context:cmd});

    //args will be the hash of that file it will be passed as a string
    getAsync('ipfs get '+arg.hash+' -o '+arg.name).then(data=>{
            //if we get data means we have successfully downloaded it
            console.log(data);
            if(win!=null){
            //    win.webContents.send('Error','success');
                win.webContents.send('FileDownloaded',data[0]);
            }
    }).catch(err=>{
        if(win!=null){
            win.webContents.send('Error',err);
        }
        console.log('Error while ipfs get hash', err);
    })
});

setTimeout(()=>{
    socket.emit('GetAllMessages','GetAllMessages');
},2000);

socket.on('GetAllMessages',function(message){
    if(win!=null){
        console.log('All Chat DataBase ',message);
        win.webContents.send('AllMessages',message); // yes we will send it to all the renderer processes however there will be only one renderer process
    }
});

socket.on('NewMessage',function(message){
    if(win!=null){
        console.log('New Message ',message);
        win.webContents.send('NewMessage',message); // yes we will send it to all the renderer processes however there will be only one renderer process
    }
});

socket.on('Message_Add_Error',function(message){
    if(win!=null){
        //console.log('New Message ',message);
        win.webContents.send('Error','Error while adding message to database probably an error on server side'); // yes we will send it to all the renderer processes however there will be only one renderer process
    }
});

ipcMain.on('NewMessage',(event,message)=>{
    socket.emit('NewMessage',message);
});



let winsec;

ipcMain.on('OpenVideo',(event,message)=>{
winsec=  new BrowserWindow({width:850,height:600});
winsec.loadURL('http://localhost:8080/ipfs/'+message.hash);


winsec.on('close',()=>{
    winsec = null;
})

});









function createWindow(){
    win  = new BrowserWindow({width:850,height:600,resizable:false,  icon: __dirname + '/.ico'});
    win.loadURL(url.format({
        pathname:path.join(__dirname,'iindex.html'),
        protocol:'file',
        slashes:true
    }))


win.on('close',()=>{
    win = null;
})
}

app.on('ready',createWindow); // for mac or darwin we have to put some more functions here
app.on('window-all-closed',()=>{
    if(process.platform!=='darwin'){
        app.quit();
    }
})

app.on('activate',()=>{
    if(win == null){
        createWindow();
    }
})
//now what we will need a BrowserWindow