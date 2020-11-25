var AWS = require('aws-sdk');
var response = require('cfn-response');
var S3 = new AWS.S3();

/**
 * This handler is executed before s3 buckets are created, updated or deleted.
 * All elements in a bucket will be deleted before a s3 resource will be deleted by the cloud formation stack.
 * The bucket name is given to this function as a parameter.
 *
 * The source is inspoired by: https://www.codota.com/code/javascript/functions/aws-sdk/S3/listObjectsV2
 */
exports.handler = function (event, context) {
  console.log("REQUEST RECEIVED:\n" + JSON.stringify(event));
  if (event.RequestType === "Delete") {
    // empty S3 bucket if cloud formation raises a DELETE event
    emptyS3Directory(event.ResourceProperties.BucketName)
      .then(() => {
        response.send(event, context, "SUCCESS");
      })
      .catch((err) => {
        response.send(event, context, "FAILED", { Error: err });
      });
  } else {
    response.send(event, context, "SUCCESS");
  }
};

/**
 * Remove all elements in a s3 bucket.
 * Because the s3 "listObject" function returns maximal 1000 items, this functionw ill be executed recursively.
 */
async function emptyS3Directory(bucket) {
  const listParams = {
    Bucket: bucket
  };

  const listedObjects = await S3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) {
    return;
  }

  const deleteParams = {
    Bucket: bucket,
    Delete: {
      Objects: getDeleteObjects(listedObjects),
    },
  };

  await S3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) {
    await emptyS3Directory(bucket);
  }
}

/**
 * Small helper function to reduces s3 objects to the object keys.
 */
function getDeleteObjects(listedObjects) {
  return listedObjects.Contents.reduce(
    (array, { Key }) => [
      ...array,
      {
        Key,
      },
    ],
    [],
  );
}