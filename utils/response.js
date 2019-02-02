let sendSuccessResponse = (res, dataObj) => {
  dataObj.status = "success";
  res.send(dataObj);
};

let sendErrorResponse = (res, errorCode, message) => {
    res.status(errorCode).send({status: "fail", message: message});
};

module.exports = {
    sendSuccessResponse: sendSuccessResponse,
    sendErrorResponse: sendErrorResponse
};