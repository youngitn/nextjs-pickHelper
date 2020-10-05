import { createSlice } from '@reduxjs/toolkit';
//記得將slice加到store裡面

//action
export const shipmentNoticeTableSlice = createSlice({
    name: 'shipmentNoticeTable',
    initialState: {
        tableData: [],
        shipmentNoticeNum: ''//出通單單號
    },
    reducers: {
        //將view component丟進來的data放到狀態中(全域)
        doShipmentNoticeNum: (state, action) => {

            state.shipmentNoticeNum = action.payload;
        },

        //將view component丟進來的data放到狀態中(全域)
        saveShipmentNoticeData: (state, action) => {
            state.tableData = action.payload;
        },

    },
});


export const { saveShipmentNoticeData, doShipmentNoticeNum } = shipmentNoticeTableSlice.actions;


export const selectShipmentNoticeData = state => state.shipmentNoticeTable.tableData;

export const selectShipmentNoticeNum = state => state.shipmentNoticeTable.shipmentNoticeNum;

export default shipmentNoticeTableSlice.reducer;
