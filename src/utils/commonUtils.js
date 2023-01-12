export const checkQuestionId = (questionId, questionCount) => {
  if (isNaN(questionId)) {
    console.error(`Invalid questionId ${questionId}`);
    return false;
  }

  if (parseInt(questionId) > parseInt(questionCount) || parseInt(questionId) < 0) {
    console.error(`questionId ${questionId} is not in question list`);
    return false;
  }

  return true;
};

export const triggerConstant = async (contractObj, methodName, ...params) => {
  try {
    if (params.length > 0) {
      return await contractObj[methodName](...params).call({ _isConstant: true });
    } else {
      return await contractObj[methodName]().call({ _isConstant: true });
    }
  } catch (err) {
    console.error(`triggerConstant contractObj=${contractObj}, methodName=${methodName}, params=${params}, err=${err}`);
    return "";
  }
};
