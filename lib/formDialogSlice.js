import { createSlice } from '@reduxjs/toolkit';


//action
export const formDialogSlice = createSlice({
    name: 'formDialog',
    initialState: {
        isBarcodeDialogOpen: false,
        isFinishDialogOpen: false,
        isStockDialogOpen: false,
        //0 一般 1 客戶
        dialogType: 0

    },
    reducers: {

        doBarcodeDialogOpen: state => {

            state.isBarcodeDialogOpen = true;
        },
        doBarcodeDialogClose: state => {

            state.isBarcodeDialogOpen = false;

        },
        doFinishDialogOpen: state => {

            state.isFinishDialogOpen = true;
        },
        doFinishDialogClose: state => {

            state.isFinishDialogOpen = false;
        },
        doStockDialogOpen: state => {

            state.isStockDialogOpen = true;
        },
        doStockDialogClose: state => {

            state.isStockDialogOpen = false;
            

        },
        //設置全域dialog狀態 
        setCurrentDialogType: (state, action) => {

            state.dialogType = action.payload;
        },

    },
});

export const { doBarcodeDialogClose, doBarcodeDialogOpen, doFinishDialogOpen, doFinishDialogClose, doStockDialogOpen, doStockDialogClose, setCurrentDialogType } = formDialogSlice.actions;



//export selectFormDialogOpen = state
export const selectIsBarcodeDialogOpen = state => state.formDialog.isBarcodeDialogOpen;
export const selectIsFinishDialogOpen = state => state.formDialog.isFinishDialogOpen;
export const selectIsStockDialogOpen = state => state.formDialog.isStockDialogOpen;
export const selectDialogType = state => state.formDialog.dialogType;

export default formDialogSlice.reducer;
