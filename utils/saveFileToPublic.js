const fs = require("fs");
const path = require("path");
const saveFileToPublic = (file, type, prevName)=>{
    let filePath = path.join(__dirname, "../public");
    let name = new Date().getTime().toString() + "." + file.originalname.split(".").pop();
    if(prevName){
        name = prevName;
    }
    let pathWithFileName = path.join(__dirname, `../public/${name}`);
    if(type === "profile"){
        filePath = path.join(__dirname, "../public/profiles");
        pathWithFileName = path.join(__dirname, `../public/profiles/${name}`);
    }
    if(!fs.existsSync(filePath)){
        fs.mkdirSync(filePath, {recursive: true});
    };

    fs.writeFileSync(pathWithFileName, file.buffer);
    return name;
}

module.exports = saveFileToPublic;