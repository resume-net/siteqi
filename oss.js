const AWS = require('aws-sdk');
const mysql = require('mysql2');

// AWS S3配置
AWS.config.update({
  accessKeyId: 'YOUR_ACCESS_KEY',
  secretAccessKey: 'YOUR_SECRET_KEY',
  region: 'YOUR_REGION'
});

const s3 = new AWS.S3();

// MySQL连接
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'your_database'
});

connection.connect();

// 生成临时下载URL
function generateDownloadPresignedUrl(key, expiration = 3600) {
  const params = {
    Bucket: 'your_bucket',
    Key: key,
    Expires: expiration
  };
  return s3.getSignedUrl('getObject', params);
}

// 生成临时上传URL
function generateUploadPresignedUrl(key, expiration = 3600) {
  const params = {
    Bucket: 'your_bucket',
    Key: key,
    Expires: expiration,
    ContentType: 'application/octet-stream'
  };
  return s3.getSignedUrl('putObject', params);
}

// 存储URL到SQL
function storePresignedUrl(url, type, uuid, connection) {
  const query = 'INSERT INTO presigned_urls (url, type, uuid) VALUES (?,?,?)';
  connection.query(query, [url, type, uuid], (error, results, fields) => {
    if (error) throw error;
    console.log('Presigned URL stored successfully');
  });
}