// now here we have to setup a ipc connection with main process and then 

// first what will i do 
// i will take make referneces
const {ipcRenderer} = require('electron')
const { dialog } = require('electron').remote;
console.log('in renderer process');
var files=[];
var file_name = document.getElementById('file_name');
var submit_btn  = document.getElementById('submit_btn');
var download_btn = document.getElementById('download_btn');
// what we should do here is that
// click on a btn , then electron browsefile dialog will open , then select a file 
// means file path of that file will be copied 
// and by ipc it will be sent to main process
// then ipc will run that ipfs add filepath command and will give a response 
// what is the response whether added or not // success chances depend upon the filePath
// is correct or not
submit_btn.addEventListener('click',()=>{
   event.preventDefault();
   if(file_name.value=='' || file_name.value==null){
      alert('Please Enter the file name to identify it on netwrok!!');
   }else{
   var filePath =   dialog.showOpenDialog({ properties: ['openFile'] });
    
console.log(filePath, typeof(filePath));
if(filePath!=null){
   

//i think that we should do it in a synchronized way;
var response ="a";   
  ipcRenderer.send('addFile', {filePath:filePath,file_name:file_name.value}  ); //give them only one file at a time
   //from there a response will come
    // now we will see what will the response here 
  
//    main process will send this information to the server about adding a new file;


//     console.log(response);
    //why does renderer process is not working here 
}
   }
},true);

ipcRenderer.on('AddFile',(event,arg)=>{
   alert('Your File has been uploaded to ipfs node '+arg); //instead of showing alert you should have to
   // update the list of known files to download
   // means 
});

ipcRenderer.on('NewFileAdded',(event,message)=>{
//there will an array which contains hash and name objects
//update that array
var file = {name:message.fileName,hash:fileHash};
files.push(file);
console.log(files);
var div = document.createElement('div')
div.innerHTML = '<div class="file_entry"><div class= "fileName">'+file.name+'</div><button class="downloads btn btn-large btn-primary download_btn" id = ' + file.hash + '>' + 'Download' + '</button></div>';
document.getElementById('lawda').appendChild(div)   ;
document.getElementById(file.hash).addEventListener('click',(event)=>{
event.preventDefault();
ipcRenderer.send('DownloadFile',  {hash:file.hash,name:file.name});
});
// now we have to re render it
});

ipcRenderer.on('FileAdded',(event,message)=>{
if(message.error){
   alert('Error while adding file into database '+ message.message.fileName);
}else{
   var file ={name:message.message.fileName,hash:message.message.fileHash};
   files.push(file);
   console.log(files);
   var div = document.createElement('div')
div.innerHTML = '<div class="file_entry"><div class= "fileName">'+file.name+'</div><button class="downloads btn btn-large btn-primary download_btn" id = ' + file.hash + '>' + 'Download' + '</button></div>';
document.getElementById('lawda').appendChild(div)   ;

document.getElementById(file.hash).addEventListener('click',(event)=>{
   event.preventDefault();
   ipcRenderer.send('DownloadFile', {hash:file.hash,name:file.name});
   });

}
//now we have to re render it // pick one element with id  and set its inner html 

});

ipcRenderer.on('AllFiles',(event,message)=>{
   files = message; // headache will be on server side
   //files = JSON.parse(files);
  // alert(message[0].name);
   message.forEach(file => {
      var div = document.createElement('div')
      div.innerHTML = '<div class="file_entry"><div class= "fileName">'+file.name+'</div><button class="downloads btn btn-large btn-primary download_btn" id = ' + file.hash + '>' + 'Download' + '</button></div>';
      document.getElementById('lawda').appendChild(div)   ;

   });
   document.getElementById("lawda").addEventListener("click",function(e) {
      e.preventDefault();
      if (e.target && e.target.matches("button")) {
       // e.target.className = "foo"; // new class name here
    //  console.log(e);  
    //  console.log(e.path[0].id);
    var hash = e.path[0].id;
    //now we got hash we can find its name from files array
      var fname;
      files.forEach(file=>{
         if(file.hash==hash){
            fname = file.name;
          
         }
      })

      ipcRenderer.send('DownloadFile', {name:fname,hash:hash } );
      }
    });
    
   // var myFunction = function() {
   //    //  var attribute = this.getAttribute("data-myattribute");
   //    //  alert(attribute);
   //    event.preventDefault();
   //    ipcRenderer.send('DownloadFile',   );       
   // };
   
//    for (var i = 0; i < classname.length; i++) {
//        classname[i].addEventListener('click', ()=>{
//  console.log(classname[i]);
//          alert(classname[i]);

//        }, false);
//    }
   // console.log('files',files);
   // // files.foreach(file => {
   // //    var div = document.createElement('div')
   // //    div.innerHTML = file.fileName
   // //    document.getElementById('lawda').appendChild(div)   ;
   // // });
   // console.log(typeof(files));
   // for ( var file in files){
   //    file=JSON.parse(JSON.stringify( file));
   //    console.log(file,typeof(file));
   //    var div = document.createElement('div')
   //        div.innerHTML = file.id;
   //        document.getElementById('lawda').appendChild(div)   ;
   //        console.log(typeof(file.id),file.id);
   // }


   // you have to make a mechanism to do render all above files
});



// download_btn.addEventListener('click',()=>{
//    event.preventDefault();
//    var Hash =document.getElementById('Hash').value;
//    ipcRenderer.send('DownloadFile', Hash  );
//    //now main process will send it the status of downloaded or error
// });


ipcRenderer.on('FileDownloaded',(event,args)=>{
   console.log('FileDownloaded');
   alert(args+'\nFile Downloaded success');
});

ipcRenderer.on('Error',(event,args)=>{
 //  alert('Error ',err);
 dialog.showErrorBox('Error',JSON.stringify( args));
});
var AllMessages=[];
ipcRenderer.on('AllMessages',(event,message)=>{
   AllMessages = message; // headache will be on server side
   //files = JSON.parse(files);
  // alert(message[0].name);
   message.forEach(file => {
      var div = document.createElement('div')
      //div.innerHTML = '<div class="file_entry"><div class= "fileName">'+file.name+'</div><button class="downloads btn btn-large btn-primary download_btn" id = ' + file.hash + '>' + 'Download' + '</button></div>';
      div.innerHTML = '<div class="chat_element"><p class="lineComponent">'+file.message+'</p><p class="nameComponent">'+file.name+'</p></div>';
      document.getElementById('chat').appendChild(div)   ;

   });
});

ipcRenderer.on('NewMessage',(event,message)=>{
   AllMessages.push(message);
   var div = document.createElement('div')
      //div.innerHTML = '<div class="file_entry"><div class= "fileName">'+file.name+'</div><button class="downloads btn btn-large btn-primary download_btn" id = ' + file.hash + '>' + 'Download' + '</button></div>';
      div.innerHTML = '<div class="chat_element"><p class="lineComponent">'+message.message+'</p><p class="nameComponent">'+' by '+message.name+'</p></div>';
      document.getElementById('chat').appendChild(div);
      console.log('NewMessage ',message);
});

var sender_name = document.getElementById('sender_name');
var message_content = document.getElementById('message_content');
var send_message = document.getElementById('send_message');

send_message.addEventListener('click',(event)=>{
   event.preventDefault();
   if(sender_name.value=='' || sender_name.value==null){
      alert('Please Enter the sender name to identify it on network!!');
   }else{
      if(message_content.value=='' || message_content.value==null){
         alert('Please Enter some text in message content!!');
      }else{
         // now we are ready to send it to main process
          ipcRenderer.send('NewMessage', {name:sender_name.value,message:message_content.value});
            // we have sent the message now wait from server to recollect it
      }
   }
});



















// Synchronous message emmiter and handler
console.log(ipcRenderer.sendSync('synchronous-message', 'sync ping')) 

// Async message handler
ipcRenderer.on('asynchronous-reply', (event, arg) => {
   console.log(arg)
});

// Async message sender
ipcRenderer.send('asynchronous-message', 'async ping');


/// here what we will do is that we will set references

