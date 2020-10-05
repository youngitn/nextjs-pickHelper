import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './lib/counterSlice';
import formDialogReducer from './lib/formDialogSlice';
import shipmentNoticeTableReducer from './lib/shipmentNoticeTableSlice';
import stockTableReducer from './lib/stockTableSlice';


export default configureStore({
  reducer: {
    counter: counterReducer,
    formDialog: formDialogReducer,
    shipmentNoticeTable: shipmentNoticeTableReducer,
    stockTable: stockTableReducer,

  },
  devTools: true,
});
