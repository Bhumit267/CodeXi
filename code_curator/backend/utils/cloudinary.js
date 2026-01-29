const  {v2 : cloudinary} = require('cloudinary') ;
const {fs} = require('fs');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath) =>{
    try {
        if(!fs.existsSync(localFilePath)){
            return null;
        }

        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })

        fs.unlinkSync(localFilePath);  // remove the locally saved temporary file
        return result;

    } catch (error) {
        console.error("Failed to upload file:", localFilePath, "Error:", error)
        fs.unlinkSync(localFilePath);  // remove the locally saved temporary file
        return null;
    }
}

module.exports= {uploadOnCloudinary}