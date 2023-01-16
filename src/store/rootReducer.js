import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tronObj: {},
  connectStatus: false,
  currentAccount: "",
  questionCount: 0,
  currentQuestion: 0,
  firstQuestionId: 0,
  lastQuestionId: 0,
};

export const rooterSlice = createSlice({
  name: "rooter",
  initialState,
  reducers: {
    setTronObj: (state, action) => {
      state.tronObj = action.payload;
    },
    setConnectStatus: (state, action) => {
      state.connectStatus = action.payload;
    },
    setCurrentAccount: (state, action) => {
      state.currentAccount = action.payload;
    },
    setQuestionCount: (state, action) => {
      const cnt = parseInt(action.payload, 10);
      state.questionCount = cnt;
      state.lastQuestionId = cnt > 1 ? cnt - 1 : 0;
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
    },
    setFirstQuestionId: (state, action) => {
      state.firstQuestionId = action.payload;
    },
  },
});

export const {
  setTronObj,
  setConnectStatus,
  setCurrentAccount,
  setQuestionCount,
  setCurrentQuestion,
  setFirstQuestionId,
} = rooterSlice.actions;

export default rooterSlice.reducer;
