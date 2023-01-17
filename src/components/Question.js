import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Spin, Form, Button, Input, InputNumber, message } from "antd";
import { CodeOutlined } from "@ant-design/icons";
import "../assets/styles/question.css";
import { setQuestionCount, setCurrentQuestion } from "../store/rootReducer";
import { triggerConstant, checkQuestionId } from "../utils/commonUtils";

const Question = () => {
  const testCaseAbi = process.env.REACT_APP_test_case_abi_temp;
  const dispatch = useDispatch();
  const { questionId } = useParams();
  const tronObj = useSelector((state) => state.rooter.tronObj);
  const currentAccount = useSelector((state) => state.rooter.currentAccount);
  const verifierAddr = process.env.REACT_APP_verifier;

  const [loading, setLoading] = useState(false);
  const [questionInfo, setQuestionInfo] = useState({});
  const [answerAddress, setAnswerAddress] = useState("");
  const [verifierObj, setVerifierObj] = useState(null);
  const [callValue, setCallValue] = useState(100);

  useEffect(() => {
    dispatch(setCurrentQuestion(questionId));
  }, [dispatch, questionId]);

  useEffect(() => {
    const buildFirstTestCase = (tc) => {
      const f = (p) => {
        if (p) {
          if (Array.isArray(p)) {
            return `[${p.map((i) => tronObj.tronWeb.toDecimal(i)).join(", ")}]`;
          } else {
            return tronObj.tronWeb.toAscii(p);
          }
        } else {
          return "";
        }
      };
      if (tc) {
        return (
          <>
            <h3>Test Case</h3>
            <p>
              input {f(tc[0].input)}
              <br />
              output {f(tc[0].output)}
            </p>
          </>
        );
      } else {
        return <></>;
      }
    };

    async function fetchQuestionInfo() {
      setLoading(true);
      const tronWeb = tronObj.tronWeb;
      try {
        let verifier = await tronWeb.contract().at(verifierAddr);
        setVerifierObj(verifier);
        const questionCountHex = await triggerConstant(
          verifier,
          "getQuestionCount"
        );
        const cnt = parseInt(tronWeb.toDecimal(questionCountHex));
        if (cnt > 0) {
          if (checkQuestionId(questionId, cnt)) {
            const winner = await triggerConstant(
              verifier,
              "winner",
              questionId
            );
            const winnerPrize = await triggerConstant(
              verifier,
              "prizePool",
              questionId,
              0
            );
            const questionOwnerPrize = await triggerConstant(
              verifier,
              "prizePool",
              questionId,
              1
            );
            const questionHex = await triggerConstant(
              verifier,
              "registeredQuestionList",
              questionId
            );
            let questionObj = await tronWeb.contract().at(questionHex);
            const title = await triggerConstant(questionObj, "title");
            const desc = await triggerConstant(questionObj, "description");

            // fetch question test cases
            let firstTestCase;
            const testCaseCount = await triggerConstant(
              questionObj,
              "testCaseCount"
            );
            const tcCnt = parseInt(tronWeb.toDecimal(testCaseCount));
            if (tcCnt < 1) {
              console.warn(`empty test cases of question ${questionId}`);
            } else {
              const tcHex = await triggerConstant(
                questionObj,
                "getTestCasesById",
                0
              );
              const inputTypeHex = await triggerConstant(
                questionObj,
                "inputType"
              );
              const outputTypeHex = await triggerConstant(
                questionObj,
                "outputType"
              );
              let tcAbi = testCaseAbi
                .replace("inputType", inputTypeHex)
                .replace("outputType", outputTypeHex);
              console.log(
                "tcAbi=",
                tcAbi,
                "inputTypeHex=",
                inputTypeHex,
                "outputTypeHex=",
                outputTypeHex,
                "tcHex=",
                tcHex
              );
              let tc = tronWeb.utils.abi.decodeParams(JSON.parse(tcAbi), tcHex);
              firstTestCase = buildFirstTestCase(tc);
            }
            setQuestionInfo({
              winner: tronWeb.address.fromHex(winner),
              winnerPrize: tronWeb.toDecimal(winnerPrize),
              questionOwnerPrize: tronWeb.toDecimal(questionOwnerPrize),
              questionId: questionId,
              questionAddress: {
                hex: questionHex,
                base58: tronWeb.address.fromHex(questionHex),
              },
              title: title,
              description: desc,
              firstTestCase: firstTestCase,
            });
          }
          dispatch(setQuestionCount(cnt));
        }
        setLoading(false);
      } catch (err) {
        console.log("fetchQuestionInfo", err);
        setLoading(false);
      }
    }

    tronObj && tronObj.tronWeb && fetchQuestionInfo();
  }, [dispatch, questionId, testCaseAbi, tronObj, verifierAddr]);

  const handleVerify = async () => {
    if (tronObj && tronObj.tronWeb && verifierObj) {
      if (!answerAddress) {
        message.info("please input answer address!");
        return;
      }
      if (!callValue) {
        message.info("please deposit at least one sun for answer verify");
        return;
      }

      verifierObj
        .verify(parseInt(questionId), answerAddress)
        .send({
          feeLimit: 100_000_000,
          callValue: callValue,
          shouldPollResponse: true,
        })
        .then((res) => {
          console.log("verify response", res);
          if (res) {
            message.info("Congratulations, your answer passed all test cases!");
          } else {
            message.warning("Your answer verify failed");
          }
        });
    } else {
      message.info("Please connect TronLink wallet!");
    }
  };

  const isWinner = () => {
    if (questionInfo && questionInfo.winner && questionInfo.winnerPrize) {
      return questionInfo.winner === currentAccount;
    } else {
      return false;
    }
  };

  const handleWinnerWithdraw = async () => {
    if (tronObj && tronObj.tronWeb && verifierObj) {
      verifierObj
        .withdrawByWinner(questionId)
        .send()
        .then((res) => {
          if (res) {
            console.log("txId=", res);
          }
        });
    } else {
      message.info("Please connect TronLink wallet!");
    }
  };

  const isQuestionOwner = () => {
    if (
      questionInfo &&
      questionInfo.winner &&
      questionInfo.questionOwnerPrize
    ) {
      return questionInfo.questionOwner === currentAccount;
    } else {
      return false;
    }
  };

  const handleQuestionOwnerWithdraw = async () => {
    if (tronObj && tronObj.tronWeb && verifierObj) {
      verifierObj
        .withdrawByQuestionOwner(questionId)
        .send()
        .then((res) => {
          if (res) {
            console.log("txId=", res);
          }
        });
    } else {
      message.info("Please connect TronLink wallet!");
    }
  };

  const questionBox = () => {
    const buildQuestionTitle = () => {
      let t = "";
      if (questionInfo.questionId) {
        t = questionInfo.questionId + ". ";
      }

      if (questionInfo.title) {
        t = t + questionInfo.title;
      }

      return t;
    };

    if (questionInfo && questionInfo.questionId) {
      return (
        <div className="question-box">
          <div className="question-title">
            <h2 className="question-title-text">{buildQuestionTitle()}</h2>
          </div>
          <div className="question-description">
            <p className="question-description-text">
              {questionInfo.description}
            </p>
          </div>
          <div className="question-testcases">{questionInfo.firstTestCase}</div>
          <div className="code-answer">
            <Button
              type="primary"
              className="btn"
              icon={<CodeOutlined />}
              onClick={() =>
                window.open(
                  "https://tronide.io/#version=soljson_v0.8.6+commit.0e36fba.js&optimize=false&runs=200&gist=9ec9627ea8d2878bc500c9f06676ade3",
                  "_blank"
                )
              }
            >
              Code Answer
            </Button>
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      <div className="left flex">
        {loading ? (
          <div className="question-box-spin">
            <Spin />
          </div>
        ) : (
          questionBox()
        )}
      </div>
      <div className="group-line flex"></div>
      <div className="right flex">
        <div className="verify-box">
          <Form
            name="basic"
            className="form"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 16 }}
          >
            <Form.Item label="Answer Address">
              <Input
                className="input"
                placeholder="Answer Address"
                onChange={(e) => setAnswerAddress(e.target.value)}
                defaultValue={answerAddress}
                maxLength={64}
              />
            </Form.Item>
            <Form.Item label="Call Value">
              <InputNumber
                className="input"
                placeholder="callValue"
                onChange={(value) => setCallValue(parseInt(value, 10))}
                defaultValue={callValue}
                maxLength={64}
                addonAfter="sun (1 TRX = 1,000,000 SUN)"
              />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
              <Button type="primary" className="btn" onClick={handleVerify}>
                Verify
              </Button>
              {isWinner() && (
                <Button
                  type="default"
                  className="btn"
                  onClick={handleWinnerWithdraw}
                >
                  Winner Withdraw
                </Button>
              )}
              {isQuestionOwner() && (
                <Button
                  type="default"
                  className="btn"
                  onClick={handleQuestionOwnerWithdraw}
                >
                  Question Owner Withdraw
                </Button>
              )}
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Question;
