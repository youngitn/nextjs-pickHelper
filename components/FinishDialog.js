import React, { useRef, createRef, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import { selectIsFinishDialogOpen, doFinishDialogOpen, doFinishDialogClose, } from '../lib/formDialogSlice';

import { useSelector, useDispatch } from 'react-redux';
//import QRReader from './QRReader'
import FinishTable from './tables/FinishTable';
import LocalPrintshopIcon from '@material-ui/icons/LocalPrintshop';
import { red, grey } from '@material-ui/core/colors';
import { Grid } from '@material-ui/core';
import { apiTWVPt100 } from '../api';
import { selectShipmentNoticeData } from '../lib/shipmentNoticeTableSlice';
import _ from 'lodash';
import {shipperCreate} from '../lib/shipmentActions';
const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
        backgroundColor: red[500]
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
}));


const ColorBtn = withStyles((theme) => ({
    root: {
        color: theme.palette.getContrastText(grey[200]),
        backgroundColor: grey[200],
        '&:hover': {
            backgroundColor: red[200],
        },
    },
}))(Button);
const FinishDialog = React.forwardRef(function (props, ref) {
    //const [open, setOpen] = React.useState(false);

    // const handleClickOpen = () => {
    //   setOpen(true);
    // };

    // const handleClose = () => {
    //   setOpen(false);
    // };

    const shipmentNoticeData = useSelector(selectShipmentNoticeData);
    const classes = useStyles();
    const selectIsFinishDialogFlag = useSelector(selectIsFinishDialogOpen);

    const textInput = useRef();

    const dispatch = useDispatch();

    const doClose = () => {
        dispatch(doFinishDialogClose());
    }
    const doShipperCreate = () =>{

        const set = new Set();
        const rel = shipmentNoticeData.filter(item => !set.has(item.xmdhdocno) ? set.add(item.xmdhdocno) : false);
        
        let temp =[];
        let x =[];
        let i = 0;
        set.forEach(element => {
            
            temp[i] = shipmentNoticeData.filter((item) => _.eq(item.xmdhdocno,element ) && !_.isUndefined(item.stockToShipDatas));
            i++;

        });
        temp = temp.filter((item) => item.length != 0 );
        //console.log(temp);
        temp.forEach(element => {
            shipperCreate(element);
            //console.log(element);
        });
       
    }
    

    return (
        <div>

            <Button variant="outlined" onClick={() => dispatch(doFinishDialogOpen())}>
                檢貨結果
            </Button>
            <Dialog
                fullWidth={true}
                maxWidth='lg'
                ref={ref}
                open={selectIsFinishDialogFlag}
                onClose={doClose}
                aria-labelledby="form-dialog-title"
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <Grid container direction="row" justify="space-between" alignItems="center" spacing={3}>
                            <Grid item xs={12} md={3} lg={3}>
                                <IconButton
                                    edge="start"
                                    color="inherit"
                                    onClick={doClose}
                                    aria-label="close"
                                >
                                    <CloseIcon />
                                    <Typography variant="h6" className={classes.title}>
                                        檢貨結果
                                    </Typography>
                                </IconButton>
                            </Grid>
                            <Grid item xs={12} md={3} lg={3}>
                                <ColorBtn
                                    edge="end"
                                    fullWidth={true}
                                    onClick={doShipperCreate}
                                    aria-label="close"
                                    endIcon={<LocalPrintshopIcon />}
                                >
                                    建立出貨單
                        </ColorBtn>
                            </Grid>

                        </Grid>
                    </Toolbar>
                </AppBar>
                <DialogContent >
                    <FinishTable />
                </DialogContent>
            </Dialog>
        </div>
    );
});

export default FinishDialog;