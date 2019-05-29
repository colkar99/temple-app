const fs = require('fs');
const deleteFiles = (filePath)=>{
    fs.unlink(filePath,(err)=>{
        if(err) {
            throw console.log("Delete error: " + err);
        }
 
    })
}

exports.deleteFiles = deleteFiles;