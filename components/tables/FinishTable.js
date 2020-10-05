import React from "react";

import MUIDataTable from "mui-datatables";

import { useSelector } from 'react-redux';
import { selectShipmentNoticeData } from '../../lib/shipmentNoticeTableSlice';


import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import shipNoticeColumns from '../tableColumns/ShipNoticeDataTableColumns';




export default function FinishTable() {




    const shipmentNoticeData = useSelector(selectShipmentNoticeData);

    const expandDataOptions = {
        selectableRowsHeader: false,
        selectToolbarPlacement: 'none',
        download: false,
        print: false,
        filter: false,
        search: false,
        viewColumns: false,
        selectableRows: 'none',
        pagination: false,
        rowStyle: {
            backgroundColor: '#EEE',
        },

    }
    const expandDataColumns = [
        {
            name: "inag006",
            label: "批號",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "inag100",
            label: "庫位",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "inag005",
            label: "儲位",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "inag007",
            label: "庫存單位",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "shipQty",
            label: "出貨數量",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "id",
            label: "id",
            options: {
                filter: true,
                sort: false,
                display: false,
            }
        },
        {
            name: "inag001",
            label: "料號",
            options: {
                filter: true,
                sort: false,
                display: false,
            }
        },
    ];


    const options = {
        selectableRowsHeader: false,
        selectToolbarPlacement: 'none',
        download: false,
        print: false,
        filter: false,
        search: false,
        viewColumns: false,
        selectableRows: 'none',
        expandableRows: true,
        expandableRowsHeader: false,
        expandableRowsOnClick: true,


        isRowExpandable: (dataIndex, expandedRows) => {
            // 限制能開啟擴展資訊的筆數 (but allow those already expanded to be collapsed)
            if (expandedRows.data.length > 2 && expandedRows.data.filter(d => d.dataIndex === dataIndex).length === 0) return false;
            return true;
        },

        renderExpandableRow: (rowData, rowMeta) => {


            if (_.isUndefined(rowData[6]) && _.isNull(rowData[6]) && _.size(rowData[6]) == 0) {


                return false;
            }
            return (

                <TableRow>
                    <TableCell colSpan={5}>

                        <MUIDataTable
                            columns={expandDataColumns}
                            data={rowData[6]}
                            options={expandDataOptions}
                        />

                    </TableCell>

                </TableRow>

            );
        },

        setRowProps: row => {
            if (row[0] === "ok") {
                return {
                    style: { background: "rgba(59, 216, 63, 0.94)" }
                };
            }
        },
        //filterType: "dropdown",
        // responsive,
        // tableBodyHeight,
        // tableBodyMaxHeight

    };
    const columns = shipNoticeColumns.FinishDataTableColumns;

    return (
        <>
            <MUIDataTable
                title={"出通單檢貨結果"}
                data={shipmentNoticeData}
                columns={columns}
                options={options}
            />
        </>
    );
}