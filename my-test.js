exports.handler = function (event, context) {
    console.log("REQUEST RECEIVED:\n" + JSON.stringify(event));
    if (event.RequestType === "Delete") {
      response.send(event, context, "FAILED");
    } else {
      response.send(event, context, "SUCCESS");
    }
  };