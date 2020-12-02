import { createSlice } from '@reduxjs/toolkit';
//記得將slice加到store裡面

//action
export const shipmentNoticeTableSlice = createSlice({
    name: 'shipmentNoticeTable',
    initialState: {
        tableData: [],
        shipmentNoticeNum: '',//出通單單號
        lastShipNo:'尚無出貨單產生'
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

        saveLastShipNo: (state, action) => {
            state.lastShipNo = action.payload;
        }

    },
});

export const preWork = (data) => {

    const map1 = data.map((x) => {
        x.shipQty = 0;
        return x;
    });

    return map1;
}
export const doDataCheck = (data) => {
    const map1 = data.map((x, i) => {

        if (x.shipQty !== 0) {
            x.isCheckOk = 'ok';

        }

        return x;
    });

    return map1;
}



export const { saveShipmentNoticeData, doShipmentNoticeNum, saveLastShipNo } = shipmentNoticeTableSlice.actions;

//export const { preWork, doDataCheck } = shipmentNoticeTableSlice.funcs;

export const selectShipmentNoticeData = state => state.shipmentNoticeTable.tableData;

export const selectShipmentNoticeNum = state => state.shipmentNoticeTable.shipmentNoticeNum;

export const selectLastShipNo = state => state.shipmentNoticeTable.lastShipNo;

export default shipmentNoticeTableSlice.reducer;
