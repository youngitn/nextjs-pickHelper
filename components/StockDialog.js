import React, { useRef, createRef, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import { selectIsStockDialogOpen, doStockDialogOpen, doStockDialogClose, } from '../lib/formDialogSlice';
import { saveStockData, doMaterialNum } from '../lib/stockTableSlice';
import { useSelector, useDispatch } from 'react-redux';
//import QRReader from './QRReader'
import StockTable from './tables/StockTable';
import { red } from '@material-ui/core/colors';

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

const StockDialog = React.forwardRef(function (props, ref) {
    //const [open, setOpen] = React.useState(false);

    // const handleClickOpen = () => {
    //   setOpen(true);
    // };

    // const handleClose = () => {
    //   setOpen(false);
    // };
    const classes = useStyles();
    const selectIsStockDialogOpeFlag = useSelector(selectIsStockDialogOpen);

    const textInput = useRef();

    const dispatch = useDispatch();
   
    const doClose = () => {
        dispatch(doStockDialogClose());
        dispatch(saveStockData([]));
        dispatch(doMaterialNum(''));
    }

    return (
        <div>

            <Button variant="outlined" onClick={() => dispatch(doStockDialogOpen())}>
                料號庫存查詢
      </Button>
            <Dialog
                fullWidth={true}
                maxWidth='lg'
                ref={ref}
                open={selectIsStockDialogOpeFlag}
                onClose={doClose}
                aria-labelledby="form-dialog-title"
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={doClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            庫存清單
            </Typography>
                    </Toolbar>
                </AppBar>
                <DialogContent >
                    <StockTable></StockTable>
                </DialogContent>
            </Dialog>
        </div>
    );
});

export default StockDialog;