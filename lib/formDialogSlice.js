import { createSlice } from '@reduxjs/toolkit';


//action
export const formDialogSlice = createSlice({
    name: 'formDialog',
    initialState: {
        isBarcodeDialogOpen: false,
        isFinishDialogOpen: false,
        isStockDialogOpen: false,

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


    },
});

export const { doBarcodeDialogClose, doBarcodeDialogOpen, doFinishDialogOpen, doFinishDialogClose, doStockDialogOpen, doStockDialogClose } = formDialogSlice.actions;



//export selectFormDialogOpen = state
export const selectIsBarcodeDialogOpen = state => state.formDialog.isBarcodeDialogOpen;
export const selectIsFinishDialogOpen = state => state.formDialog.isFinishDialogOpen;
export const selectIsStockDialogOpen = state => state.formDialog.isStockDialogOpen;

export default formDialogSlice.reducer;
