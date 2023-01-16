import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useMatch } from "react-router-dom";
import { message, Button } from "antd";
import { LeftOutlined, RightOutlined, MenuOutlined } from "@ant-design/icons";
import tronLogo from "../assets/images/tron.svg";
import "../assets/styles/header.css";
import {
  setTronObj,
  setCurrentAccount,
  setConnectStatus,
} from "../store/rootReducer";

const AppHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const matchQuestion = useMatch("/questions/:questionId");
  const currentAccount = useSelector((state) => state.rooter.currenAccount);
  const connectStatus = useSelector((state) => state.rooter.connectStatus);
  const currentQuestion = useSelector((state) => state.rooter.currentQuestion);
  const firstQuestion = useSelector((state) => state.rooter.firstQuestion);
  const lastQuestion = useSelector((state) => state.rooter.lastQuestion);

  const initTronLinkWallet = async () => {
    const initTronWeb = (tronWeb) => {
      console.log("initTronWeb tronWeb" + tronWeb);
      tronWeb.setFullNode(process.env.REACT_APP_tronweb_fullHost);
      tronWeb.setHeader({
        "TRON-PRO-API-KEY": process.env.REACT_APP_tronweb_apikey,
      });
      window.tronWeb = tronWeb;
      dispatch(setTronObj({ tronWeb: tronWeb }));
      dispatch(setConnectStatus(true));
      const account = tronWeb.defaultAddress.base58;
      dispatch(setCurrentAccount(account));
      console.log("currentAccount=", account);
    };

    try {
      const tronLinkPromise = new Promise((resolve) => {
        window.addEventListener(
          "tronLink#initialized",
          async () => {
            return resolve(window.tronLink);
          },
          {
            once: true,
          }
        );

        setTimeout(() => {
          if (window.tronLink) {
            return resolve(window.tronLink);
          } else {
            return resolve(false);
          }
        }, 3000);
      });

      const appPromise = new Promise((resolve) => {
        let timeCount = 0;
        const tmpTimer = setInterval(() => {
          timeCount++;
          if (timeCount > 8) {
            clearInterval(tmpTimer);
            return resolve(false);
          }

          if (window.tronLink) {
            clearInterval(tmpTimer);
            if (window.tronLink.ready) {
              return resolve(window.tronLink);
            }
          } else if (
            window.tronWeb &&
            window.tronWeb.defaultAddress &&
            window.tronWeb.defaultaddress.base58
          ) {
            clearInterval(tmpTimer);
            return resolve(window.tronWeb);
          }
        }, 1000);
      });

      Promise.race([tronLinkPromise, appPromise]).then((tron) => {
        console.log("initTronLinkWallet promise", tron);
        if (!tron) {
          message.info("Please install TronLInk");
          console.log("TronLink is not initialized");
          closeConnect();
          return;
        }

        if (tron && tron.defaultAddress && tron.defaultAddress.base58) {
          console.log("tronWeb is initialized already, just setting");
          initTronWeb(tron);
          return;
        }

        const tronLink = tron;
        if (tronLink.ready) {
          console.log("tronLink is ready, just setting");
          const tronWeb = tronLink.tronWeb;
          tronWeb && initTronWeb(tronWeb);
          return;
        } else {
          const res = tronLink.request({ method: "tron_requestAccounts" });
          console.log(`tron_requestAccounts res = ${JSON.stringfy(res)}`);
          if (!res.code) {
            message.info("Please check your TronLink connection");
            return;
          } else {
            if (res.code === 200) {
              const tronWeb = tronLink.tronWeb;
              tronWeb && initTronWeb(tronWeb);
              console.log("get tronWeb from tron_requestAccoutns");
              return;
            }
            if (res.code === 4001) {
              console.log("Please check your TronLink connection");
            }
          }
          closeConnect();
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  const closeConnect = () => {
    dispatch(setTronObj({}));
    dispatch(setConnectStatus(false));
  };

  useEffect(() => {
    function handleTronLinkAction(res) {
      if (res.data.message && res.data.message.action === "accountsChanged") {
      }
    }
    window.addEventListener("message", handleTronLinkAction);

    return () => window.removeEventListener("message", handleTronLinkAction);
  });

  const previousQuestion = () => {
    console.log("previousQuesiton", currentQuestion);
    if (currentQuestion > firstQuestion) {
      const prevId = parseInt(currentQuestion) - 1;
      navigate(`/questions/${prevId}`);
    } else {
      message.info("it's first question!");
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < lastQuestion) {
      const nextId = parseInt(currentQuestion) + 1;
      navigate(`/question/${nextId}`);
    } else {
      message.info("it's last question!");
    }
  };

  return (
    <nav className="flex header-box">
      <div className="flex header-left">
        <img
          src={tronLogo}
          alt=""
          className="tron-logo"
          onClick={() => navigate("/")}
        />
      </div>
      {matchQuestion ? (
        <div className="flex header-center">
          <Button onClick={previousQuestion}>
            <LeftOutlined />
          </Button>
          <span className="question-list">
            <Button type="text" onClick={() => navigate("/")}>
              <MenuOutlined />
              Question List
            </Button>
          </span>
          <Button onClick={nextQuestion}>
            <RightOutlined />
          </Button>
        </div>
      ) : (
        <></>
      )}
      <div className="flex header-right">
        <Button className="connect-wallet" onClick={initTronLinkWallet}>
          {currentAccount && currentAccount.length > 0
            ? currentAccount
            : "Connect Wallet"}
        </Button>
      </div>
    </nav>
  );
};

export default AppHeader;
