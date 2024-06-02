const multer = require("multer");
const path = require("path");

const excelFilter = (req, file, cb) => {
  console.log(`File MIME type: ${file.mimetype}`);
  
  const allowedMimes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/vnd.ms-excel.sheet.macroEnabled.12",
    "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
    "application/octet-stream", // Sometimes browsers send this MIME type
    "application/zip", // Some systems use this for xlsx files
    "application/vnd.ms-office" // Some systems use this for xlsx files
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Please upload only excel file."), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    const fileExt = path.extname(originalName);
    const baseName = path.basename(originalName, fileExt);
    cb(null, `${baseName}-${timestamp}${fileExt}`);
  }
});

const uploadFile = multer({ storage: storage, fileFilter: excelFilter });
module.exports = uploadFile;
